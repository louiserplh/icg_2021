package PutTogetherTiles.src;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Stack;

public class WaveForm {

    public static void main(String[] args) {

        
        TilesDB db = new TilesDB();
        List<TileCorrespondences> corres = PutTogetherTiles.createCorrespondences();

        boolean worked = false;
        while(!worked) {
            WaveForm wf = new WaveForm(db.getTilesList(), corres, 4, 4, 2, TilesDB.getFloor());
            worked = wf.start();
        }

    }

    private List<TileCorrespondences> tileCorrespondences;
    private int totalCells;
    private int num_x;
    private int num_y;
    private int num_z;

    private Random rand;

    private Tile floor;

    private List<List<Tile>> possibleTilesPerCell;

    public WaveForm(List<Tile> allTiles, List<TileCorrespondences> tileCorrespondences, int num_x, int num_y, int num_z, Tile floor) {
        this.tileCorrespondences = new ArrayList<>(tileCorrespondences);
        this.num_x = num_x;
        this.num_y = num_y;
        this.num_z = num_z + 1;
        this.floor = floor;
        this.totalCells = num_x*num_y*(num_z+1);
        rand = new Random();

        possibleTilesPerCell = new ArrayList<>();
        for(int i = 0; i < totalCells; ++i) {
            possibleTilesPerCell.add(new ArrayList<>(allTiles));
        }

    }
    
    public boolean start() {

        for(int x = 0; x < num_x; ++x) {
            for(int y = 0; y < num_y; ++y) {
                int index = coordinateToIndex(x, y, 0);
                List<Tile> tiles = new ArrayList<>();
                tiles.add(floor);
                possibleTilesPerCell.set(index, tiles);

                propagate(index);
            }
        }

        while (!isCollapsed()) {
            iterate();
        }

        if(checkValidity()) {
            for(int i = 0; i < possibleTilesPerCell.size(); ++i) {
                System.out.println("x = " + indexTocoordinate_x(i) + " ; y = " + indexTocoordinate_y(i) + " ; z = " + indexTocoordinate_z(i) + " ; tile : " + possibleTilesPerCell.get(i).get(0).getId());
            } 
            return true;
        }
        else {
            //System.out.println("invalid");
            return false;
        }
    }

    private boolean checkValidity() {

        for(int i = 0; i < totalCells; ++i) {

            if(possibleTilesPerCell.get(i).isEmpty()) {
                return false;
            }

            Tile t = possibleTilesPerCell.get(i).get(0);

            List<Integer> adjs = getAdjacentTileIndexes(i);

            for(int j = 0; j < adjs.size(); ++j) {
                int index = adjs.get(j);
                if(index != -1) {

                    if(possibleTilesPerCell.get(index).isEmpty()) {
                        return false;
                    }

                    Tile t_other = possibleTilesPerCell.get(index).get(0);
                    TileCorrespondences c = getCorrespondences(t, tileCorrespondences);
                    
                    if(!(c.getSideByIndex(j).contains(t_other))) {
                        return false;
                    }

                }
            }
        }

        return true;
    }

    private void iterate() {
        int index = getMinimumEntropyCoordinate();
        collapse(index);
        propagate(index);
    }

    private void collapse(int index) {
        List<Tile> possibleTiles = possibleTilesPerCell.get(index);
        int random = rand.nextInt(possibleTiles.size());

        List<Tile> l = new ArrayList<>();
        l.add(possibleTiles.get(random));
        possibleTilesPerCell.set(index, l);

    }

    private List<Integer> getAdjacentTileIndexes(int index) {

        List<Integer> adjacents = new ArrayList<>();

        int x = indexTocoordinate_x(index);
        int y = indexTocoordinate_y(index);
        int z = indexTocoordinate_z(index);
        
        int lowerTile = (z > 0) ? coordinateToIndex(x, y, z - 1) : -1; 
        int higherTile = (z < (num_z - 1)) ? coordinateToIndex(x, y, z + 1) : -1;

        int leftTile = (x > 0) ? coordinateToIndex(x - 1, y, z) : -1;
        int rightTile = (x < (num_x - 1)) ? coordinateToIndex(x + 1, y, z) : -1;

        int frontTile = (y > 0) ? coordinateToIndex(x, y - 1, z) : -1;
        int backTile = (y < (num_y - 1)) ? coordinateToIndex(x, y + 1, z) : -1;

        adjacents.add(frontTile);
        adjacents.add(backTile);
        adjacents.add(rightTile);
        adjacents.add(leftTile);
        adjacents.add(higherTile);
        adjacents.add(lowerTile);

        return adjacents;
    }

