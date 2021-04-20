import {vec3, vec4, mat3, mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"
import {mat4_to_string, vec_to_string, mat4_matmul_many} from "./icg_math.js"


export function init_scene(regl, resources) {

	const ambient_pass_pipeline = regl({
		attributes: {
			position: regl.prop('mesh.vertex_positions'),
			color:    regl.prop('mesh.vertex_color'),
		},
		// Faces, as triplets of vertex indices
		elements: regl.prop('mesh.faces'),

		// Uniforms: global data available to the shader
		uniforms: {
			mat_mvp:     regl.prop('mat_mvp'),
			light_color: regl.prop('ambient_light_color'),
		},	

		vert: resources.shader_ambient_vert,
		frag: resources.shader_ambient_frag,

		cull: {enable: false},
	});
	
	function update_simulation(scene_info) {
		scene_info.actors.forEach(actor => {
			if (actor.animation_tick) {
				actor.animation_tick(actor, scene_info);
			}
		});
	}

	function render_ambient({actors, mat_view, mat_projection, ambient_light_color}) {
		const batch_draw_calls = actors.map((actor) => {
			const mat_model      = actor.mat_model;
			const mat_mvp        = mat4.create();
			const mat_model_view = mat4.create();

			mat4_matmul_many(mat_model_view, mat_view, mat_model);
			mat4_matmul_many(mat_mvp, mat_projection, mat_model_view);

			return {
				mesh:        actor.mesh,
				mat_mvp:     mat_mvp,
				ambient_light_color: ambient_light_color,
			}
		});

		ambient_pass_pipeline(batch_draw_calls);
	};

	const scene_actors = [
		{ // static part of scene
			mesh:      resources.mesh_terrain,
			mat_model: mat4.create(),
		},
		{ // rotating ring of objects
			mesh: resources.mesh_wheel,
			mat_model: mat4.create(),
			animation_tick: (actor, {sim_time}) => {
				actor.mat_model = mat4.fromZRotation(mat4.create(), sim_time * 0.1);
			},
		},
	];

	return {
		actors: scene_actors,
		update_simulation,
		render_ambient,
	}
}

