
import {load_text} from "./icg_web.js"
import {framebuffer_to_image_download} from "./icg_screenshot.js"
import {load_mesh_obj} from "./icg_mesh.js"
import * as vec3 from "../lib/gl-matrix_3.3.0/esm/vec3.js"
import {compute_triangle_normals_and_angle_weights, compute_vertex_normals} from "./normal_computation.js"

const mesh_quad_2d = {
	position: [
		// 4 vertices with 2 coordinates each
		[-1, -1],
		[1, -1],
		[1, 1],
		[-1, 1],
	],
	faces: [
		[0, 1, 2], // top right
		[0, 2, 3], // bottom left
	],
}

export class Raytracer {
	constructor({resolution, scenes}) {
		this.resolution = resolution
		this.scenes = scenes
		this.scenes_by_name = Object.fromEntries(scenes.map((sc) => [sc.name, sc]))
		this.scene_name = null
		this.num_reflections = 2
		this.b_vis_aabb  = false
		this.shading_vis = "Flat"
	}

	shader_inject_defines(shader_src, code_injections) {
		// Find occurences of "//#define NUM_X" in shader code and inject values
		const regexp_var = /\/\/#define ([A-Z_]+)/g
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll#specifying_a_function_as_a_parameter
		return shader_src.replaceAll(regexp_var, (match, varname) => {
			if(varname in code_injections) {
				const var_value = code_injections[varname]
				return `#define ${varname} ${var_value}`
			} else {
				return match // no change
			}
		})
	}

	gen_uniforms_camera(camera) {
		const fovx = camera.fov * Math.PI / 180.
		const fovx_half_tan = Math.tan(0.5 * fovx)
		const fovy_half_tan = fovx_half_tan * this.resolution[1] / this.resolution[0]

		return {
			field_of_view_half_tan: [fovx_half_tan, fovy_half_tan],
			camera_position: camera.position,
			camera_target: camera.target,
			camera_up: vec3.normalize([0, 0, 0], camera.up),
		}
	}

