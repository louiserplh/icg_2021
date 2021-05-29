
import java.util.*;
import java.io.File; // Import the File class
import java.io.IOException;
import java.io.FileWriter;


public class WaveCollapse {

    public static void launchWFC(int constraintIndex, String constraintName) {

        System.out.println(constraintName);
        generateJSON(wfc(constraintIndex, constraintName));
    }

    public static List<Tile> wfc(int constraintIndex, String constraintName) {

        TilesDB db = new TilesDB();

        // get tile correspondences
        List<TileCorrespondences> corres = PutTogetherTiles.createCorrespondences();

        List<Tile> worked = new ArrayList<>();

        // re-run waveform until we find one that is valid
        while (worked.isEmpty()) {
            WaveCollapse wf = new WaveCollapse(db.getTilesList(), corres, 5, 5, 3, TilesDB.getFloor());
            worked = wf.start(constraintIndex, constraintName);
        }

        return worked;
    }
    

    private List<TileCorrespondences> tileCorrespondences;
    private int totalCells;
    private int num_x;
    private int num_y;
    private int num_z;

    private Random rand;

    private Tile floor;

    private List<List<Tile>> possibleTilesPerCell;

    public WaveCollapse(List<Tile> allTiles, List<TileCorrespondences> tileCorrespondences, int num_x, int num_y, int num_z,
            Tile floor) {
        this.tileCorrespondences = new ArrayList<>(tileCorrespondences);
        this.num_x = num_x;
        this.num_y = num_y;
        this.num_z = num_z + 1; // add 1 to z dimension for floor tiles
        this.floor = floor;
        this.totalCells = num_x * num_y * (num_z + 1);
        rand = new Random();

        // in the beginning, all tiles are possible tiles for every cell
        possibleTilesPerCell = new ArrayList<>();
        for (int i = 0; i < totalCells; ++i) {
            possibleTilesPerCell.add(new ArrayList<>(allTiles));
        }
    }

    /**
     * function launches the wfc
     * 
     * @return generated array of tiles if it is valid, empty list otherwise
     */
    public List<Tile> start(int indexConstraint, String tileID) {

        for (int x = 0; x < num_x; ++x) {
            for (int y = 0; y < num_y; ++y) {

                // add floor tiles to the entire z = 0 plane
                int index = coordinateToIndex(x, y, 0);
                List<Tile> tiles = new ArrayList<>();
                tiles.add(floor);
                possibleTilesPerCell.set(index, tiles);

                // propagate at this index
                propagate(index);
            }
        }

        if(indexConstraint != -1) {

            int x = indexTocoordinate_x(indexConstraint);
            int y = indexTocoordinate_y(indexConstraint);
            int z = indexTocoordinate_z(indexConstraint) + 1;

            indexConstraint = coordinateToIndex(x, y, z);

            // add constraint tile and propagate
            List<Tile> tiles = new ArrayList<>();
            TilesDB db = new TilesDB();
            Tile t = getTileById(db.getTilesList(), tileID);
            if(t != null) {
                tiles.add(t);
                possibleTilesPerCell.set(indexConstraint, tiles);
                propagate(indexConstraint);
            }
            else {
                System.out.println("There was an error in the tile id.");
            }
        }

        // iterate until the array is fully collapsed
        while (!isCollapsed()) {
            iterate();
        }

        // return whether generated array is valid or not
        return checkValidity();
    }

     /**
     * function launches the wfc with constraints
     * 
     * @return generated array of tiles if it is valid, empty list otherwise
     */
    public List<Tile> startWithConstraints(int indexConstraint, Tile tile) {

        for (int x = 0; x < num_x; ++x) {
            for (int y = 0; y < num_y; ++y) {

                // add floor tiles to the entire z = 0 plane
                int index = coordinateToIndex(x, y, 0);
                List<Tile> tiles = new ArrayList<>();
                tiles.add(floor);
                possibleTilesPerCell.set(index, tiles);

                // propagate at this index
                propagate(index);
            }
        }

        


        // iterate until the array is fully collapsed
        while (!isCollapsed()) {
            iterate();
        }

        // return whether generated array is valid or not
        return checkValidity();
    }


