package PutTogetherTiles.src;

import java.io.File; // Import the File class
import java.io.IOException;
import java.io.FileWriter;
import java.util.*;
import java.util.ArrayList;

public class PutTogetherTiles {    

    /**
     * Computes for every tile what tiles can be attached to each side
     * @return a list of tile correspondences storing this information
     */
    public static List<TileCorrespondences> createCorrespondences() {

        List<Tile> tiles = new TilesDB().getTilesList();
        List<TileCorrespondences> correses = new ArrayList<>();

        // iterate over all tiles
        for (int i = 0; i < tiles.size(); ++i) {

            // create a new tilecorrespondence object for each tile
            TileCorrespondences c = new TileCorrespondences(tiles.get(i));

            // iterate over all 6 sides of the tile
            for (TileSide side : TileSide.values()) {

                if(side != TileSide.INVALID) {

                    // get compatible tiles for side j of tile i
                    List<Tile> compatibleTiles = findCompatibleTiles(tiles.get(i), side, tiles);

                    // store the resulting list of compatible tiles in the correct attribute
                    switch (side) {
                        case FRONT:
                            c.setFrontTiles(new ArrayList<Tile>(compatibleTiles));
                            break;
                        case BACK:
                            c.setBackTiles(new ArrayList<Tile>(compatibleTiles));
                            break;
                        case LEFT:
                            c.setLeftTiles(new ArrayList<Tile>(compatibleTiles));
                            break;
                        case RIGHT:
                            c.setRightTiles(new ArrayList<Tile>(compatibleTiles));
                            break;
                        case TOP:
                            c.setTopTiles(new ArrayList<Tile>(compatibleTiles));
                            break;
                        default:
                            c.setBottomTiles(new ArrayList<Tile>(compatibleTiles));

                    }
                }
            }
            correses.add(c);
        }

        return correses;

    }

    /**
     * Finds all the tiles compatible with the specific side of a specific tile 
     * 
     * @param t the tile to find compatible tiles for
     * @param side the index of the side that we are searching compatibilities for
     * @param allTiles the list of all tiles
     * @return
     */
    public static List<Tile> findCompatibleTiles(Tile t, TileSide side, List<Tile> allTiles) {

        int socket = t.getSocketBySide(side);
        List<Tile> compatibleTiles = new ArrayList<>();

        // if the socket is invalid
        if (socket == -2) {
            if (side != TileSide.BOTTOM) {
                compatibleTiles.add(TilesDB.getFloor()); // unless it's the bottom side, the floor is compatible with an invalid socket
            }
            return compatibleTiles; 
        }

        // if current side has a door, only air is compatible so the door isn't blocked
        if (t.getDoorSide() == side) {
            if (t.getBottomSocket() == 0) {
                compatibleTiles.add(TilesDB.getFloorAir());
            } else {
                compatibleTiles.add(TilesDB.getAir());
            }
            return compatibleTiles;
        }

        // iterate over all tiles
        for (int i = 0; i < allTiles.size(); ++i) {
            Tile otherT = allTiles.get(i);

            // check for socket correspondence for every tile except the tile with itself, and if we are currently testing on an air tile
            if (!(otherT.equals(t) && !(t.getId().equals("air")) && !(t.getId().equals("air_b")))) {

                // get corresponding tile side
                TileSide corresponding = getCorrespondingSide(side);
                int otherSocket = otherT.getSocketBySide(corresponding);

                // if the sockets are equal, add to list of compatible tiles
                if (socket == otherSocket) {
                    compatibleTiles.add(otherT);
                }
            }
        }

        return compatibleTiles;
    }

    /**
     * This function gets the corresponding side (the one it will be attached to) of a given side
     * 
     * @param side the side to get the corresponding one for
     * @return the corresponding side
     */
    private static TileSide getCorrespondingSide(TileSide side) {

        switch (side) {
            case FRONT:
                return TileSide.BACK;
            case BACK:
                return TileSide.FRONT;
            case LEFT:
                return TileSide.RIGHT;
            case RIGHT:
                return TileSide.LEFT;
            case TOP:
                return TileSide.BOTTOM;
            default:
                return TileSide.TOP;
        }
    }

}