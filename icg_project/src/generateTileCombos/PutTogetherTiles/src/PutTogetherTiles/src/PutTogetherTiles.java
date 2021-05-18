package PutTogetherTiles.src;

import java.io.File; // Import the File class
import java.io.IOException;
import java.io.FileWriter;
import java.util.*;
import java.util.ArrayList;

import org.json.simple.*;

public class PutTogetherTiles {

    public static void main(String[] args) {

        createTxtFile();

    }

    public static void createJson() {

        List<Tile> tiles = new TilesDB().getTilesList();
        JSONArray allTiles = new JSONArray();

        for (int i = 0; i < tiles.size(); ++i) {

            JSONObject tile = new JSONObject();
            JSONArray tileSides = new JSONArray();

            for (int j = 0; j < 6; ++j) {

                JSONObject tileSide = new JSONObject();
                JSONArray compatibleTiles = new JSONArray();

                Map<Tile, Integer> compatibleTilesMap = findCompatibleTiles(tiles.get(i), j, tiles);

                for (Tile t : compatibleTilesMap.keySet()) {
                    JSONObject compatibleTile = new JSONObject();
                    compatibleTile.put(t.getId(), t.getSocketNameByIndex(compatibleTilesMap.get(t)));
                    compatibleTiles.add(compatibleTile);
                }

                tileSide.put(tiles.get(i).getSocketNameByIndex(j), compatibleTiles);
                tileSides.add(tileSide);
            }

            tile.put(tiles.get(i).getId(), tileSides);
            allTiles.add(tile);
        }

        final String dir = System.getProperty("user.dir");
        File f = new File(dir + "/tiles.json");

        try {
            FileWriter myWriter = new FileWriter("tiles.json");
            myWriter.write(allTiles.toJSONString());
            myWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void createTxtFile() {

        List<Tile> tiles = new TilesDB().getTilesList();

        try {

            final String dir = System.getProperty("user.dir");
            File f = new File(dir + "/tiles.txt");

            FileWriter myWriter = new FileWriter("tiles.txt");

            for (int i = 0; i < tiles.size(); ++i) {
                myWriter.write(tiles.get(i).getId() + " : \n");
                for (int j = 0; j < 6; ++j) {
                    Map<Tile, Integer> compatibleTiles = findCompatibleTiles(tiles.get(i), j, tiles);
                    myWriter.write("  - " + tiles.get(i).getSocketNameByIndex(j) + " : \n");
                    for (Tile t : compatibleTiles.keySet()) {
                        myWriter.write(
                                "    • " + t.getId() + " (" + t.getSocketNameByIndex(compatibleTiles.get(t)) + ") \n");
                    }
                    myWriter.write("\n");
                }
                myWriter.write("\n \n");
            }

            myWriter.close();

        } catch (Exception e) {
            System.out.println("An error occurred.");
            e.printStackTrace();
        }

    }

    public static List<TileCorrespondences> createCorrespondences() {

        List<Tile> tiles = new TilesDB().getTilesList();
        List<TileCorrespondences> correses = new ArrayList<>();

        for (int i = 0; i < tiles.size(); ++i) {

            TileCorrespondences c = new TileCorrespondences(tiles.get(i));

            for (int j = 0; j < 6; ++j) {
                Map<Tile, Integer> compatibleTiles = findCompatibleTiles(tiles.get(i), j, tiles);
                switch (j) {
                    case 0:
                        c.setFrontTiles(new ArrayList<>(compatibleTiles.keySet()));
                        break;
                    case 1:
                        c.setBackTiles(new ArrayList<>(compatibleTiles.keySet()));
                        break;
                    case 2:
                        c.setLeftTiles(new ArrayList<>(compatibleTiles.keySet()));
                        break;
                    case 3:
                        c.setRightTiles(new ArrayList<>(compatibleTiles.keySet()));
                        break;
                    case 4:
                        c.setTopTiles(new ArrayList<>(compatibleTiles.keySet()));
                        break;
                    default:
                        c.setBottomTiles(new ArrayList<>(compatibleTiles.keySet()));

                }
            }
            correses.add(c);
        }

        return correses;

    }

    public static Map<Tile, Integer> findCompatibleTiles(Tile t, int index, List<Tile> allTiles) {

        int socket = t.getSocketByIndex(index);
        Map<Tile, Integer> compatibleTiles = new HashMap<>();

        if (socket == -2) {
            if (index != 5) {
                compatibleTiles.put(TilesDB.getFloor(), index);
            }
            return compatibleTiles;
        }

        if (index == 0 && !t.getId().equals("floor") && !t.getId().equals("air") && !t.getId().equals("air_b")) {
            if (t.getBottomSocket() == TilesDB.getFloor().getTopSocket()) {
                compatibleTiles.put(TilesDB.getFloorAir(), 6);
            } else {
                compatibleTiles.put(TilesDB.getAir(), 6);
            }

            return compatibleTiles;
        }

        if (t.getDoorSocket() == index) {
            if (t.getBottomSocket() == 0) {
                compatibleTiles.put(TilesDB.getFloorAir(), 6);
            } else {
                compatibleTiles.put(TilesDB.getAir(), 6);
            }
            return compatibleTiles;
        }

        for (int i = 0; i < allTiles.size(); ++i) {
            Tile otherT = allTiles.get(i);
            if (!(otherT.equals(t) && !(t.getId().equals("air")) && !(t.getId().equals("air_b")))) {
                int corresponding = getCorrespondingSide(index);
                int otherSocket = otherT.getSocketByIndex(corresponding);
                if (socket == otherSocket) {
                    compatibleTiles.put(otherT, corresponding);
                }
            }
        }

        return compatibleTiles;
    }

    private static int getCorrespondingSide(int index) {

        switch (index) {
            case 0:
                return 1;
            case 1:
                return 0;
            case 2:
                return 3;
            case 3:
                return 2;
            case 4:
                return 5;
            default:
                return 4;
        }
    }

}