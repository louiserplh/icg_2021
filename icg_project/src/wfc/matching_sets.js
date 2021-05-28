import { Tile } from "./tile_object.js";
import {
  getAir,
  getFloor,
  getFloorAir,
  getTilesList,
} from "./tile_database.js";
import { DOM_loaded_promise } from "../icg_web.js";

/* This class makes sure to create the JSon file that sepcifies the matching tiles on each side of each tile */

const tiles = getTilesList();

/**
 * @returns a map such that :
 * [{id:tile_id,
 *   matching:
 *      [side:side_index,
 *       matching_on_side:
 *          [{id:other_tile_id,
 *            side:other_tile_macthing_side},...]
 *     },...]
 */
export function createMatchingTilesJson() {
  const nb_tiles = tiles.length;
  const map_matching = [];

  for (var i = 0; i < nb_tiles; ++i) {
    const tile = tiles[i];
    const matchingForSide = [];
    for (var j = 0; j < 6; ++j) {
      const matchSideJ = matchingForTileOnSide(tile, j);
      matchingForSide.push({ side: j, matching_on_side: matchSideJ });
    }
    map_matching[i] = { id: tile.getId(), matching: matchingForSide };
  }

  const json = JSON.stringify(map_matching);
  console.log(json);

  return map_matching;
}

export function createMatchingTiles() {
  const nb_tiles = tiles.length;
  const map_matching = [];

  for (var i = 0; i < nb_tiles; ++i) {
    const tile = tiles[i];
    const matchingForSide = [];
    for (var j = 0; j < 6; ++j) {
      const matchSideJ = matchingForTileOnSide(tile, j);
      matchingForSide.push({ side: j, matching_on_side: matchSideJ });
    }
    map_matching[i] = { id: tile.getId(), matching: matchingForSide };
  }

  return map_matching;
}

function matchingForTileOnSide(tile, side) {
  const socket = tile.getSocketByIndex(side);
  const nb_tiles = tiles.length;
  const mapping = [];

  if (socket == -2) {
    if (side != 5) {
      mapping.push({ id: getFloor().getId(), side: side });
    }
    return [].concat(mapping);
  }

  if (
    side == 0 &&
    !tile.getId() === "floor" &&
    !tile.getId() === "air" &&
    !tile.getId() === "air_b"
  ) {
    if (tile.getBottomSocket() == getFloor().getTopSocket()) {
      mapping.push({ id: getFloorAir().getId(), side: side }); //side or any side ?
    } else {
      mapping.push({ id: getFloorAir().getId(), side: side }); //side or any side ?
    }

    return [].concat(mapping);
  }

  if (tile.getDoorSide() == side) {
    if (tile.getBottomSocket() == 0) {
      mapping.push({ id: getFloorAir().getId(), side: side });
    } else {
      mapping.push({ id: getAir().getId(), side: side });
    }
    return [].concat(mapping);
  }

  for (var i = 0; i < nb_tiles; ++i) {
    const otherTile = tiles[i];
    for (var j = 0; j < 6; ++j) {
      const otherSocket = otherTile.getSocketByIndex(j);
      if (otherSocket == socket) {
        mapping.push({ id: otherTile.getId(), side: j });
      }
    }
  }
  return [].concat(mapping);
}

DOM_loaded_promise.then(createMatchingTilesJson);