	rt_pipeline_for_scene(scene) {
		const {name, camera, materials, lights, spheres, planes, cylinders, mesh} = scene

		const uniforms = {}
		Object.assign(uniforms, this.gen_uniforms_camera(camera))
		uniforms['light_color_ambient'] = [1.0, 1.0, 1.0]

		const code_injections = {
			'NUM_REFLECTIONS': this.num_reflections,
		}

		// Materials
		const material_id_by_name = {}

		materials.forEach((mat, idx) => {
			material_id_by_name[mat.name] = idx
			uniforms[`materials[${idx}].color`] = mat.color
			uniforms[`materials[${idx}].ambient`] = mat.ambient
			uniforms[`materials[${idx}].diffuse`] = mat.diffuse
			uniforms[`materials[${idx}].specular`] = mat.specular
			uniforms[`materials[${idx}].shininess`] = mat.shininess
			uniforms[`materials[${idx}].mirror`] = mat.mirror
		})
		code_injections['NUM_MATERIALS'] = materials.length.toFixed(0)

		// Lights
		lights.forEach((li, idx) => {
			uniforms[`lights[${idx}].position`] = li.position
			uniforms[`lights[${idx}].color`] = li.color
		})
		code_injections['NUM_LIGHTS'] = lights.length.toFixed(0)
		

		// Store the material of each obejct in a uniform as we go through the lists
		const object_material_id = []
		let num_objects = 0;

		function next_object_material(mat_name) {
			object_material_id[num_objects] = material_id_by_name[mat_name]
			//uniforms[`object_material_id[${num_objects}]`] = material_id_by_name[mat_name]
			num_objects += 1
		}

		// Spheres
		// Array of sphere geometry in uniforms
		spheres.forEach((sph, idx) => {
			uniforms[`spheres_center_radius[${idx}]`] = sph.center.concat(sph.radius)
			
			next_object_material(sph.material)
		})
		// Fill NUM_SPHERES in shader source
		code_injections['NUM_SPHERES'] = spheres.length.toFixed(0)

		// Planes
		// Array of plane geometry in uniforms
		planes.forEach((pl, idx) => {
			const pl_norm = [0., 0., 0.]
			vec3.normalize(pl_norm, pl.normal)
			const pl_offset = vec3.dot(pl_norm, pl.center)
			uniforms[`planes_normal_offset[${idx}]`] = pl_norm.concat(pl_offset)
			
			next_object_material(pl.material)
		})
		// Fill NUM_PLANES in shader source
		code_injections['NUM_PLANES'] = planes.length.toFixed(0)

		// Cylinders
		// Array of cylinder geometry in uniforms
		cylinders.forEach((cyl, idx) => {
			uniforms[`cylinders[${idx}].center`] = cyl.center
			uniforms[`cylinders[${idx}].axis`] = vec3.normalize([0, 0, 0], cyl.axis)
			uniforms[`cylinders[${idx}].radius`] = cyl.radius
			uniforms[`cylinders[${idx}].height`] = cyl.height
			
			next_object_material(cyl.material)
		})
		// Fill NUM_CYLINDERS in shader source
		code_injections['NUM_CYLINDERS'] = cylinders.length.toFixed(0)
		

		// Mesh
		if (mesh){
			function get_vert(vert_id) {
				const offset = vert_id*3
				const vert_transformed = [0, 0, 0]
				vec3.scale(vert_transformed, mesh.tris.vertices.slice(offset, offset+3), mesh.scale)
				vec3.add(vert_transformed, vert_transformed, mesh.offset)	 
				return vert_transformed 
			}

			const num_faces   = (mesh.tris.indices.length / 3) | 0

			// Compute triangle normals and angle weights
			const [tri_normals, angle_weights] = compute_triangle_normals_and_angle_weights(mesh)
			
			// Compute vertex normals
			const vertex_normals = compute_vertex_normals(mesh, tri_normals, angle_weights)

			const mesh_vert_pos_normals = []

			for(let i_face = 0; i_face < num_faces; i_face++) {
				const iv1 = mesh.tris.indices[3*i_face + 0]
				const iv2 = mesh.tris.indices[3*i_face + 1]
				const iv3 = mesh.tris.indices[3*i_face + 2]

				const vert1 = get_vert(iv1)
				const vert2 = get_vert(iv2)
				const vert3 = get_vert(iv3)

				mesh_vert_pos_normals[i_face] = [
					vert1, vert2, vert3, 
					vertex_normals[iv1], vertex_normals[iv2], vertex_normals[iv3],
				]
			}

			next_object_material(mesh.material)

			uniforms['mesh_vert_pos_normals'] = this.regl.texture({
				data: mesh_vert_pos_normals,
				format: 'rgb',
				type: 'float',
			})

			// Compute AABB
			let min_corner = [100., 100., 100.]
			let max_corner = [-100., -100., -100.]
			let curr_vert  = [0., 0., 0.]
			for(let i_vert = 0; i_vert < mesh.tris.indices.length; i_vert++) {
				curr_vert = get_vert(mesh.tris.indices[i_vert])

				min_corner[0] = Math.min(min_corner[0], curr_vert[0])
				min_corner[1] = Math.min(min_corner[1], curr_vert[1])
				min_corner[2] = Math.min(min_corner[2], curr_vert[2])

				max_corner[0] = Math.max(max_corner[0], curr_vert[0])
				max_corner[1] = Math.max(max_corner[1], curr_vert[1])
				max_corner[2] = Math.max(max_corner[2], curr_vert[2])
			}
			uniforms['mesh_extent.corner_min'] = min_corner
			uniforms['mesh_extent.corner_max'] = max_corner

			code_injections['NUM_MESHES'] = 1
			code_injections['NUM_TRIANGLES'] = num_faces

			if (this.b_vis_aabb) {
				code_injections['F_VISUALIZE_AABB'] = ''
			}

			if (this.shading_vis == "Flat") {
				code_injections['FLAT_SHADING_STRATEGY'] = ''
			} 
			
			if (this.shading_vis == "Phong") {
				code_injections['PHONG_SHADING_STRATEGY'] = ''
			}

		} else {
			code_injections['NUM_MESHES'] = 0
			code_injections['NUM_TRIANGLES'] = 0
		}

		// regl 2.1.0 loads a uniform array all at once
		if(object_material_id.length > 1) {
			uniforms['object_material_id'] = object_material_id
		} else if (object_material_id.length == 1) {
			uniforms['object_material_id[0]'] = object_material_id[0]
		}

		const shader_frag = this.shader_inject_defines(this.resources_ready.tracer_frag, code_injections)
		
		const pipeline_tracer = this.regl({
			// Vertex attributes
			attributes: {
				vertex_position: mesh_quad_2d.position,
			},
			elements: mesh_quad_2d.faces,
				
			// Uniforms: global data available to the shader
			uniforms: uniforms,	
				
			depth: { enable: false },
		
			/* 
			Vertex shader program
			Given vertex attributes, it calculates the position of the vertex on screen
			and intermediate data ("varying") passed on to the fragment shader
			*/
			vert: this.resources_ready.tracer_vert,
				
			/* 
			Fragment shader program
			Calculates the color of each pixel covered by the mesh.
			The "varying" values are interpolated between the values given by the vertex shader on the vertices of the current triangle.
			*/
			frag: shader_frag,

			framebuffer: this.result_framebuffer,
			//viewport: {x:0, y:0, width: result_wh[0], height: result_wh[1]},
		})

		return pipeline_tracer
	}

