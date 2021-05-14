package PutTogetherTiles.src;

import java.io.File;  // Import the File class
import java.io.IOException;
import java.nio.file.Paths;
import java.io.FileWriter;
import java.util.*;
import java.util.ArrayList;
import org.json.simple.*;

public class PutTogetherTiles {

    public static void main(String[] args) {

        createJson();
    
    }


    public static void createJson() {

        List<Tile> tiles = new TilesDB().getTilesList();
        JSONArray allTiles = new JSONArray();

        for(int i = 0; i < tiles.size(); ++i) {

            JSONObject tile = new JSONObject();
            JSONArray tileSides = new JSONArray();

            for(int j = 0; j < 6; ++j) {
            
                JSONObject tileSide = new JSONObject();
                JSONArray compatibleTiles = new JSONArray();

                Map<Tile, Integer> compatibleTilesMap = findCompatibleTiles(tiles.get(i), j, tiles);

                for(Tile t : compatibleTilesMap.keySet()) {
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

            for(int i = 0; i < tiles.size(); ++i) {
                myWriter.write(tiles.get(i).getId() + " : \n");
                for(int j = 0; j < 6; ++j) {
                    Map<Tile, Integer> compatibleTiles = findCompatibleTiles(tiles.get(i), j, tiles);
                    myWriter.write("  - " + tiles.get(i).getSocketNameByIndex(j) + " : \n");
                    for(Tile t : compatibleTiles.keySet()) {
                        myWriter.write("    • " + t.getId() + " (" + t.getSocketNameByIndex(compatibleTiles.get(t)) + ") \n");
                    }
                    myWriter.write("\n");
                }
                myWriter.write("\n \n");
            }

            myWriter.close();

        } catch(Exception e) {
            System.out.println("An error occurred.");
            e.printStackTrace();
        }

    }

    

    public static Map<Tile, Integer> findCompatibleTiles(Tile t, int index, List<Tile> allTiles) {
        
        int socket = t.getSocketByIndex(index);
        Map<Tile, Integer> compatibleTiles = new HashMap();

        if(socket == -2) {
            return compatibleTiles;
        }

        if(index == 0 && !t.getId().equals("floor")) {
            compatibleTiles.put(allTiles.get(0), 6);
            return compatibleTiles;
        }

        for(int i = 0; i < allTiles.size(); ++i) {
            Tile otherT = allTiles.get(i);
            if(!otherT.equals(t)) {
                for(int j = 0; j < 6; ++j) {
                    int otherSocket = otherT.getSocketByIndex(j);
                    if(socket == otherSocket) {
                        switch(index) {
                            case 1:
                                if(!(j == 0 || j == 4 || j == 5 || j == index)) {
                                    compatibleTiles.put(otherT, j);
                                }
                                break;
                            case 2:
                                if(!(j == 0 || j == 4 || j == 5 || j == index)) {
                                    compatibleTiles.put(otherT, j);
                                }
                                break;
                            case 3:
                                if(!(j == 0 || j == 4 || j == 5 || j == index)) {
                                    compatibleTiles.put(otherT, j);
                                }
                                break;
                            case 4:
                                if(!(j == 0 || j == 1 || j == 2 || j == 3 || j == index)) {
                                    compatibleTiles.put(otherT, j);
                                }
                                break;
                            default:
                                if(!(j == 0 || j == 1 || j == 2 || j == 3 || j == index)) {
                                    compatibleTiles.put(otherT, j);
                                }
                                break;
                        }
                    }
                }
            }
        }

        return compatibleTiles;
    } 
}