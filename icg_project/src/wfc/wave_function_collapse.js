import { Tile } from "./tile_object.js";
import { createMatchingTilesJson } from "./matching_sets.js";
import { getTilesList } from "./tile_database.js";

/* This file gives functions to performs the WFC algorithm and output a houses layout that respects our constraints */

export class WFC {
  constructor(matchings_tiles, x_size, y_size, z_size) {
    this.tiles = getTilesList();
    this.matchings_tiles = matchings_tiles; // expected to be the object created in matching_sets.js
    this.x_size = x_size; // the dimensions of our generated space of tiles (in number of tiles)
    this.y_size = y_size;
    this.z_size = z_size + 1;
    this.total_size = x_size * y_size * (z_size + 1); // the total amount of cells
    this.nb_tiles = this.tiles.length;

    this.possible_tiles_per_cell = []; // should evolve with propagation of constraints: represents which tiles can be selected for each cell at any step
    for (var i = 0; i < this.total_size; ++i) {
      this.possible_tiles_per_cell.push(this.tiles);
    }

    this.generate_layout();

  }

  generate_layout() {

    for(var x = 0; x < this.x_size; ++x) {
      for(var y = 0; y < this.y_size; ++y) {
        var index = this.coordinates_to_index(x, y, 0);
        var tiles = [];
        tiles.push(new Tile("floor", -2, -2, -2, -2, 0, -2, -1));
        this.possible_tiles_per_cell.splice(index, 1, tiles);

        this.propagate(index);
      }
    }

    while(!this.is_collapsed()) {
        this.iterate();
    }

    if(this.check_validity()) {
      return this.possible_tiles_per_cell;
    }
    else {
      return [];
    }

  }

  iterate() {
    var index = this.get_minimum_entropy_coordinates;
    this.collapse(index);
    this.propagate(index);

  }

  collapse(tile_index) {
    var possibleTiles = this.possible_tiles_per_cell[i];
    var random = Math.floor(Math.random * possibleTiles.length);

    var l = [];
    l.push(possibleTiles[random]);
    this.possible_tiles_per_cell.splice(tile_index, 1, l);

  }

  check_validity() {

    for(var i = 0; i < this.total_size; ++i) {

      if(this.possible_tiles_per_cell[i].length == 0) {
        return false;
      }

      var t = this.possible_tiles_per_cell[i][0];
      var adjacents = this.get_adjacent_tiles_indexes(i);

      for(var j = 0; j < adjacents.length; ++j) {

        var index = adjacents[j];
        if(index == -1) {

          if(this.possible_tiles_per_cell[index].length == 0) {
            return false;
          }

          var t_other = this.possible_tiles_per_cell[index][0];
          
          var poss_neigh = this.get_possible_neighbours(i, j);

          if(!this.tile_list_contains(t_other, poss_neigh)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  propagate(tile_index) {
    const stack = [];

    stack.push(tile_index);

    while (stack.length > 0) {
      const current_index = stack.pop();
      const adjacents = this.get_adjacent_tiles_indexes(tile_index);

      for(var i = 0; i < 6; ++i){
          if(adjacents[i] > -1){
            const possible_adjacent_neighbours = this.possible_tiles_per_cell[adjacents[i]];
            const possible_adjacent_neighbours_copy = this.possible_tiles_per_cell[adjacents[i]].slice();
            
            const matching_neighbours = this.get_possible_neighbours(current_index, i);

            if(possible_adjacent_neighbours.length > 1) {
              for(var j = 0; j < possible_adjacent_neighbours.length; ++j) {
                if(!this.tile_list_contains(possible_adjacent_neighbours[j], matching_neighbours)) {

                  var tile = possible_adjacent_neighbours[j];
                  var max = possible_adjacent_neighbours_copy.length;
                  var k = 0;

                  while(k < max) {
                    if(possible_adjacent_neighbours_copy[k] == tile) {
                      possible_adjacent_neighbours_copy.splice(k, 1);
                      k = max;
                    }
                    k += 1;
                  }

                  if(!stack.includes(adjacents[i])) {
                    stack.push(adjacents[i]);
                  }

                }

              }
              this.possible_tiles_per_cell.splice(adjacents[i], 1, possible_adjacent_neighbours_copy);
            }
          }
      }
    }
  }

  get_adjacent_tiles_indexes(tile_index) {
    const x = this.index_to_coord_x(tile_index);
    const y = this.index_to_coord_y(tile_index);
    const z = this.index_to_coord_z(tile_index);

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
    const possible_tiles = this.possible_tiles_per_cell[tile_index];
    const possible_neighbours = [];
    const nb_possible_tiles = possible_tiles.length;

    // goes through all current possible tiles on index
    for (var i = 0; i < nb_possible_tiles; ++i) {
      // retrieves the tile_index in tiles array of the current tile
      const possible_tile_index = this.tiles.findIndex(
        (tile) => tile.getId() === possible_tiles[i].id
      );

      // gets the tiles matching with the current one
      const matching = this.matchings_tiles[
        possible_tile_index
      ].matching.filter(
        (matching_elem) =>
          // in the matching elements for our tile, retrieves the one that matches on desired side
          matching_elem.side == side
      ).matching_on_side;

      possible_neighbours.push(matching);
    }
    return [].concat(possible_neighbours);
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

  tile_list_contains(tile, list) {
    for (var i = 0; i < list.length; ++i) {
      if (list[i] == tile) {
          return true;
      }
  }
  return false;
  }


  tile_array_intersection_length(array1, array2) {
    return array1.filter((tile1) =>
      array2.filter((tile2) => tile2.getId() === tile1.getId())
    ).length;
  }

}