	async init(regl) {
		this.regl = regl

		this.resources = {
			tracer_frag: load_text('./src/tracer.frag.glsl'),
			tracer_vert: load_text('./src/tracer.vert.glsl'),
			show_frag: load_text('./src/show_buffer.frag.glsl'),
			show_vert: load_text('./src/show_buffer.vert.glsl'),
		}

		this.result_buffer = regl.texture({
			width: this.resolution[0],
			height: this.resolution[1],
			format: 'rgba',
			min: 'linear',
			mag: 'linear',
		})
		
		this.result_framebuffer = regl.framebuffer({
			color: [this.result_buffer],
			depth: false, stencil: false,
		})

		this.pipeline_show = regl({
			attributes: {
				vertex_position: mesh_quad_2d.position,
			},
			elements: mesh_quad_2d.faces,
			uniforms: {
				tex: this.result_buffer,
			},
			depth: { enable: false },
			vert: await this.resources.show_vert,
			frag: await this.resources.show_frag,
		})

		this.resources_ready = {}
		for (const key in this.resources) {
			if (this.resources.hasOwnProperty(key)) {
				this.resources_ready[key] = await this.resources[key]
			}
		}
	}

	get_scene_names() {
		return this.scenes.map((s) => s.name)
	}

	async draw_scene({scene_name, num_reflections, b_vis_aabb, shading_vis}) {
		if (num_reflections === undefined || num_reflections < 0) {
			num_reflections = this.num_reflections
		}

		if (b_vis_aabb === undefined) {
			b_vis_aabb = this.b_vis_aabb
		}

		if (shading_vis === undefined) {
			shading_vis = this.shading_vis
		}

		const scene_def = this.scenes_by_name[scene_name]

		if(! scene_def) {
			console.error(`No scene ${scene_name}`)
			return 
		}

		if(scene_name != this.scene_name || num_reflections != this.num_reflections || b_vis_aabb != this.b_vis_aabb || shading_vis != this.shading_vis) {
			this.scene_name = scene_name
			this.num_reflections = num_reflections
			this.b_vis_aabb = b_vis_aabb
			this.shading_vis = shading_vis

			const pipe = this.rt_pipeline_for_scene(scene_def)
			
			pipe()

			pipe.destroy()

			this.regenerate_view()
		}
	}

	regenerate_view() {
		this.regen_needed = true

		requestAnimationFrame(() => {
			if(this.regen_needed) {
				// display the result on the canvas
				this.regl.poll()
				this.pipeline_show()

				this.regen_needed = false
			}
		})
	}

	save_image() {
		framebuffer_to_image_download(this.regl, this.result_framebuffer, `${this.scene_name}.png`)
	}
}