    /**
     * function checks if generated array is valid
     * 
     * @return generated array of tiles if it is valid, empty list otherwise
     */
    private List<Tile> checkValidity() {

        List<Tile> finalList = new ArrayList<>();

        // iterate over all cells
        for (int i = 0; i < totalCells; ++i) {

            // if there is no possible tile for a certain tile, the array is not valid
            if (possibleTilesPerCell.get(i).isEmpty()) {
                return new ArrayList<>();
            }

            // extract the assigned tile for this cell and its correspondences
            Tile t = possibleTilesPerCell.get(i).get(0);
            TileCorrespondences c = getCorrespondences(t, tileCorrespondences);

            Map<TileSide, Integer> adjs = getAdjacentCellIndexes(i);

            // for all sides of the tile
            for (TileSide side : TileSide.values()) {

                if(side != TileSide.INVALID) {

                    // get the index of the cell adjacent to this tile
                    int index = adjs.get(side);

                    // if cell is in the grid
                    if (index != -1) {

                        if (possibleTilesPerCell.get(index).isEmpty()) {
                            return new ArrayList<>(); // return false if that adjacent cell has no possible tiles
                        }

                        // get the adjacent tile 
                        Tile t_other = possibleTilesPerCell.get(index).get(0);

                        if (!(c.getCompatibleTilesBySide(side).contains(t_other))) {
                            return new ArrayList<>(); // if the adjacent tile is not in this tile's correspondences, array is not valid
                        }

                    }
                }
            }

            finalList.add(t);
        }

        if(finalList.size() != 0) {
            for (int i = 0; i < finalList.size(); ++i) {
                System.out.println("x = " + indexTocoordinate_x(i) + " ; y = " + indexTocoordinate_y(i) + " ; z = "
                        + indexTocoordinate_z(i) + " ; tile : " + finalList.get(i).getId());
            }
        }

        return finalList;
    }

    /**
     * function iterate collapses the wfc grid at a certain index
     * and propagates the collaps
     */
    private void iterate() {
        int index = getMinimumEntropyIndex();
        collapse(index);
        propagate(index);
    }


    /**
     * function collapse sets the tile of a certain cell to a random tile
     * within its possible tiles
     * 
     * @param index index of the grid at which to collapse
     */
    private void collapse(int index) {
        List<Tile> possibleTiles = possibleTilesPerCell.get(index);
        int random = rand.nextInt(possibleTiles.size());

        List<Tile> l = new ArrayList<>();
        l.add(possibleTiles.get(random));
        possibleTilesPerCell.set(index, l);
    }


    /**
     * function getAdjacentCellIndexes gets the indexes of the adjacent cells to
     * a cell at a certain index
     * 
     * @param index the index of the cell to get adjacent cells of
     * @return a map mapping the side of the tile to the index of its adjacent cell
     */
    private Map<TileSide, Integer> getAdjacentCellIndexes(int index) {

        Map<TileSide, Integer> adjacents = new HashMap<>();

        // get x y z coordinates of the current index
        int x = indexTocoordinate_x(index);
        int y = indexTocoordinate_y(index);
        int z = indexTocoordinate_z(index);

        // for every side, check if its adjacent cell is within the grid ; 
        // get corresponding index if yes, -1 otherwise

        int lowerTile = (z > 0) ? coordinateToIndex(x, y, z - 1) : -1;
        int higherTile = (z < (num_z - 1)) ? coordinateToIndex(x, y, z + 1) : -1;

        int leftTile = (x > 0) ? coordinateToIndex(x - 1, y, z) : -1;
        int rightTile = (x < (num_x - 1)) ? coordinateToIndex(x + 1, y, z) : -1;

        int frontTile = (y > 0) ? coordinateToIndex(x, y - 1, z) : -1;
        int backTile = (y < (num_y - 1)) ? coordinateToIndex(x, y + 1, z) : -1;

        // add found indexes to the map
        adjacents.put(TileSide.FRONT, frontTile);
        adjacents.put(TileSide.BACK, backTile);
        adjacents.put(TileSide.RIGHT, rightTile);
        adjacents.put(TileSide.LEFT, leftTile);
        adjacents.put(TileSide.TOP, higherTile);
        adjacents.put(TileSide.BOTTOM, lowerTile);

        return adjacents;
    }


