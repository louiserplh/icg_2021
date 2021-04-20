import {vec3, vec4, mat3, mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"
import {icg_mesh_make_cube} from "./icg_mesh.js"
import {deg_to_rad, mat4_to_string, vec_to_string, mat4_matmul_many, transform3DPoint, vec3FromVec4, vec4FromVec3} from "./icg_math.js"


export function init_light(regl, resources) {
	// The shadow map buffer is shared by all the lights
	const shadow_cubemap = regl.framebufferCube({
		radius:      1024,
		colorFormat: 'rgba', // GLES 2.0 doesn't support single channel textures : (
		colorType:   'float',
	});

	const annotation_cubemap = regl.cube({
		radius:      512,
		colorFormat: 'rgba',
		colorType:   'uint8',
		mag: 'linear',
		min: 'linear', 
		faces: [0, 1, 2, 3, 4, 5].map(side_idx => resources[`tex_cube_side_${side_idx}`]),
	});


	const shadowmap_generation_pipeline = regl({
		attributes: {
			position: regl.prop('mesh.vertex_positions'),
		},
		// Faces, as triplets of vertex indices
		elements: regl.prop('mesh.faces'),

		// Uniforms: global data available to the shader
		uniforms: {
			mat_mvp:        regl.prop('mat_mvp'),
			mat_model_view: regl.prop('mat_model_view'),
		},

		vert: resources.shader_shadowmap_gen_vert,
		frag: resources.shader_shadowmap_gen_frag,

		// Where the result gets written to:
		framebuffer: regl.prop('out_buffer'),
	});

	const phong_lighting_pipeline = regl({
		attributes: {
			position:       regl.prop('mesh.vertex_positions'),
			normal:         regl.prop('mesh.vertex_normals'),
			diffuse_color:  regl.prop('mesh.vertex_color'),
			specular_color: regl.prop('mesh.vertex_color'),
		},
		// Faces, as triplets of vertex indices
		elements: regl.prop('mesh.faces'),

		// Uniforms: global data available to the shader
		uniforms: {
			mat_mvp:        regl.prop('mat_mvp'),
			mat_model:      regl.prop('mat_model'),
			mat_model_view: regl.prop('mat_model_view'),
			mat_normals:    regl.prop('mat_normals'),

			light_position:  regl.prop('light_position'),
			light_color:     regl.prop('light_color'),
			shadow_cubemap:  shadow_cubemap,

			shininess: 0.8,
		},

		vert: resources.shader_phong_shadow_vert,
		frag: resources.shader_phong_shadow_frag,

		// The depth buffer needs to be filled before calling this pipeline,
		// otherwise our additive blending mode can accumulate contributions
		// from fragments that should be invisible.
		// (The depth buffer is filled by the ambient pass.)

		/* Todo 6.2.3
		    change the blend options
		*/
		blend: {
		},

		depth: {
			enable: true,
			mask: true,
			func: '<=',
		},

		cull: {enable: false},
	});

	const flattened_cubemap_pipeline = regl({
		attributes: {
			position: [
				[0., 0.],
				[3., 0.],
				[3., 2.],
				[0., 2.],
			],
		},
		elements: [
			[0, 1, 2], // top right
			[0, 2, 3], // bottom left
		],
		uniforms: {
			cubemap_to_show: shadow_cubemap,
			cubemap_annotation: annotation_cubemap,
			preview_rect_scale: ({viewportWidth, viewportHeight}) => {
				const aspect_ratio = viewportWidth / viewportHeight;

				const width_in_viewport_units = 0.8;
				const heigh_in_viewport_units = 0.4 * aspect_ratio;

				return [
					width_in_viewport_units / 3.,
					heigh_in_viewport_units / 2.,
				];
			},
		},
		vert: resources.shader_vis_vert,
		frag: resources.shader_vis_frag,
	});

	const mesh_cube = icg_mesh_make_cube();
	const cube_pipeline = regl({
		attributes: {
			position: mesh_cube.vertex_positions,
		},
		elements: mesh_cube.faces,
		uniforms: {
			light_distance_cubemap: shadow_cubemap,
			annotation_cubemap: annotation_cubemap,
			mat_mvp:        regl.prop('mat_mvp'),
			mat_model_view: regl.prop('mat_model_view'),
		},
		vert: resources.shader_viscube_vert,
		frag: resources.shader_viscube_frag,
		cull: {enable: false},
	});

	/*
	TODO 6.1.1 cube_camera_projection:
		Construct the camera projection matrix which has a correct light camera's view frustum.
		please use the function perspective, see https://stackoverflow.com/questions/28286057/trying-to-understand-the-math-behind-the-perspective-matrix-in-webgl
		Note: this is the same for all point lights/cube faces!
	*/
	const cube_camera_projection = mat4.create(); // please use mat4.perspective(mat4.create(), fovy, aspect, near, far);

	class Light {
		constructor({position, color, intensity, update} = {color: [1., 0.5, 0.], intensity: 5, update: null}) {
			this.position = position;
			this.color = color;
			this.intensity = intensity;
			this.update_simulation_func = update;
		}

		update_simulation(sim_info) {
			if (this.update_simulation_func) {
				this.update_simulation_func(this, sim_info);
			}
		}

		cube_camera_view(side_idx, scene_view) {
			/*
			Todo 6.1.2 cube_camera_view:
				Construct the camera matrices which look through one of the 6 cube faces
				for a cube aligned with the eye coordinate axes.
				These faces are indexed in the order: +x, -x, +y, -y, +z, -z.
				So when `side_idx = 0`, we should return the +x camera matrix,
				and when `side_idx = 5`, we should return the -z one.
			 */

			return mat4.create();
		}

		get_cube_camera_projection() {
			return cube_camera_projection;
		}

		render_shadowmap(scene_info) {
			const actors = scene_info.actors;
			const scene_view = scene_info.scene_mat_view;

			for(let side_idx = 0; side_idx < 6; side_idx ++) {
				const out_buffer = shadow_cubemap.faces[side_idx];

				// clear buffer, set distance to max
				regl.clear({
					color: [0, 0, 0, 1],
					depth: 1,
					framebuffer: out_buffer,
				});

				const batch_draw_calls = actors.map(actor => {
					const mat_model_view = mat4.create();
					mat4.multiply(mat_model_view, this.cube_camera_view(side_idx, scene_view), actor.mat_model);
					const mat_mvp = mat4.create();
					mat4_matmul_many(mat_mvp, cube_camera_projection, mat_model_view);

					return {
						mesh: actor.mesh,
						mat_mvp: mat_mvp,
						mat_model_view: mat_model_view,
						out_buffer: out_buffer,
					};
				});

				// Measure new distance map
				shadowmap_generation_pipeline(batch_draw_calls);
			}
		}

		draw_phong_contribution({actors, mat_view, mat_projection}) {
			const light_position_cam = vec3FromVec4(vec4.transformMat4(vec4.create(), vec4FromVec3(this.position, 1.0), mat_view));

			const batch_draw_calls = actors.map((actor) => {
				const mat_mvp        = mat4.create();
				const mat_model_view = mat4.create();
				const mat_normals    = mat3.create();

				mat4_matmul_many(mat_model_view, mat_view, actor.mat_model);
				mat4_matmul_many(mat_mvp, mat_projection, mat_model_view);

				mat3.fromMat4 (mat_normals, mat_model_view);
				mat3.transpose(mat_normals, mat_normals);
				mat3.invert   (mat_normals, mat_normals);

				return {
					mesh:           actor.mesh,
					mat_mvp:        mat_mvp,
					mat_model:      actor.mat_model,
					mat_model_view: mat_model_view,
					mat_normals:    mat_normals,

					light_position:  light_position_cam,
					light_color:     vec3.scale(vec3.create(), this.color, this.intensity),
				}
			});

			phong_lighting_pipeline(batch_draw_calls);
		}

		visualize_distance_map() {
			flattened_cubemap_pipeline();
		}

		// Note: mat_view can differ from scene_mat_view, e.g. when viewing from cube_camera_view
		visualize_cube({mat_view, scene_mat_view, mat_projection}) {
			const light_position_view = transform3DPoint(scene_mat_view, this.position);
			const m_translation = mat4.fromTranslation(mat4.create(), light_position_view); // place cube at the light position in eye space

			const m_model_view = mat4_matmul_many(mat4.create(), mat_view, mat4.invert(mat4.create(), scene_mat_view), m_translation, mat4.fromScaling(mat4.create(), [0.4, 0.4, 0.4]));
			const m_mvp = mat4_matmul_many(mat4.create(), mat_projection, m_model_view);

			cube_pipeline({
				mat_model_view: m_model_view,
				mat_mvp: m_mvp,
			});
		}
	}

	return Light;
}
