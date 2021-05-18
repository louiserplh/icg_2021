import {
  getAir,
  getFloor,
  getFloorAir,
  getTilesList,
} from "./tile_database.js";

export class Tile {
  constructor(
    id, // The string identificator of the tile
    front_socket, // For each face, return the index of compaptibility socket, see tile_database.js
    back_socket,
    left_socket,
    right_socket,
    top_socket,
    bottom_socket,
    door_socket
  ) {
    this.id = id;
    this.front_socket = front_socket;
    this.back_socket = back_socket;
    this.left_socket = left_socket;
    this.right_socket = right_socket;
    this.top_socket = top_socket;
    this.bottom_socket = bottom_socket;
    this.door_socket = door_socket;

    // sets of matching tiles for each face
    this.matching = {
      left: [],
      right: [],
      front: [],
      back: [],
      up: [],
      down: [],
    };
  }

  /* Sockets utility function */
  // accessor for our sockets
  getId() {
    return this.id;
  }

  getFrontSocket() {
    return this.front_socket;
  }

  getBackSocket() {
    return this.back_socket;
  }

  getLeftSocket() {
    return this.left_socket;
  }

  getRightSocket() {
    return this.right_socket;
  }

  getTopSocket() {
    return this.top_socket;
  }

  getBottomSocket() {
    return this.bottom_socket;
  }

  getSocketByIndex(index) {
    if (!(0 <= index && index < 6)) {
      throw new IllegalArgumentException();
    }

    switch (index) {
      case 0:
        return this.front_socket;
      case 1:
        return this.back_socket;
      case 2:
        return this.left_socket;
      case 3:
        return this.right_socket;
      case 4:
        return this.top_socket;
      case 5:
        return this.bottom_socket;
      default:
        throw new IllegalStateException(
          "Cannot find socket for index " + index
        );
    }
  }

  getSocketNameByIndex(index) {
    if (!(0 <= index && index <= 6)) {
      throw new IllegalArgumentException();
    }

    switch (index) {
      case 0:
        return "front";
      case 1:
        return "back";
      case 2:
        return "left";
      case 3:
        return "right";
      case 4:
        return "top";
      case 5:
        return "bottom";
      case 6:
        return "any side";
      default:
        throw new IllegalStateException(
          "Cannot find socket name index" + index
        );
    }
  }

  getDoorSocket() {
    return this.door_socket;
  }

  /* Matching sockets computation */

  // TODO : BE SURE TO UNDERSTAND THIS ONE
  compatibleTilesOnSide(side) {
    const socket = this.getSocketByIndex(side);
    const compatibleTiles = [];

    if (socket == -2) {
      if (side != 5) {
        compatibleTiles.push(getFloor());
      }
      return compatibleTiles;
    }

    if (
      side == 0 &&
      !this.id === "floor" &&
      !this.id === "air" &&
      !this.is === "air_b"
    ) {
      if (this.getBottomSocket() == getFloor().getTopSocket()) {
        compatibleTiles.push(getFloorAir());
      } else {
        compatibleTiles.put(getAir());
      }

      return compatibleTiles;
    }

    if (this.getDoorSocket() == side) {
      if (this.getBottomSocket() == 0) {
        compatibleTiles.push(getFloorAir());
      } else {
        compatibleTiles.push(getAir());
      }
      return compatibleTiles;
    }
    const allTiles = getTilesList();
    const nb_tiles = allTiles.length;
    for (i = 0; i < nb_tiles; ++i) {
      otherT = allTiles.get(i);
      if (
        !(
          otherT.equals(this) &&
          !this.getId().equals("air") &&
          !this.getId().equals("air_b")
        )
      ) {
        corresponding = this.getCorrespondingSide(index);
        otherSocket = otherT.getSocketByIndex(corresponding);
        if (socket == otherSocket) {
          compatibleTiles.push(otherT);
        }
      }
    }

    return compatibleTiles;
  }

  // ENDS HERE THE TODO

  equals(obj) {
    if (!(obj instanceof Tile)) {
      throw new IllegalArgumentException();
    }

    // Only ASCII characters in id names, we can use ===
    return obj.getId() === this.id;
  }
}
