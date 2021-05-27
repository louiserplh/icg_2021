import { createREGL } from '../lib/regljs_2.1.0/regl.module.js';

import { vec2, vec3, vec4, mat3, mat4 } from '../lib/gl-matrix_3.3.0/esm/index.js';

import {
  DOM_loaded_promise,
  load_text,
  load_texture,
  register_keyboard_action,
} from './icg_web.js';
import { deg_to_rad, mat4_to_string, vec_to_string, mat4_matmul_many } from './icg_math.js';
import { icg_mesh_load_obj, icg_mesh_make_uv_sphere } from './icg_mesh.js';
import { PhongTileActor, MeshTileActor } from './tiles.js';
import { make_grid_pipeline } from './icg_grid.js';
import { fromYRotation, fromZRotation } from '../lib/gl-matrix_3.3.0/esm/mat4.js';

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

  const debug_overlay = document.getElementById('debug-overlay');
  const debug_text = document.getElementById('debug-text');

  register_keyboard_action('h', () => debug_overlay.classList.toggle('hidden'));

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
    'tex_tile_1_alone_nb': load_texture(regl, './textures/tile_1_alone_nb.png'),
    'tex_tile_1_alone_nr': load_texture(regl, './textures/tile_1_alone_nr.png'),
    'tex_tile_1_alone': load_texture(regl, './textures/tile_1_alone.png'),
    'tex_tile_1_left_corner': load_texture(regl, './textures/tile_1_left_corner.png'),
    'tex_tile_1_left_nb_corner': load_texture(regl, './textures/tile_1_left_nb_corner.png'),
    'tex_tile_1_left_nb': load_texture(regl, './textures/tile_1_left_nb.png'),
    'tex_tile_1_left_nr_corner': load_texture(regl, './textures/tile_1_left_nr_corner.png'),
    'tex_tile_1_left_nr': load_texture(regl, './textures/tile_1_left_nr.png'),
    'tex_tile_1_left': load_texture(regl, './textures/tile_1_left.png'),
    'tex_tile_1_middle_nb': load_texture(regl, './textures/tile_1_middle_nb.png'),
    'tex_tile_1_middle_nr': load_texture(regl, './textures/tile_1_middle_nr.png'),
    'tex_tile_1_middle': load_texture(regl, './textures/tile_1_middle.png'),
    'tex_tile_1_right_corner': load_texture(regl, './textures/tile_1_right_corner.png'),
    'tex_tile_1_right_nb_corner': load_texture(regl, './textures/tile_1_right_nb_corner.png'),
    'tex_tile_1_right_nb': load_texture(regl, './textures/tile_1_right_nb.png'),
    'tex_tile_1_right_nr_cor': load_texture(regl, './textures/tile_1_right_nr_cor.png'),
    'tex_tile_1_right_nr': load_texture(regl, './textures/tile_1_right_nr.png'),
    'tex_tile_1_right': load_texture(regl, './textures/tile_1_right.png'),
    'tex_tile_2_alone_nr': load_texture(regl, './textures/tile_2_alone_nr.png'),
    'tex_tile_2_left_nr_corner': load_texture(regl, './textures/tile_2_left_nr_corner.png'),
    'tex_tile_2_middle_nr': load_texture(regl, './textures/tile_2_middle_nr.png'),
    'tex_tile_2_right_nr_corner': load_texture(regl, './textures/tile_2_right_nr_corner.png'),
    'tex_tile_2_right_nr': load_texture(regl, './textures/tile_2_right_nr.png'),
    'tex_tile_3_left_fancy': load_texture(regl, './textures/tile_3_left_fancy.png'),
    'tex_tile_3_left_nr': load_texture(regl, './textures/tile_3_left_nr.png'),
    'tex_tile_3_left': load_texture(regl, './textures/tile_3_left.png'),
    'tex_tile_3_middle_fancy': load_texture(regl, './textures/tile_3_middle_fancy.png'),
    'tex_tile_3_middle_nr': load_texture(regl, './textures/tile_3_middle_nr.png'),
    'tex_tile_3_middle': load_texture(regl, './textures/tile_3_middle.png'),
    'tex_tile_3_right_fancy': load_texture(regl, './textures/tile_3_right_fancy.png'),
    'tex_tile_3_right_nr': load_texture(regl, './textures/tile_3_right_nr.png'),
    'tex_tile_3_right': load_texture(regl, './textures/tile_3_right.png'),
    'tex_tile_4_left_nr': load_texture(regl, './textures/tile_4_left_nr.png'),
    'tex_tile_4_left': load_texture(regl, './textures/tile_4_left.png'),
    'tex_tile_4_middle_nr': load_texture(regl, './textures/tile_4_middle_nr.png'),
    'tex_tile_4_middle': load_texture(regl, './textures/tile_4_middle.png'),
    'tex_tile_4_right_nr': load_texture(regl, './textures/tile_4_right_nr.png'),
    'tex_tile_4_right': load_texture(regl, './textures/tile_4_right.png'),
    'tex_grass': load_texture(regl, './textures/grass.png'),

    'shader_unshaded_vert': load_text('./src/shaders/unshaded.vert.glsl'),
    'shader_unshaded_frag': load_text('./src/shaders/unshaded.frag.glsl'),
    'shader_phong_vert': load_text('./src/shaders/phong.vert.glsl'),
    'shader_phong_frag': load_text('./src/shaders/phong.frag.glsl'),
  };

  // Wait for all downloads to complete
  for (const key in resources) {
    if (resources.hasOwnProperty(key)) {
      resources[key] = await resources[key];
    }
  }

  // Construct a unit sphere mesh
  // UV sphere https://docs.blender.org/manual/en/latest/modeling/meshes/primitives.html#uv-sphere
  // we create it in code instead of loading from a file
  resources['mesh_uvsphere'] = icg_mesh_make_uv_sphere(15);

  // Loads the tiles to be displayed
  const tiles = [
    { id: 'grass', x: 0.5, y: 0.5, z: -0.3 },
    { id: 'grass', x: 1.5, y: 0.5, z: -0.3 },
    { id: 'grass', x: 0.5, y: 1.5, z: -0.3 },
    { id: 'grass', x: 1.5, y: 1.5, z: -0.3 },
    { id: 'tile_1_alone_nr', x: 0, y: 0, z: 0 },
    { id: 'tile_1_alone_nr', x: 1, y: 0, z: 0 },
    { id: 'tile_1_alone_nr', x: 2, y: 0, z: 0 },
    { id: 'tile_1_alone_nr', x: 0, y: 1, z: 0 },
    { id: 'tile_1_alone_nr', x: 1, y: 1, z: 0 },
    { id: 'tile_1_alone_nr', x: 2, y: 1, z: 0 },
    { id: 'tile_1_alone_nr', x: 0, y: 2, z: 0 },
    { id: 'tile_1_alone_nr', x: 1, y: 2, z: 0 },
    { id: 'tile_1_alone_nr', x: 2, y: 2, z: 0 },
    { id: 'tile_1_alone_nr', x: 0, y: 0, z: 1 },
    { id: 'tile_1_alone_nr', x: 1, y: 0, z: 1 },
    { id: 'tile_1_alone_nr', x: 2, y: 0, z: 1 },
    { id: 'tile_1_alone_nr', x: 0, y: 1, z: 1 },
    { id: 'tile_1_alone_nr', x: 1, y: 1, z: 1 },
    { id: 'tile_1_alone_nr', x: 2, y: 1, z: 1 },
    { id: 'tile_1_alone_nr', x: 0, y: 2, z: 1 },
    { id: 'tile_1_alone_nr', x: 1, y: 2, z: 1 },
    { id: 'tile_1_alone_nr', x: 2, y: 2, z: 1 },
    { id: 'tile_1_alone_nr', x: 0, y: 0, z: 2 },
    { id: 'tile_1_alone_nr', x: 1, y: 0, z: 2 },
    { id: 'tile_1_alone_nr', x: 2, y: 0, z: 2 },
    { id: 'tile_1_alone_nr', x: 0, y: 1, z: 2 },
    { id: 'tile_1_alone_nr', x: 1, y: 1, z: 2 },
    { id: 'tile_1_alone_nr', x: 2, y: 1, z: 2 },
    { id: 'tile_1_alone_nr', x: 0, y: 2, z: 2 },
    { id: 'tile_1_alone_nr', x: 1, y: 2, z: 2 },
    { id: 'tile_1_alone_nr', x: 2, y: 2, z: 2 },
  ];

  /*---------------------------------------------------------------
		GPU pipeline
	---------------------------------------------------------------*/

  const mat_projection = mat4.create();

  /*---------------------------------------------------------------
		Camera
	---------------------------------------------------------------*/
  const mat_world_to_cam = mat4.create();
  const cam_distance_base = 15;

  let cam_angle_z = 0; //Math.PI * 0.2; // in radians!
  let cam_angle_y = 0; //-Math.PI / 6; // in radians!
  let old_cam_angle_z = 0;
  let old_cam_angle_y = 0;
  let new_cam_angle_z = 0;
  let new_cam_angle_y = 0;

  let cam_distance_factor = 1;
  let old_cam_distance_factor = 1;
  let new_cam_distance_factor = 1;

  function update_cam_transform() {
    /*
		Calculate the world-to-camera transformation matrix.
		The camera orbits the scene 
		* cam_distance_base * cam_distance_factor = distance of the camera from the (0, 0, 0) point
		* cam_angle_z - camera ray's angle around the Z axis
		* cam_angle_y - camera ray's angle around the Y axis
		*/

    // Example camera matrix, looking along forward-X, edit this
    const look_at = mat4.lookAt(
      mat4.create(),
      [cam_distance_base * cam_distance_factor, 0, 0], // camera position in world coord (distance to 'from' point), as forward-X we move along X axis
      [0, 0, 0], // view target point (always look at the origin)
      [0, 0, 1] // up vector (simply goes along +z axis, unit vector)
    );
    // Store the combined transform in mat_world_to_cam
    // mat_world_to_cam = look_at * rotation_Y * rotation_Z
    mat4_matmul_many(
      mat_world_to_cam,
      look_at,
      fromYRotation(mat4.create(), -cam_angle_y),
      fromZRotation(mat4.create(), cam_angle_z)
    );
  }

  update_cam_transform();

  // Rotate camera position by dragging with the mouse
  canvas_elem.addEventListener('mousemove', (event) => {
    // if left or middle button is pressed
    if (event.buttons & 1 || event.buttons & 4) {
      cam_angle_z += event.movementX * 0.005;
      cam_angle_y += -event.movementY * 0.005;

      update_cam_transform();
    }
  });

  canvas_elem.addEventListener('wheel', (event) => {
    // scroll wheel to zoom in or out
    const factor_mul_base = 1.08;
    const factor_mul = event.deltaY > 0 ? factor_mul_base : 1 / factor_mul_base;
    cam_distance_factor *= factor_mul;
    cam_distance_factor = Math.max(0.02, Math.min(cam_distance_factor, 4));
    // console.log('wheel', event.deltaY, event.deltaMode);
    update_cam_transform();
  });

  /*---------------------------------------------------------------
		Actors
	---------------------------------------------------------------*/

  // actors in the order they should be drawn
  const actors_list = [];
  for (var i = 0; i < tiles.length; ++i) {
    if (tiles[i].id !== '') {
      const mesh_name = 'mesh/'.concat(tiles[i].id).concat('.obj');
      const texture_name = 'tex_'.concat(tiles[i].id);
      const shine = tiles[i].id === 'grass' ? 100 : 2;
      const amb = tiles[i].id === 'grass' ? 0.6 : 0.4;
      actors_list.push(
        new MeshTileActor(
          {
            name: tiles[i].id,
            mesh: await icg_mesh_load_obj(regl, mesh_name),
            texture: resources[texture_name],
            size: 1,
            x: tiles[i].x,
            y: tiles[i].y,
            z: tiles[i].z,
            shininess: shine,
            ambient: amb,
          },
          regl,
          resources
        )
      );
    }
  }

  const actors_by_name = {};
  const corners_by_name = {};

  for (const actor of actors_list) {
    actors_by_name[actor.name] = actor;

    //if we are on corner
    if (actor.z == 2 && actor.x != 1 && actor.y != 1) {
      //trick to attribute a different index to each of the four corners
      const corner_index = Math.max(0, actor.x - 1) + 2 * Math.max(0, actor.y - 1);
      const corner_name = 'corner '.concat(corner_index.toString());
      corners_by_name[corner_name] = actor;
    }
    // if we are on the middle tile
    if (actor.x == 1 && actor.y == 1) {
      if (actor.z == 0) {
        corners_by_name['middle_down'] = actor;
      }
      if (actor.z == 1) {
        corners_by_name['middle'] = actor;
      }
      if (actor.z == 2) {
        corners_by_name['middle_up'] = actor;
      }
    }
  }

  // https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html
  const sortObject = (obj) =>
    Object.keys(obj)
      .sort()
      .reduce((res, key) => ((res[key] = obj[key]), res), {});

  const sorted_corners_by_name = sortObject(corners_by_name);

  /*
		Center camera on selected planet
	*/
  let selected_corner_name = 'middle';
  let old_selected_corner_name = 'middle';
  // bezier parameter is the time t to lerp between b_0 and b_n positions (in [0,1])
  let bezier_param = 1;
  const elem_view_select = document.getElementById('view-select');

  function set_selected_corner(name) {
    console.log('Selecting', name);

    if (bezier_param < 0.9) {
      // It's visually not appealing to stop the lerping before the previous one is finished
      return;
    }

    old_cam_angle_y = cam_angle_y;
    new_cam_angle_y = -Math.PI / 9;

    old_cam_angle_z = cam_angle_z;
    if (name === 'corner 0') {
      new_cam_angle_z = (3 * Math.PI) / 4;
    } else if (name === 'corner 1') {
      new_cam_angle_z = (-3 * Math.PI) / 4;
    } else if (name === 'corner 2') {
      new_cam_angle_z = Math.PI / 4;
    } else if (name === 'corner 3') {
      new_cam_angle_z = -Math.PI / 4;
    } else {
      // we are on middle tiles
      new_cam_angle_z = 0;
    }

    // we are starting a new bezier travel
    bezier_param = 0;

    old_selected_corner_name = selected_corner_name;
    selected_corner_name = name;

    old_cam_distance_factor = cam_distance_factor;
    new_cam_distance_factor = 15 / cam_distance_base;

    update_cam_transform();
  }

  set_selected_corner('middle');

  for (const name in sorted_corners_by_name) {
    if (sorted_corners_by_name.hasOwnProperty(name)) {
      const entry = document.createElement('li');
      entry.textContent = name;
      entry.addEventListener('click', (event) => set_selected_corner(name));
      elem_view_select.appendChild(entry);
    }
  }

  /*
		Pause
	*/
  let is_paused = false;
  let sim_time = 0;
  let prev_regl_time = 0;

  register_keyboard_action('p', () => (is_paused = !is_paused));

  /*---------------------------------------------------------------
		Frame render
	---------------------------------------------------------------*/

  // List of objects to draw
  const draw_list = actors_list.slice();
  //draw_list.push(grid_actor_interface);

  // Consider the sun, which locates at [0, 0, 0], as the only light source
  const light_position_world = [80, 60, 60, 1];
  const light_position_cam = [0, 0, 0, 1];
  const light_color = [0.85, 0.8, 0.85];

  //add the light_color to the planets except sun and billboard
  for (const actor of actors_list) {
    if (actor instanceof PhongTileActor) {
      actor.light_color = light_color;
    }
  }

  const mat_view = mat4.create();
  const camera_position = [0, 0, 0];

  regl.frame((frame) => {
    if (!is_paused) {
      const dt = frame.time - prev_regl_time;
      sim_time += dt;
    }
    prev_regl_time = frame.time;

    mat4.perspective(
      mat_projection,
      deg_to_rad * 60, // fov y
      frame.framebufferWidth / frame.framebufferHeight, // aspect ratio
      0.01, // near
      100 // far
    );

    // Calculate model matrices
    for (const actor of actors_list) {
      actor.calculate_model_matrix({ sim_time: sim_time });
    }

    // Calculate view matrix, view centered on a corner tile
    {
      if (bezier_param < 1) {
        // we are in the transition, need to compute camera_position along the Bézier curve

        // we first update the parameters manages by camera in update_cam_transform (classic linear interpolation)
        cam_angle_y = (1 - bezier_param) * old_cam_angle_y + bezier_param * new_cam_angle_y;
        cam_angle_z = (1 - bezier_param) * old_cam_angle_z + bezier_param * new_cam_angle_z;
        cam_distance_factor =
          (1 - bezier_param) * old_cam_distance_factor + bezier_param * new_cam_distance_factor;

        update_cam_transform();

        // corner position on which we want to focus
        const new_selected_corner_model_mat =
          corners_by_name[selected_corner_name].mat_model_to_world;
        const new_selected_corner_position = mat4.getTranslation(
          [0, 0, 0],
          new_selected_corner_model_mat
        );
        vec3.scale(new_selected_corner_position, new_selected_corner_position, -1);

        // corner position on which we had the previous focus
        const old_selected_corner_model_mat =
          corners_by_name[old_selected_corner_name].mat_model_to_world;
        const old_selected_corner_position = mat4.getTranslation(
          [0, 0, 0],
          old_selected_corner_model_mat
        );
        vec3.scale(old_selected_corner_position, old_selected_corner_position, -1);

        // distance vec between those 2
        const distance_old_new = vec3.sub(
          vec3.create(),
          new_selected_corner_position,
          old_selected_corner_position
        );

        // 3rd bézier curve point (the middle between our old and new)
        let third_point_position = vec3.scaleAndAdd(
          vec3.create(),
          old_selected_corner_position,
          distance_old_new,
          0.5
        );

        // computes perpendicular vector to the from_old_to_new vector
        const perpendicular_vect = vec3.fromValues(
          -distance_old_new[1] * 0.5,
          distance_old_new[0] * 0.5,
          distance_old_new[2] * 0.5
        );
        // the third point is such that it's between old and a bit upper toward perpendicular
        third_point_position = vec3.add(vec3.create(), third_point_position, perpendicular_vect);

        // the current bezier interpolated position point
        const bezier_interpolated = vec3.bezier(
          vec3.create(),
          old_selected_corner_position,
          third_point_position,
          third_point_position,
          new_selected_corner_position,
          bezier_param
        );

        const bezier_translation_mat = mat4.fromTranslation(mat4.create(), bezier_interpolated);
        // The view matrix is now shifted relatively to the interpolated position on Bézier curve
        mat4_matmul_many(mat_view, mat_world_to_cam, bezier_translation_mat);

        // we update the bezier interpolation time
        bezier_param += 0.01;
      } else {
        // we apply the classic transform on the focused tile
        const selected_corner_model_mat = corners_by_name[selected_corner_name].mat_model_to_world;
        const selected_corner_position = mat4.getTranslation([0, 0, 0], selected_corner_model_mat);
        vec3.scale(selected_corner_position, selected_corner_position, -1);
        const selected_corner_translation_mat = mat4.fromTranslation(
          mat4.create(),
          selected_corner_position
        );
        mat4_matmul_many(mat_view, mat_world_to_cam, selected_corner_translation_mat);
      }
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
    };

    // Set the whole image to black
    //{color: [0.56, 0.90, 0.93, 1]
    regl.clear({ color: [0.22, 0.68, 0.88, 1] });

    for (const actor of draw_list) {
      try {
        actor.draw(draw_info);
      } catch (e) {
        console.error('Error when rendering actor:', actor);
        throw e;
      }

      // for better performance we should collect these props and then draw them all together
      // http://regl.party/api#batch-rendering
    }

    debug_text.textContent = `
Hello! Sim time is ${sim_time.toFixed(2)} s
Camera: angle_z ${(cam_angle_z / deg_to_rad).toFixed(1)}, angle_y ${(
      cam_angle_y / deg_to_rad
    ).toFixed(1)}, distance ${(cam_distance_factor * cam_distance_base).toFixed(1)}
cam pos ${vec_to_string(camera_position)}
`;
  });
}

DOM_loaded_promise.then(main);
