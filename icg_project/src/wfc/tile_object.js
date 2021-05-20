export class Tile {
  constructor(
    id, // The string identificator of the tile
    front_socket, // For each face, return the index of compaptibility socket, see tile_database.js
    back_socket,
    left_socket,
    right_socket,
    top_socket,
    bottom_socket,
    door_side
  ) {
    this.id = id;
    this.front_socket = front_socket;
    this.back_socket = back_socket;
    this.left_socket = left_socket;
    this.right_socket = right_socket;
    this.top_socket = top_socket;
    this.bottom_socket = bottom_socket;
    this.door_side = door_side; // specifies on which side there's a door (-1 if no door)
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

  getDoorSide() {
    return this.door_side;
  }
}