    /**
     * function propagate takes care of propagating the collapsing of a cell 
     * to all cells in the grid and updates their list of possible tiles
     * 
     * @param index the index at which the possible tile list was changed 
     * and from which the function needs to propagate
     */
    private void propagate(int index) {

        // stack represents the indexes of cells where a change of possible tiles happened
        Stack<Integer> stack = new Stack<Integer>();

        // for now it only has the current index
        stack.push(index);

        // while the stack is not empty
        while (stack.size() > 0) {

            // pop the stack ; that index represents the cell we will be working on next
            int current_index = stack.pop();

            // get the indexes of the cells adjacent to the current cell
            Map<TileSide, Integer> adjacents = getAdjacentCellIndexes(current_index);

            // iterate over all tile sides
            for (TileSide side : TileSide.values()) {

                if(side != TileSide.INVALID) {

                    // if the cell adjacent on current side is within the grid
                    if (adjacents.get(side) != -1) {

                        // get the list of possible tiles stored in the adjacent cell (doesn't take into consideration the change in possible tiles for this cell)
                        List<Tile> possibleTiles_adjacent = possibleTilesPerCell.get(adjacents.get(side));
                        List<Tile> possibleTiles_adjacent_copy = new ArrayList<>(
                                possibleTilesPerCell.get(adjacents.get(side)));

                        // get the list of possible neighbors of the current cell for the current side 
                        List<Tile> possibleNeighbors_this = getPossibleNeighbors(current_index, side);

                        // unless the adjacent cell is collapsed
                        if (possibleTiles_adjacent.size() > 1) {

                            // iterate over all possible tiles for the adjacent cell
                            for (int j = 0; j < possibleTiles_adjacent.size(); ++j) {
                                
                                Tile t = possibleTiles_adjacent.get(j);

                                // if the current tile is not in the list of possible neighbors for this cell
                                if (!tileListContains(t, possibleNeighbors_this)) {

                                    // iterate over at most all the tiles in the list of possible tiles of the adjacent cell
                                    int max = possibleTiles_adjacent_copy.size();
                                    int k = 0;
                                    while (k < max) {

                                        // remove the tile that doesn't match with the list of possible tile neighbors for this cell
                                        if (possibleTiles_adjacent_copy.get(k).equals(t)) {
                                            possibleTiles_adjacent_copy.remove(k);
                                            k = max;
                                        }
                                        k += 1;
                                    }

                                    // if the stack doesn't already contain the index of the current adjacent cell,
                                    // add it so the change in possible tiles can be propagated
                                    if (!stack.contains(adjacents.get(side))) {
                                        stack.add(adjacents.get(side));
                                    }
                                }
                            }
                            // set the list of possible tiles for the adjacent cell to the updated one
                            possibleTilesPerCell.set(adjacents.get(side), possibleTiles_adjacent_copy);
                        }
                    }
                }
            }
        }
    }
    

    /**
     * function getPossibleNeighbors returns all the tiles that could be neighbors
     * of a certain cell depending on the cell's current possible tiles
     * 
     * @param index the index of the cell to get
     * @param side the side for which to get the possible neighbors
     * @return a list of all the possible adjacent tiles
     */
    private List<Tile> getPossibleNeighbors(int index, TileSide side) {

        // get all the potential tiles that could be in this cell
        List<Tile> tilesInCell = possibleTilesPerCell.get(index);

        List<Tile> setOfPossibleTiles = new ArrayList<>();

        // iterate over all potential tiles for this cell
        for (int i = 0; i < tilesInCell.size(); ++i) {

            // get the current tile and its correspondences
            Tile t = tilesInCell.get(i);
            TileCorrespondences c = getCorrespondences(t, tileCorrespondences);

            // for all the possible neighbors of the current tile, add them to the overall set of possible tiles for this cell
            List<Tile> tiles = c.getCompatibleTilesBySide(side);
            for(int j = 0; j < tiles.size(); ++j) {
                if(!tileListContains(tiles.get(j), setOfPossibleTiles)) {
                    setOfPossibleTiles.add(tiles.get(j));
                }            
            }
        }

        return setOfPossibleTiles;
    }

    /**
     * function getCorrespondeces returns, from a list of TileCorrespondences, the one corresponding 
     * to a specific tile 
     * 
     * @param t the tile to get the correspondences for
     * @param correspondences the list of correspondences for all tiles
     * @return the TileCorrespondences object of the specific tile, null if it finds none
     */
    private TileCorrespondences getCorrespondences(Tile t, List<TileCorrespondences> correspondences) {

        for (int i = 0; i < correspondences.size(); ++i) {

            TileCorrespondences c = correspondences.get(i);
            if (c.getTile().equals(t)) {
                return c;
            }
        }

        return null;

    }