    private void propagate(int index) {

        Stack<Integer> stack = new Stack<Integer>();

        stack.push(index);

        while(stack.size() > 0) {
            int current_index = stack.pop();
            List<Integer> adjacents = getAdjacentTileIndexes(current_index);

            for(int i = 0; i < adjacents.size(); ++i) {
                if(adjacents.get(i) != -1) {
                    List<Tile> possibleNeighbors_adjacent = possibleTilesPerCell.get(adjacents.get(i));
                    List<Tile> possibleNeighbors_adjacent_copy = new ArrayList<>(possibleTilesPerCell.get(adjacents.get(i)));

                    List<Tile> possibleNeighbors_this = getPossibleNeighbors(current_index, i);

                    if(!(possibleNeighbors_adjacent.size() <= 1)) {
                        for(int j = 0; j < possibleNeighbors_adjacent.size(); ++j) {
                            if(!tileListContains(possibleNeighbors_adjacent.get(j), possibleNeighbors_this)) {

                                Tile t = possibleNeighbors_adjacent.get(j);
                                int max = possibleNeighbors_adjacent_copy.size();
                                int k = 0;
                                while (k < max) {

                                    if(possibleNeighbors_adjacent_copy.get(k).equals(t)) {
                                        possibleNeighbors_adjacent_copy.remove(k);
                                        k = max;
                                    }
                                    k += 1;
                                }

                                if(!stack.contains(adjacents.get(i))) {
                                    stack.add(adjacents.get(i));
                                }
                            }
                        }
                        possibleTilesPerCell.set(adjacents.get(i), possibleNeighbors_adjacent_copy);
                    }
                }
            }
        }
    }


    private List<Tile> getPossibleNeighbors(int index, int side) {
        List<Tile> tilesInCell = possibleTilesPerCell.get(index);
        List<Tile> l = new ArrayList<>();

        for(int i = 0; i < tilesInCell.size(); ++i) {

            Tile t = tilesInCell.get(i);
            TileCorrespondences c = getCorrespondences(t, tileCorrespondences);

            List<Tile> tiles = c.getSideByIndex(side);
            for(int j = 0; j < tiles.size(); ++j) {
                if(!(l.contains(tiles.get(j)))) {
                    l.add(tiles.get(j));
                }
            }

        }

        return l;
    }

    private TileCorrespondences getCorrespondences(Tile t, List<TileCorrespondences> correspondences) {

        for(int i = 0; i < correspondences.size(); ++i) {
            TileCorrespondences c = correspondences.get(i);
            if(c.getTile().equals(t)) {
                return c;
            }
        } 

        return null;

    }

    private boolean tileListContains(Tile t, List<Tile> tiles) {
        for(int i = 0; i < tiles.size(); ++i) {
            if(tiles.get(i).equals(t)) {
                return true;
            }
        }
        return false;
    }

    private int getMinimumEntropyCoordinate() {

        int min = 1;

        List<Integer> sameEntropy = new ArrayList<>(); 

        for(int i = 0; i < totalCells; ++i) {
            int size = possibleTilesPerCell.get(i).size();
            if(size > 1) {
                if(min == 1) {
                    min = size;
                    sameEntropy.add(i);
                }
                else {
                    if(size < min) {
                        min = size;
                        sameEntropy.clear();
                        sameEntropy.add(i);
                    }
                    if(size == min) {
                        sameEntropy.add(i);
                    }
                }
            }
        }

        if(sameEntropy.size() == 1) {
            return sameEntropy.get(0);
        }
        else {
            int randomInt = rand.nextInt(sameEntropy.size());
            return sameEntropy.get(randomInt);
        }
    }

    private int coordinateToIndex(int x, int y, int z) {
        return x + num_x * y + num_x * num_y * z;
    }

    private int indexTocoordinate_x(int index) {
        return index % num_x;
    }

    private int indexTocoordinate_y(int index) {
        index = index/num_x;
        return index % num_y;

    }

    private int indexTocoordinate_z(int index) {
        index = index/num_x;
        index = index/num_y;
        return index % num_z;
    }

    private boolean isCollapsed() {
        for(int i = 0; i < totalCells; ++i) {
            if(possibleTilesPerCell.get(i).size() > 1) {
                return false;
            }
        }
        return true;
    }


    
}
