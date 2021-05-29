
import java.util.ArrayList;
import java.util.List;

public class TileCorrespondences {

    private Tile tile;
    private List<Tile> leftTiles;
    private List<Tile> rightTiles;
    private List<Tile> frontTiles;
    private List<Tile> backTiles;
    private List<Tile> topTiles;
    private List<Tile> bottomTiles;

    public TileCorrespondences(Tile tile) {
        this.tile = tile;
    }

    public TileCorrespondences(Tile tile, List<Tile> leftTiles, List<Tile> rightTiles, List<Tile> frontTiles, List<Tile> backTiles, List<Tile> topTiles, List<Tile> bottomTiles) {
        this.tile = tile;
        this.leftTiles = new ArrayList<>(leftTiles);
        this.rightTiles = new ArrayList<>(rightTiles);
        this.frontTiles = new ArrayList<>(frontTiles);
        this.backTiles = new ArrayList<>(backTiles);
        this.topTiles = new ArrayList<>(topTiles);
        this.bottomTiles = new ArrayList<>(bottomTiles);
    }
    
    public Tile getTile() {
        return tile;
    }

    public void setLeftTiles(List<Tile> leftTiles) {
        this.leftTiles = new ArrayList<>(leftTiles);
    }

    public List<Tile> getLeftTiles() {
        return leftTiles;
    }

    public void setRightTiles(List<Tile> rightTiles) {
        this.rightTiles = new ArrayList<>(rightTiles);
    }

    public List<Tile> getRightTiles() {
        return rightTiles;
    }

    public void setFrontTiles(List<Tile> frontTiles) {
        this.frontTiles = new ArrayList<>(frontTiles);
    }

    public List<Tile> getFrontTiles() {
        return frontTiles;
    }

    public void setBackTiles(List<Tile> backTiles) {
        this.backTiles = new ArrayList<>(backTiles);
    }

    public List<Tile> getBackTiles() {
        return backTiles;
    }

    public void setTopTiles(List<Tile> topTiles) {
        this.topTiles = new ArrayList<>(topTiles);
    }

    public List<Tile> getTopTiles() {
        return topTiles;
    }

    public void setBottomTiles(List<Tile> bottomTiles) {
        this.bottomTiles = new ArrayList<>(bottomTiles);
    }

    public List<Tile> getBottomTiles() {
        return bottomTiles;
    }

    public List<Tile> getCompatibleTilesBySide(TileSide side) {

        switch(side) {
            case FRONT:
                return frontTiles;
            case BACK:
                return backTiles;
            case RIGHT:
                return rightTiles;
            case LEFT:
                return leftTiles;
            case TOP:
                return topTiles;
            default:
                return bottomTiles;
        }
    }

}