    /**
     * function tileListContains returns whether or not a particular tile is in a particular list
     * 
     * @param t the tile to test for
     * @param tiles the list of tiles to test for
     * @return true if the list contains the tile, false otherwise
     */
    private boolean tileListContains(Tile t, List<Tile> tiles) {

        for (int i = 0; i < tiles.size(); ++i) {

            if (tiles.get(i).equals(t)) {
                return true;
            }
        }
        return false;
    }

    /**
     * function getMinimumEntropyCoordinate returns the index of the non-collapsed cell
     * with the smallest amount of possible tiles
     * 
     * @return the index with the smallest entropy
     */
    private int getMinimumEntropyIndex() {

        // initialize minimum entropy to 1
        int min = 1;

        // keeps track of all the cells with the same amount of possible tiles
        List<Integer> sameEntropy = new ArrayList<>();

        // iterate over all cells
        for (int i = 0; i < totalCells; ++i) {

            // get the amount of possible tiles for the current cell
            int size = possibleTilesPerCell.get(i).size();

            if (size > 1) { // if the cell is not yet collapsed

                // if min is still at its initial value, set it to the current min and adds current index to same entropy list
                if (min == 1) {
                    min = size;
                    sameEntropy.add(i);
                } 
                
                else {
                    if (size < min) { // if we find a cell with less possible tiles, update min and re-initialize same entropy list
                        min = size;
                        sameEntropy.clear();
                        sameEntropy.add(i);
                    }
                    if (size == min) {
                        sameEntropy.add(i); // if we find a cell with the current minimum entropy, add it to same entropy list
                    }
                }
            }
        }

        // return a random cell index from the ones with lowest entropy
        int randomInt = rand.nextInt(sameEntropy.size());
        return sameEntropy.get(randomInt);
        
    }

    // helper function to get index version of (x, y, z) coordinate
    private int coordinateToIndex(int x, int y, int z) {
        return x + num_x * y + num_x * num_y * z;
    }

    // helper function to get the x coordinate of an index
    private int indexTocoordinate_x(int index) {
        return index % num_x;
    }

    // helper function to get the y coordinate of an index
    private int indexTocoordinate_y(int index) {
        index = index / num_x;
        return index % num_y;

    }

    // helper function to get the z coordinate of an index
    private int indexTocoordinate_z(int index) {
        index = index / num_x;
        index = index / num_y;
        return index % num_z;
    }

    /**
     * function isCollapsed checks if the wfc is fully collapsed
     * 
     * @return true if it is collapsed, false otherwise
     */
    private boolean isCollapsed() {

        // iterate over all cells
        for (int i = 0; i < totalCells; ++i) {

            // the wfc is collapsed if all cells have only 1 possible tile 
            if (possibleTilesPerCell.get(i).size() > 1) {
                return false; // returns false if that is not the case
            }
        }
        return true;
    }

    /**
     * function generateJSON creates JSON string from a given list of tiles
     * @param tiles the list to create the JSOn from
     */
    private static void generateJSON(List<Tile> tiles) {

        StringBuilder allTiles = new StringBuilder();
        allTiles.append("[");

        for(int i = 0; i < tiles.size(); ++i) {

            allTiles.append("{\"");
            allTiles.append(i);
            allTiles.append("\":\"");
            allTiles.append(tiles.get(i).getId());
            allTiles.append("\"}");

            if(i != tiles.size() - 1) {
                allTiles.append(",");
            }
        } 

        allTiles.append("]");
        
        final String dir = System.getProperty("user.dir");
        File f = new File(dir + "/tiles.json");

        try {
            FileWriter myWriter = new FileWriter("tiles.json");
            myWriter.write(allTiles.toString());
            myWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * function getTileById returns, from a list of tiles, the tile with the id given as argument
     * @param allTiles all tiles
     * @param tileId the id of the tile to get
     * @return Tile the tile in question
     */
    private static Tile getTileById(List<Tile> allTiles, String tileId) {

        for(Tile t : allTiles) {
            if(t.getId().equals(tileId)) {
                return t;
            }
        }
        return null;
    }

}
