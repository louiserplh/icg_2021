import { load_text } from './icg_web.js';

export function query_new_tileset(user_constraints) {
  console.log('Sending request');
  return fetch('http://localhost:3333?' + stringify_constraints(user_constraints), {
    mode: 'no-cors',
  })
    .then((response) => {
      console.log('received a response');
      load_text('./WaveCollapse_classes/tiles.json')
        .then((json_tiles) => {
          try {
            const parsed_json = JSON.parse(json_tiles);
            if (parsed_json.length == 75) {
              // We know that the received JSON encodes one object per tile
              console.log('successfuly received new tiles set');
              tiles = Object.assign(parsed_json);
            } else {
              console.error('Error on parsing the json tiles - unvalid format for tiles');
            }
          } catch (error) {
            console.error('Error on parsing the json tiles - unvalid format for tiles');
          }
        })
        .catch((error) => {
          console.error('Error on taking the json tiles - cant load the json file:' + error);
        });
    })
    .catch((error) => {
      console.error('Error on receiving the tiles - connection failed:' + error);
    });
}

function stringify_constraints(user_constraints) {
  let stringified = '';
  for (const constraint of user_constraints) {
    const index = coordinates_to_index(constraint.x, constraint.y, constraint.z);
    stringified.concat('index=' + index + '&' + 'tileId=' + constraint.id + '&');
  }
  // we must remove the last '&'
  return stringified.substring(0, stringified.length - 1);
}

// Methods to convert from and to the index in the flat array representing our tiles world.
function coordinates_to_index(x, y, z) {
  return parseInt(x) + 5 * parseInt(y) + 5 * 5 * parseInt(z);
}

function index_to_coord_x(index) {
  return index % this.x_size;
}

function index_to_coord_y(index) {
  return (index / this.x_size) % this.y_size;
}

function index_to_coord_z(index) {
  return (index / this.x_size / this.y_size) % this.z_size;
}
