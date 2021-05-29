import { load_text } from './icg_web';

export function query_new_tileset(user_contraints) {
  console.log('Sending request');
  fetch('http://localhost:3333?' + stringify_constraints(user_contraints))
    .then((response) => {
      console.log('received a response');
      load_text('./WaveCollapse_classes/tiles.json')
        .then((json_tiles) => {
          try {
            const parsed_json = JSON.parse(json_tiles);
            if (
              parsed_json.length == 27 &&
              parsed_json[Math.floor(Math.random() * 26)].hasOwnProperty('id') &&
              parsed_json[Math.floor(Math.random() * 26)].hasOwnProperty('x') &&
              parsed_json[Math.floor(Math.random() * 26)].hasOwnProperty('y') &&
              parsed_json[Math.floor(Math.random() * 26)].hasOwnProperty('z')
            ) {
              // We know that the received JSON encodes correctly our tileset (random checks on some tile's properties)
              console.log('successfuly received new tiles set');
              return Object.assign(parsed_json);
            }
          } catch (error) {
            console.error('Error on parsing the json tiles - unvalid format for tiles');
          }
        })
        .catch((error) => {
          console.error('Error on taking the json tiles - cant load the json file:' + error);
          return [];
        });
    })
    .catch((error) => {
      console.error('Error on receiving the tiles - connection failed:' + error);
      return [];
    });
}

function stringify_constraints(user_contraints) {
  let stringified = '';
  for (constraint in user_contraints) {
    const index = coordinates_to_index(constraint.x, constraint.y, constraint.z);
    stringified.concat('index=' + index + '&' + 'tileId=' + constraint.id + '&');
  }

  // we must remove the last '&'
  return stringified.substring(0, stringified.length - 1);
}

// Methods to convert from and to the index in the flat array representing our tiles world.
function coordinates_to_index(x, y, z) {
  return x + this.x_size * y + this.x_size * this.y_size * z;
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
