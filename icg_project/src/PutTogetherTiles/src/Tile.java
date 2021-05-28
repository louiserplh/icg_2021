package PutTogetherTiles.src;

import java.lang.Comparable;

public class Tile {

    private String id;

    private int front_socket;
    private int back_socket;
    private int left_socket;
    private int right_socket;
    private int top_socket;
    private int bottom_socket;

    private TileSide door_side;

    public Tile(String id, int front_socket, int back_socket, int left_socket, int right_socket, int top_socket,
            int bottom_socket, TileSide door_socket) {
        this.id = id;
        this.front_socket = front_socket;
        this.back_socket = back_socket;
        this.left_socket = left_socket;
        this.right_socket = right_socket;
        this.top_socket = top_socket;
        this.bottom_socket = bottom_socket;

        this.door_side = door_socket;
    }

    public String getId() {
        return id;
    }

    public int getFrontSocket() {
        return front_socket;
    }

    public int getBackSocket() {
        return back_socket;
    }

    public int getLeftSocket() {
        return left_socket;
    }

    public int getRightSocket() {
        return right_socket;
    }

    public int getTopSocket() {
        return top_socket;
    }

    public int getBottomSocket() {
        return bottom_socket;
    }

    public int getSocketBySide(TileSide side) {

        switch (side) {
            case FRONT:
                return front_socket;
            case BACK:
                return back_socket;
            case LEFT:
                return left_socket;
            case RIGHT:
                return right_socket;
            case TOP:
                return top_socket;
            case BOTTOM:
                return bottom_socket;
            default:
                return -2;
        }
    }

    public TileSide getDoorSide() {
        return door_side;
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof Tile)) {
            throw new IllegalArgumentException();
        }
        Tile t = (Tile) obj;

        return t.getId().equals(id);
    }

}