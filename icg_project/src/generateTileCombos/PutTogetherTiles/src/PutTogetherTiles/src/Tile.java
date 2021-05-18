package PutTogetherTiles.src;

public class Tile {

    private String id;

    private int front_socket;
    private int back_socket;
    private int left_socket;
    private int right_socket;
    private int top_socket;
    private int bottom_socket;

    private int door_socket;

    public Tile(String id, int front_socket, int back_socket, int left_socket, int right_socket, int top_socket,
            int bottom_socket, int door_socket) {
        this.id = id;
        this.front_socket = front_socket;
        this.back_socket = back_socket;
        this.left_socket = left_socket;
        this.right_socket = right_socket;
        this.top_socket = top_socket;
        this.bottom_socket = bottom_socket;

        this.door_socket = door_socket;
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

    public int getSocketByIndex(int index) {
        if (!(0 <= index && index < 6)) {
            throw new IllegalArgumentException();
        }

        switch (index) {
            case 0:
                return front_socket;
            case 1:
                return back_socket;
            case 2:
                return left_socket;
            case 3:
                return right_socket;
            case 4:
                return top_socket;
            default:
                return bottom_socket;
        }
    }

    public String getSocketNameByIndex(int index) {
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
            default:
                return "any side";
        }
    }

    public int getDoorSocket() {
        return door_socket;
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