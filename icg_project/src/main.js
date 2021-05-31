import { createREGL } from '../lib/regljs_2.1.0/regl.module.js';

import { vec2, vec3, vec4, mat3, mat4 } from '../lib/gl-matrix_3.3.0/esm/index.js';

import {
  DOM_loaded_promise,
  load_text,
  load_texture,
  register_keyboard_action,
} from './icg_web.js';
import { deg_to_rad, vec_to_string, mat4_matmul_many } from './icg_math.js';
import { icg_mesh_load_obj, icg_mesh_make_uv_sphere } from './icg_mesh.js';
import { PhongTileActor, MeshTileActor } from './tiles.js';
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
  const WFC_overlay = document.getElementById('wfc-overlay');
  const debug_overlay = document.getElementById('debug-overlay');
  const debug_text = document.getElementById('debug-text');
  const generate_button = document.getElementById('generate');

  register_keyboard_action('h', () => debug_overlay.classList.toggle('hidden'));
  register_keyboard_action('w', () => WFC_overlay.classList.toggle('hidden'));
  generate_button.addEventListener('click', () => send_with_constraints());

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

  const X_SIZE = 5;
  const Y_SIZE = 5;
  const Z_SIZE = 3;
  // Loads the tiles to be displayed
  const floor_tiles = [{ id: 'grass', x: 2, y: 2, z: -0.7 }];
  let tiles = floor_tiles.concat([
    { id: 'tile_2_alone_nr', x: Math.floor(X_SIZE / 2), y: Math.floor(Y_SIZE / 2), z: 0 },
    { id: 'tile_2_alone_nr', x: Math.floor(X_SIZE / 2), y: Math.floor(Y_SIZE / 2), z: 1 },
    { id: 'tile_2_alone_nr', x: Math.floor(X_SIZE / 2), y: Math.floor(Y_SIZE / 2), z: 2 },
  ]);

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
    cam_distance_factor = Math.max(0.02, Math.min(cam_distance_factor, 3));
    // console.log('wheel', event.deltaY, event.deltaMode);
    update_cam_transform();
  });

  /*---------------------------------------------------------------
		Actors
	---------------------------------------------------------------*/

  // actors in the order they should be drawn
  let actors_list = [];

  let actors_by_name = {};
  let corners_by_name = {};
  let sorted_corners_by_name = [];

  /*
		Center camera on selected tile
	*/
  let selected_corner_name = 'middle';
  let old_selected_corner_name = 'middle';
  // bezier parameter is the time t to lerp between b_0 and b_n positions (in [0,1])
  let bezier_param = 1;
  // creates the buttons to select a corner
  const elem_view_select = document.getElementById('view-select');

  await create_actor_list().then(() => create_actor_corner_by_name());

  /*
    Generates the actor lists
  */
  async function create_actor_list() {
    let new_actors_list = [];
    for (var i = 0; i < tiles.length; ++i) {
      if (tiles[i].id !== '') {
        const mesh_name = 'mesh/' + tiles[i].id + '.obj';
        const texture_name = 'textures/' + tiles[i].id + '.png';
        const shine = tiles[i].id === 'grass' ? 1 : 14;
        const amb = tiles[i].id === 'grass' ? 0.9 : 0.5;
        new_actors_list.push(
          new MeshTileActor(
            {
              name: tiles[i].id,
              mesh: tiles[i].id !== 'air' ? await icg_mesh_load_obj(regl, mesh_name) : {}, // we put a mesh for non empty tiles only
              texture: tiles[i].id !== 'air' ? await load_texture(regl, texture_name) : {}, //our tiles textures are small, easily runtime loaded
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
    actors_list = [].concat(new_actors_list);
  }

  function create_actor_corner_by_name() {
    let corner_index = 0;
    let new_actors_by_name = {};
    let new_corners_by_name = {};
    for (const actor of actors_list) {
      new_actors_by_name[actor.name] = actor;
      if (
        actor.z == Z_SIZE - 1 &&
        (actor.x == 0 || actor.x == X_SIZE - 1) &&
        (actor.y == 0 || actor.y == Y_SIZE - 1)
      ) {
        //if we are on corner

        //trick to attribute a different index to each of the four corners
        const corner_name = 'corner ' + corner_index;
        new_corners_by_name[corner_name] = actor;
        corner_index += 1;
      }
      if (actor.x == Math.floor(X_SIZE / 2) && actor.y == Math.floor(Y_SIZE / 2)) {
        // if we are on the middle tile
        if (actor.z == 0) {
          new_corners_by_name['middle_down'] = actor;
        }
        if (actor.z == Math.floor(Z_SIZE / 2)) {
          new_corners_by_name['middle'] = actor;
        }
        if (actor.z == Z_SIZE - 1) {
          new_corners_by_name['middle_up'] = actor;
        }
      }
    }
    actors_by_name = Object.assign(new_actors_by_name);
    corners_by_name = Object.assign(new_corners_by_name);
    // create the sorted version for displaying corner buttons
    // https://www.w3docs.com/snippets/javascript/how-to-sort-javascript-object-by-key.html
    const sortObject = (obj) =>
      Object.keys(obj)
        .sort()
        .reduce((res, key) => ((res[key] = obj[key]), res), {});
    sorted_corners_by_name = sortObject(new_corners_by_name);
    create_corner_buttons();
    set_selected_corner('middle');
  }

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

  function create_corner_buttons() {
    // we clear all previous buttons
    while (elem_view_select.lastElementChild) {
      elem_view_select.removeChild(elem_view_select.lastElementChild);
    }
    for (const name in sorted_corners_by_name) {
      if (sorted_corners_by_name.hasOwnProperty(name)) {
        const entry = document.createElement('li');
        entry.textContent = name;
        entry.addEventListener('click', (event) => set_selected_corner(name));
        elem_view_select.appendChild(entry);
      }
    }
  }

  /*
		Pause
	*/
  let is_paused = false;
  let sim_time = 0;
  let prev_regl_time = 0;

  register_keyboard_action('p', () => (is_paused = !is_paused));

  /*
    Update actor list
  */
  let error_on_receive = false;
  let querying_new_tiles = false;
  let received_new_tiles = true;

  register_keyboard_action('g', () => {
    // we prefer sending requests for new tiles one by one
    if (!querying_new_tiles) {
      error_on_receive = false;
      querying_new_tiles = true;
      received_new_tiles = false;
      // no constraints specified, we send empty
      query_new_tileset([]);
    }
  });

  async function query_new_tileset(user_constraints) {
    if (!querying_new_tiles) {
      return;
    }
    console.log(
      'Sending request: http://localhost:3333?'.concat(stringify_constraints(user_constraints))
    );
    fetch('http://localhost:3333?'.concat(stringify_constraints(user_constraints)), {
      mode: 'no-cors',
    })
      .then((response) => {
        // receiving a response means the json file has been written
        console.log('received a response');
        querying_new_tiles = false;
        load_text('./WaveCollapse_classes/tiles.json')
          .then((json_tiles) => {
            try {
              const parsed_json = JSON.parse(json_tiles);
              if (parsed_json.length == X_SIZE * Y_SIZE * Z_SIZE) {
                // We know that the received JSON encodes one object per tile
                console.log('successfuly received new tiles set');
                error_on_receive = false;

                // we update the tiles list and create the updated actors
                tiles = floor_tiles.concat(create_new_tileset(parsed_json));
                create_actor_list().then(() => {
                  create_actor_corner_by_name();
                  received_new_tiles = true;
                });
              } else {
                error_on_receive = true;
                querying_new_tiles = false;
                console.error('Error on parsing the json tiles - unvalid format for tiles');
              }
              return;
            } catch (error) {
              error_on_receive = true;
              querying_new_tiles = false;
              console.error('Error on parsing the json tiles - unvalid format for tiles');
              return;
            }
          })
          .catch((error) => {
            error_on_receive = true;
            querying_new_tiles = false;
            console.error('Error on taking the json tiles - cant load the json file:' + error);
            return;
          });
      })
      .catch((error) => {
        error_on_receive = true;
        querying_new_tiles = false;
        console.error('Error on receiving the tiles - connection failed');
        return;
      });
  }

  // from the received json we create the next value for 'tiles' variable
  function create_new_tileset(parsed_json) {
    const new_tileset = [];
    for (const tile of parsed_json) {
      new_tileset.push({
        id: tile.id,
        x: index_to_coord_x(tile.index),
        y: index_to_coord_y(tile.index),
        z: index_to_coord_z(tile.index),
      });
    }
    return [].concat(new_tileset);
  }

  // Methods to convert from and to the index in the flat array representing our tiles world.
  function coordinates_to_index(x, y, z) {
    return parseInt(x) + X_SIZE * parseInt(y) + Y_SIZE * X_SIZE * parseInt(z);
  }

  function index_to_coord_x(index) {
    return parseInt(index) % X_SIZE;
  }

  function index_to_coord_y(index) {
    return Math.floor(parseInt(index) / X_SIZE) % Y_SIZE;
  }

  function index_to_coord_z(index) {
    return Math.floor(parseInt(index) / X_SIZE / Y_SIZE) % Z_SIZE;
  }

  /*
    Update actors list with constraints
  */
  function send_with_constraints() {
    const position = document.getElementById('pos-tiles');
    const x = 0;
    let y = -1;
    let z = -1;
    for (var i = 0; i < position.length; ++i) {
      if (position[i].checked) {
        console.log(position[i].id + ' checked');
        y = i % X_SIZE;
        z = Z_SIZE - 1 - Math.floor(i / X_SIZE);
      }
    }

    const tile = document.getElementById('img-tiles');
    let tile_id = '';
    for (var i = 0; i < tile.length; ++i) {
      if (tile[i].checked) {
        console.log(tile[i].id + ' checked');
        tile_id = [].concat(tile[i].id);
      }
    }

    if (y != -1 && z != -1 && tile_id !== '' && check_constraint_valid(z, tile_id)) {
      WFC_overlay.classList.toggle('hidden');
      if (!querying_new_tiles) {
        querying_new_tiles = true;
        received_new_tiles = false;
        error_on_receive = false;
        // boilerplates the x,y inversion
        query_new_tileset({ x: y, y: x, z: z, id: tile_id });
      }
      return;
    } else {
      alert(
        "The tile you selected can't be put at the desired position :( Please try another layout"
      );
    }
    return;
  }

  function check_constraint_valid(z, tile_id) {
    if (z == 0) {
      if (
        !(
          tile_id[0] === 'tile_1_right' ||
          tile_id[0] === 'tile_1_alone' ||
          tile_id[0] === 'tile_1_left' ||
          tile_id[0] === 'tile_1_alone_nr' ||
          tile_id[0] === 'tile_1_middle' ||
          tile_id[0] === 'tile_1_right_nr' ||
          tile_id[0] === 'tile_1_left_nr' ||
          tile_id[0] === 'tile_1_middle'
        )
      ) {
        return false;
      }
      return true;
    } else {
      if (
        tile_id[0] === 'tile_1_right' ||
        tile_id[0] === 'tile_1_alone' ||
        tile_id[0] === 'tile_1_left' ||
        tile_id[0] === 'tile_1_alone_nr' ||
        tile_id[0] === 'tile_1_middle' ||
        tile_id[0] === 'tile_1_right_nr' ||
        tile_id[0] === 'tile_1_left_nr' ||
        tile_id[0] === 'tile_1_middle'
      ) {
        return false;
      }
      return true;
    }
  }

  // we prepare the GET query generated from the buttons
  function stringify_constraints(user_constraints) {
    if (Object.keys(user_constraints).length == 0) {
      return 'index=-1&tileId=air_b';
    }

    let stringified = '';

    const index = coordinates_to_index(user_constraints.x, user_constraints.y, user_constraints.z);
    stringified = stringified.concat('index=' + index + '&' + 'tileId=' + user_constraints.id);

    return stringified;
  }
  /*---------------------------------------------------------------
		Frame render
	---------------------------------------------------------------*/

  // List of objects to draw
  let draw_list = actors_list.slice();
  //draw_list.push(grid_actor_interface);

  // Consider the sun, which locates at [0, 0, 0], as the only light source
  const light_position_world = [80, 60, 60, 1];
  const light_position_cam = [0, 0, 0, 1];
  const light_color = [0.85, 0.8, 0.85];

  //add the light_color to the tiles except sun and billboard
  for (const actor of actors_list) {
    if (actor instanceof PhongTileActor) {
      actor.light_color = light_color;
    }
  }

  const mat_view = mat4.create();
  const camera_position = [0, 0, 0];
  const selected_corner_translation_mat = mat4.create();

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

    // have to recompute the actors list (changes over time now)
    draw_list = actors_list.slice();

    // Calculate model matrices
    for (const actor of actors_list) {
      if (actor.name === 'grass' || received_new_tiles) {
        // we don't render tiles if we are receiving new tiles (grass excepted as kept always the same)
        if (actor instanceof PhongTileActor) {
          actor.light_color = light_color;
        }
        actor.calculate_model_matrix({ sim_time: sim_time });
      }
    }

    if (received_new_tiles) {
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
          const selected_corner_model_mat =
            corners_by_name[selected_corner_name].mat_model_to_world;
          const selected_corner_position = mat4.getTranslation(
            [0, 0, 0],
            selected_corner_model_mat
          );
          vec3.scale(selected_corner_position, selected_corner_position, -1);

          mat4.fromTranslation(selected_corner_translation_mat, selected_corner_position);
          mat4_matmul_many(mat_view, mat_world_to_cam, selected_corner_translation_mat);
        }
      }
    } else {
      // if we did not yet received the new tiles, we keep the same camera position and update juste the rotation/zoom transforms (with mat_world_to_cam)
      mat4_matmul_many(mat_view, mat_world_to_cam, selected_corner_translation_mat);
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
      if ((actor.name === 'grass' || received_new_tiles) && actor.name !== 'air') {
        // we don't render actor if we're receiving tiles (except grass ground) or if it's 'air' tile (nothing)
        try {
          actor.draw(draw_info);
        } catch (e) {
          console.error('Error when rendering actor:', actor);
          throw e;
        }
      }
      // for better performance we should collect these props and then draw them all together
      // http://regl.party/api#batch-rendering
    }

    debug_text.textContent = `
Try generate new houses! You can set one constraint or let the algorithm output a full surprise !
cam pos ${vec_to_string(camera_position)}
`;
    if (error_on_receive) {
      debug_text.textContent = debug_text.textContent.concat(
        'Error on receiving new tiles set :( Try again (make sure you launched the java server: java icg_project/WaveCollapse_classes/JavaServer)'
      );
    } else if (querying_new_tiles) {
      debug_text.textContent = debug_text.textContent.concat(
        'Request for new tiles sent, please wait ...(this can take a while)'
      );
    } else if (!querying_new_tiles && !received_new_tiles) {
      debug_text.textContent = debug_text.textContent.concat(
        'New tiles set created, rendering in process ...'
      );
    } else if (received_new_tiles) {
      debug_text.textContent = debug_text.textContent.concat('New tiles set received !!');
    }
  });
}

DOM_loaded_promise.then(main);
