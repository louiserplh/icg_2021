import { Tile } from "./tile_object.js";
import { createMatchingTilesJson } from "./matching_sets.js";
import { getTilesList } from "./tile_database.js";

/* This file gives functions to performs the WFC algorithm and output a houses layout that respects our constraints */

tiles = getTilesList();

export class WFC {
  constructor(matchings_tiles, x_size, y_size, z_size) {
    this.matchings_tiles = matchings_tiles; // expected to be the object created in matching_sets.js
    this.x_size = x_size; // the dimensions of our generated space of tiles (in number of tiles)
    this.y_size = y_size;
    this.z_size = z_side;
    this.total_size = x_size * y_size * z_size; // the total amount of cells
    this.nb_tiles = tiles.length;

    this.possible_tiles_per_cell = []; // should evolve with propagation of constraints: represents which tiles can be selected for each cell at any step
    for (var i = 0; i < this.total_size; ++i) {
      this.possible_tiles_per_cell.push({
        id: tiles[i].getId(),
        possible_tiles: tiles,
      });
    }
  }

  generate_layout() {}

  propagate(tile_index) {
    const stack = [];

    stack.push(tile_index);

    while (stack.length > 0) {
      const current_index = stack.pop();
      const adjacents = this.get_adjacent_tiles_indexes(tile_index);

      for(var i = 0; i < 6; ++i){
          if(adjacents[i] > -1){
            const possible_adjacent_neighbours = this.possible_tiles_per_cell[adjacents[i]];
            const matching_neighbours = this.get_possible_neighbours();

            for(var j = 0; j < 6; ++j){
                
            }
          }
      }
    }
  }

  get_adjacent_tiles_indexes(tile_index) {
    const x = indexTocoordinate_x(tile_index);
    const y = indexTocoordinate_y(tile_index);
    const z = indexTocoordinate_z(tile_index);

    const lower_tile = z > 0 ? this.coordinates_to_index(x, y, z - 1) : -1;
    const upper_tile =
      z < this.z_size - 1 ? this.coordinates_to_index(x, y, z + 1) : -1;

    const left_tile = x > 0 ? this.coordinates_to_index(x - 1, y, z) : -1;
    const right_tile =
      x < this.x_size - 1 ? this.coordinates_to_index(x + 1, y, z) : -1;

    const front_tile = y > 0 ? this.coordinates_to_index(x, y - 1, z) : -1;
    const back_tile =
      y < this.y_size - 1 ? this.coordinates_to_index(x, y + 1, z) : -1;

    return [
      lower_tile,
      upper_tile,
      left_tile,
      right_tile,
      front_tile,
      back_tile,
    ];
  }

  // Returns the matching tiles for the tile (given through its index in possible_tiles_per_cell array) on a certain side
  get_possible_neighbours(tile_index, side) {
    // retrieves the index of our tile (on tile_index in our world) in the tiles list
    const index_in_tiles = tiles.findIndex(function findMatchingId(tile) {
      tile.id === possible_tiles_per_cell[tile_index].id;
    });
    // the index found in the one of the tile in matching tiles, we now return the matches for it on side j
    return this.matchings_tiles[index_in_tiles].matchings.find(function onSidej(
      j
    ) {
      return side == j;
    }).matchings_tiles;
  }

  // returns the index of the tile (in possible_tiles_per_cell variable) which has the lowest entropy (random choice on ties)
  get_minimum_entropy_coordinates() {
    var minimum_entropy = 1;
    var same_entropy_cells = [];

    for (var i = 0; i < this.total_size; ++i) {
      remaining_possible_on_tile =
        this.possible_tiles_per_cell[i].possible_tiles.length;
      if (remaining_possible_on_tile > 1) {
        if (minimum_entropy == 1) {
          minimum_entropy = remaining_possible_on_tile;
          same_entropy_cells = [i];
        } else {
          if (remaining_possible_on_tile < minimum_entropy) {
            same_entropy_cells.push(i);
          }
        }
      }
    }

    if (same_entropy_cells.length == 1) {
      return same_entropy_cells[0];
    } else {
      random_index = Math.floor(Math.random() * same_entropy_cells.length);
      return same_entropy_cells[random_index];
    }
  }

  // Methods to convert from and to the index in the flat array representing our tiles world.
  coordinates_to_index(x, y, z) {
    return x + this.x_size * y + this.x_size * this.y_size * z;
  }

  index_to_coord_x(index) {
    return index % this.x_size;
  }

  index_to_coord_y(index) {
    return (index / this.x_size) % this.y_size;
  }

  index_to_coord_z(index) {
    return (index / this.x_size / this.y_size) % this.z_size;
  }

  // Checks wether the function is collapsed (true if only one possible layout remains)
  is_collapsed() {
    for (var i = 0; i < this.nb_tiles; ++i) {
      if (this.possible_tiles_per_cell[i].possible_tiles.length > 1) {
        return false;
      }
    }
    return true;
  }
}
