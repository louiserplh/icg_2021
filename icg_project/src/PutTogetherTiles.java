import java.io.File;  // Import the File class
import java.io.IOException;
import java.io.FileWriter;
import java.util.*;
import java.util.ArrayList;

public class PutTogetherTiles {

    public static void main(String[] args) {

        List<Tile> tiles = new TilesDB().getTilesList();
        try {
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
        if(index == 0) {
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