
import {createREGL} from "../lib/regljs_2.1.0/regl.module.js"

import {vec2, vec3, vec4, mat3, mat4} from "../lib/gl-matrix_3.3.0/esm/index.js"

import {DOM_loaded_promise, load_text, load_texture, register_keyboard_action} from "./icg_web.js"
import {deg_to_rad, mat4_to_string, vec_to_string, mat4_matmul_many} from "./icg_math.js"
import {icg_mesh_make_uv_sphere} from "./icg_mesh.js"
import {PlanetActor, PhongActor, SunActor, EarthActor, SunBillboardActor} from "./planets.js"
import {make_grid_pipeline} from "./icg_grid.js"

var regl_global_handle = null; // store the regl context here in case we want to touch it in devconsole

async function main() {
	/* const in JS means the variable will not be bound to a new value, but the value can be modified (if its an object or array)
		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
	*/

	// We are using the REGL library to work with webGL
	// http://regl.party/api
	// https://github.com/regl-project/regl/blob/master/API.md
	const regl = createREGL({
		profile: true, // if we want to measure the size of buffers/textures in memory
	});
	regl_global_handle = regl;
	// The <canvas> (HTML element for drawing graphics) was created by REGL, lets take a handle to it.
	const canvas_elem = document.getElementsByTagName('canvas')[0];
	
	const debug_text = document.getElementById('debug-text');


	/*---------------------------------------------------------------
		Resource loading
	---------------------------------------------------------------*/

	/*
	The textures fail to load when the site is opened from local file (file://) due to "cross-origin".
	Solutions:
	* run a local webserver
		caddy file-server -browse -listen 0.0.0.0:8000
		# or
		python -m http.server 8000
		# open localhost:8000
	OR
	* run chromium with CLI flag
		"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files index.html
		
	* edit config in firefox
		security.fileuri.strict_origin_policy = false
	*/

	// Start downloads in parallel
	const resources = {
		'tex_sun': load_texture(regl, './textures/sun.jpg'),
		'tex_moon': load_texture(regl, './textures/moon.jpg'),
		'tex_mars': load_texture(regl, './textures/mars.jpg'),
		'tex_earth_day': load_texture(regl, './textures/earth_day.jpg'),
		'tex_earth_night': load_texture(regl, './textures/earth_night.jpg'),
		'tex_earth_gloss': load_texture(regl, './textures/earth_gloss.jpg'),
		'tex_earth_clouds': load_texture(regl, './textures/earth_clouds.jpg', {wrapS: 'repeat'}),


		'shader_unshaded_vert': load_text('./src/shaders/unshaded.vert.glsl'),
		'shader_unshaded_frag': load_text('./src/shaders/unshaded.frag.glsl'),
		'shader_phong_vert': load_text('./src/shaders/phong.vert.glsl'),
		'shader_phong_frag': load_text('./src/shaders/phong.frag.glsl'),
		'shader_earth_frag': load_text('./src/shaders/earth.frag.glsl'),
		'shader_billboard_vert': load_text('./src/shaders/billboard.vert.glsl'),
		'shader_billboard_frag': load_text('./src/shaders/billboard_sunglow.frag.glsl'),
		'shader_sun_vert' : load_text('./src/shaders/sun.vert.glsl'),
	}
	
	// Wait for all downloads to complete
	for (const key in resources) {
		if (resources.hasOwnProperty(key)) {
			resources[key] = await resources[key]
		}
	}

	// Construct a unit sphere mesh
	// UV sphere https://docs.blender.org/manual/en/latest/modeling/meshes/primitives.html#uv-sphere
	// we create it in code instead of loading from a file
	resources['mesh_uvsphere'] = icg_mesh_make_uv_sphere(15);

	/*---------------------------------------------------------------
		GPU pipeline
	---------------------------------------------------------------*/
	
	const mat_projection = mat4.create();

	/*---------------------------------------------------------------
		Camera
	---------------------------------------------------------------*/
	const mat_world_to_cam = mat4.create();
	const cam_distance_base = 15;
	
	let cam_angle_z = Math.PI * 0.2; // in radians!
	let cam_angle_y = -Math.PI / 6; // in radians!
	let cam_distance_factor = 1.;

	function update_cam_transform() {
		/* TODO 4.2.2
		Calculate the world-to-camera transformation matrix.
		The camera orbits the scene 
		* cam_distance_base * cam_distance_factor = distance of the camera from the (0, 0, 0) point
		* cam_angle_z - camera ray's angle around the Z axis
		* cam_angle_y - camera ray's angle around the Y axis
		*/

		// Example camera matrix, looking along forward-X, edit this
		const look_at = mat4.lookAt(mat4.create(), 
			[-5, 0, 0], // camera position in world coord
			[0, 0, 0], // view target point
			[0, 0, 1], // up vector
		);
		// Store the combined transform in mat_world_to_cam
		// mat_world_to_cam = A * B * ...
		mat4_matmul_many(mat_world_to_cam, look_at); // edit this
	}

	update_cam_transform();

	// Rotate camera position by dragging with the mouse
	canvas_elem.addEventListener('mousemove', (event) => {
		// if left or middle button is pressed
		if (event.buttons & 1 || event.buttons & 4) {
			cam_angle_z += event.movementX*0.005;
			cam_angle_y += -event.movementY*0.005;

			update_cam_transform();
		}
	});

	canvas_elem.addEventListener('wheel', (event) => {
		// scroll wheel to zoom in or out
		const factor_mul_base = 1.08;
		const factor_mul = (event.deltaY > 0) ? factor_mul_base : 1./factor_mul_base;
		cam_distance_factor *= factor_mul;
		cam_distance_factor = Math.max(0.02, Math.min(cam_distance_factor, 4));
		// console.log('wheel', event.deltaY, event.deltaMode);
		update_cam_transform();
	})

	/*---------------------------------------------------------------
		Actors
	---------------------------------------------------------------*/

	// actors in the order they should be drawn
	const actors_list = [
		new PlanetActor({
			name: 'sun',
			orbits: null,
			texture: resources.tex_sun,
			size: 2.5,
			rotation_speed: 0.1,
		}, regl, resources),
		new PlanetActor({
			name: 'earth',
			orbits: 'sun',
			texture: resources.tex_earth_day,
			size: 1,
			rotation_speed: 0.3,
			orbit_radius: 6,
			orbit_speed: 0.05,
			orbit_phase: 1.7,
			shininess : 20,
			ambient : 0.2,
		}, regl, resources),
		new PlanetActor({
			name: 'moon',
			orbits: 'earth',
			texture: resources.tex_moon,
			size: 0.25,
			rotation_speed: 0.3,
			orbit_radius: 2.5,
			orbit_speed: 0.4,
			orbit_phase: 0.5,
			shininess : 8,
			ambient : 0.2,
		}, regl, resources),
		new PlanetActor({
			name: 'mars',
			orbits: 'sun',
			texture: resources.tex_mars,
			size: 0.75,
			rotation_speed: 0.7,
			orbit_radius: 10.0,
			orbit_speed: 0.1,
			orbit_phase: 0.1,
			shininess : 8,
			ambient : 0.2,
		}, regl, resources),
	]

	const actors_by_name = {};

	for (const actor of actors_list) {
		actors_by_name[actor.name] = actor;

		// resolve orbits by name
		// the orbit-parent should be in the list before its child, the child needs the parent's model matrix to be calculated earlier
		if(actor.orbits !== null) {
			actor.orbits = actors_by_name[actor.orbits];

			if (actor.orbits === undefined) {
				throw new Error(`Actor ${actor.name} orbits around ${actor.orbits} which is not present in the actor list before it`);
			}
		}
	}

	const billboard = new SunBillboardActor({size: actors_by_name['sun'].size * 3}, regl, resources);

	/*
		Center camera on selected planet
	*/
	let selected_planet_name = 'earth';
	const elem_view_select = document.getElementById('view-select');

	function set_selected_planet(name) {
		console.log('Selecting', name);
		selected_planet_name = name;
		cam_distance_factor = 3*actors_by_name[name].size / cam_distance_base;
		update_cam_transform();
	}

	set_selected_planet('earth');

	for (const name in actors_by_name) {
		if (actors_by_name.hasOwnProperty(name)) {
			const entry = document.createElement('li');
			entry.textContent = name;
			entry.addEventListener('click', (event) => set_selected_planet(name));
			elem_view_select.appendChild(entry);
		}
	}

	/*
		Pause
	*/
	let is_paused = false;
	let sim_time = 0;
	let prev_regl_time = 0;

	register_keyboard_action('p', () => is_paused = !is_paused);

	// Grid, to demonstrate keyboard shortcuts
	const draw_grid = make_grid_pipeline(regl);
	let grid_on = true;
	register_keyboard_action('g', () => grid_on = !grid_on);

	const grid_actor_interface = {
		draw: ({mat_projection, mat_view}) => {
			if(grid_on) draw_grid(mat_projection, mat_view);
		}
	};
		

	/*---------------------------------------------------------------
		Frame render
	---------------------------------------------------------------*/

	// List of objects to draw
	const draw_list = actors_list.slice();
	draw_list.push(grid_actor_interface);
	//draw_list.push(billboard); //add the billboard shader

	// Consider the sun, which locates at [0, 0, 0], as the only light source
	const light_position_world = [0, 0, 0, 1];
	const light_position_cam = [0, 0, 0, 1];
	const light_color = [1.0, 0.941, 0.898];

	//add the light_color to the planets except sun and billboard
	for (const actor of actors_list){
		if(actor instanceof PhongActor){
			actor.light_color = light_color;
		}
	}


	const mat_view = mat4.create();
	const camera_position = [0, 0, 0];

	regl.frame((frame) => {
		if (! is_paused) {
			const dt = frame.time - prev_regl_time;
			sim_time += dt;
		}
		prev_regl_time = frame.time;

		mat4.perspective(mat_projection, 
			deg_to_rad * 60, // fov y
			frame.framebufferWidth / frame.framebufferHeight, // aspect ratio
			0.01, // near
			100, // far
		)

		// Calculate model matrices
		for (const actor of actors_list) {
			actor.calculate_model_matrix({sim_time: sim_time});
		}

		// Calculate view matrix, view centered on chosen planet
		{
			const selected_planet_model_mat = actors_by_name[selected_planet_name].mat_model_to_world;
			const selected_planet_position = mat4.getTranslation([0, 0, 0], selected_planet_model_mat);
			vec3.scale(selected_planet_position, selected_planet_position, -1);
			const selected_planet_translation_mat = mat4.fromTranslation(mat4.create(), selected_planet_position);
			mat4_matmul_many(mat_view, mat_world_to_cam, selected_planet_translation_mat);
		}

		// Calculate light position in camera frame
		vec4.transformMat4(light_position_cam, light_position_world, mat_view);

		// Calculate camera position and store it in `camera_position`, it will be needed for the billboard
		{
			/*
			Camera is at [0, 0, 0] in camera coordinates.
			mat_view is a transformation from world to camera coordinates.
			The inverse of mat_view is a transformation from camera to world coordinates.
			Transforming [0, 0, 0] from camera to world we obtain the world position of the camera.
				cam_pos = mat_view^-1 * [0, 0, 0]^T
			*/
			const mat_camera_to_world = mat4.invert(mat4.create(), mat_view);

			// Transform [0, 0, 0] from camera to world:
			//const camera_position = vec3.transformMat4([0, 0, 0], [0, 0, 0], mat_view_invert);
			// But the rotation and scale parts of the matrix do no affect [0, 0, 0] so, we can just get the translation, its cheaper:
			mat4.getTranslation(camera_position, mat_camera_to_world);
		}

		const draw_info = {
			sim_time: sim_time,
			mat_view: mat_view,
			mat_projection: mat_projection,
			light_position_cam: light_position_cam,
			camera_position: camera_position,
		}

		// Billboard needs to know the camera position to calculate its model matrix
		billboard.calculate_model_matrix(draw_info);

		// Set the whole image to black
		regl.clear({color: [0, 0, 0, 1]});

		for (const actor of draw_list) {
			try {
				actor.draw(draw_info)
			} catch (e) {
				console.error('Error when rendering actor:', actor);
				throw e;
			}

			// for better performance we should collect these props and then draw them all together
			// http://regl.party/api#batch-rendering
		}

		debug_text.textContent = `
Hello! Sim time is ${sim_time.toFixed(2)} s
Camera: angle_z ${(cam_angle_z / deg_to_rad).toFixed(1)}, angle_y ${(cam_angle_y / deg_to_rad).toFixed(1)}, distance ${(cam_distance_factor*cam_distance_base).toFixed(1)}
cam pos ${vec_to_string(camera_position)}
`;
	})
}

DOM_loaded_promise.then(main);
