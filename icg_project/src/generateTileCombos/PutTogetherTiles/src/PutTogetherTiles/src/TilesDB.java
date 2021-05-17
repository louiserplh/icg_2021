package PutTogetherTiles.src;
import java.util.List;
import java.util.ArrayList;


public class TilesDB {

    private List<Tile> tiles;

    private static Tile t40 = new Tile("floor", -2, -2, -2, -2, 0, -2, -1);
    private static Tile t0 = new Tile("air", -1, -1, -1, -1, -1, -1, -1);
    private static Tile t0_b = new Tile("air_b", -3, -3, -3, -3, -1, 0, -1);

    public TilesDB() {

        // NONE = -2
        // FLOOR = 0
        // AIR = -1
        // AIR + FLOOR = -3

        // RED ROOF/FLOOR ALONE = 1
        // RED ROOF/FLOOR LEFT = 6
        // RED ROOF/FLOOR RIGHT = 7
        // RED ROOF/FLOOR MIDDLE = 8

        // ROOF SIDE WITH FLOOR = 2
        // ROOF SIDE WITHOUT FLOOR = 3

        // NO ROOF SIDE WITH FLOOR = 4
        // NO ROOF SIDE WITHOUT FLOOR = 5

        // NO ROOF BALCONY = 9


        // ORDER : FRONT BACK LEFT RIGHT TOP BOTTOM
        //         0    1     2    3

        // turning to the right (=> 90 = 90 to the right)

        tiles = new ArrayList<>();
        tiles.add(t0);
        tiles.add(t0_b);
        tiles.add(t40);

        
        Tile t1 = new Tile("tile_1_alone", -3, -3, -3, -3, -1, 0, 0);
        Tile t2 = new Tile("tile_1_alone_nb", -1, -1, -1, -1, -1, 1, 0);
        Tile t3 = new Tile("tile_1_alone_nr", -3, -3, -3, -3, 1, 0, 0);
        Tile t13 = new Tile("tile_1_right", -3, -3, -3, 2, -1, 0, 0);
        Tile t13_90 = new Tile("tile_1_right_90", 2, -3, -3, -3, -1, 0, 2);
        Tile t13_180 = new Tile("tile_1_right_180", -3, -3, 2, -3, -1, 0, 1);
        Tile t13_270 = new Tile("tile_1_right_270", -3, 2, -3, -3, -1, 0, 3);

        Tile t4 = new Tile("tile_1_left", -3, -3, 2, -3, -1, 0, 0);
        Tile t4_90 = new Tile("tile_1_left_90", -3, 2, -3, -3, -1, 0, 2);
        Tile t4_180 = new Tile("tile_1_left_180", -3, -3, -3, 2, -1, 0, 1);
        Tile t4_270 = new Tile("tile_1_left_270", 2, -3, -3, -3, -1, 0, 3);

        Tile t5 = new Tile("tile_1_left_corner", -3, 2, 2, -3, -1, 0, 0);
        Tile t5_90 = new Tile("tile_1_left_corner_90", -3, 2, -3, 2, -1, 0, 2);
        Tile t5_180 = new Tile("tile_1_left_corner_180", 2, -3, 2, -3, -1, 0, 1);
        Tile t5_270 = new Tile("tile_1_left_corner_270", 2, -3, 2, -3, -1, 0, 3);

        tiles.add(t1);
        tiles.add(t2);
        tiles.add(t3);

        tiles.add(t4);
        tiles.add(t4_90);
        tiles.add(t4_180);
        tiles.add(t4_270);
        tiles.add(t13);
        tiles.add(t13_90);
        tiles.add(t13_180);
        tiles.add(t13_270);

        tiles.add(t5);
        tiles.add(t5_90);
        tiles.add(t5_180);
        tiles.add(t5_270);
    
        

        /** 
        Tile t5 = new Tile("tile_1_left_corner", -3, 2, 2, -3, -1, 0);
        Tile t6 = new Tile("tile_1_left_nb", -1, -1, 3, -1, -1, 6);
        Tile t7 = new Tile("tile_1_left_nb_corner", -1, 3, 3, -1, -1, 6);

        Tile t8 = new Tile("tile_1_left_nr", -3, -3, 4, -3, 6, 0);
        Tile t9 = new Tile("tile_1_left_nr_corner", -3, 4, 4, -3, 6, 0);

        Tile t10 = new Tile("tile_1_middle", -3, -3, 2, 2, -3, 0);
        Tile t11 = new Tile("tile_1_middle_nb", -1, -1, 2, 2, -1, 8);
        Tile t12 = new Tile("tile_1_middle_nr", -3, -3, 4, 4, 8, 0);

        Tile t13 = new Tile("tile_1_right", -3, -3, -3, 2, -3, 0);
        Tile t14 = new Tile("tile_1_right_corner", -3, 2, -3, 2, -3, 0);
        Tile t15 = new Tile("tile_1_right_nb", -1, -1, -1, 3, -1, 7);
        Tile t16 = new Tile("tile_1_right_nb_corner", -1, 3, -1, 3, -1, 7);

        Tile t17 = new Tile("tile_1_right_nr", -3, -3, -3, 4, 7, 0);
        Tile t18 = new Tile("tile_1_right_nr_corner", -3, 4, -3, 4, 7, 0);

        
        Tile t19 = new Tile("tile_2_alone_nr", -1, -1, -1, -1, 1, 1);

        Tile t20 = new Tile("tile_2_left_nr", -1, -1, 5, -1, 6, 6);
        Tile t21 = new Tile("tile_2_left_nr_corner", -1, 5, 5, -1, 6, 6);

        Tile t22 = new Tile("tile_2_middle_nr", -1, -1, 5, 5, 8, 8);
        Tile t23 = new Tile("tile_2_right_nr", -1, -1, -1, 5, 7, 7);
        Tile t24 = new Tile("tile_2_right_nr_corner", -1, 5, -1, 5, 7, 7);

        Tile t25 = new Tile("tile_3_left", -1, -1, 5, -1, 6, 6);
        Tile t26 = new Tile("tile_3_left_fancy", -1, -1, 3, -1, 6, 6);
        Tile t27 = new Tile("tile_3_left_nr", -1, -1, 5, -1, 9, 6);

        Tile t28 = new Tile("tile_3_middle", -1, -1, 5, 5, 8, 8);
        Tile t29 = new Tile("tile_3_middle_fancy", -1, -1, 3, 3, 8, 8);
        Tile t30 = new Tile("tile_3_middle_nr", -1, -1, 5, 5, 9, 8);

        Tile t31 = new Tile("tile_3_right", -1, -1, -1, 5, 7, 7);
        Tile t32 = new Tile("tile_3_right_fancy", -1, -1, -1, 3, -1, 7);
        Tile t33 = new Tile("tile_3_right_nr", -1, -1, -1, 5, 9, 7);

        Tile t34 = new Tile("tile_4_left", -1, -1, 3, -1, -1, 9);
        Tile t35 = new Tile("tile_4_left_nr", -1, -1, 5, -1, 9, 9);

        Tile t36 = new Tile("tile_4_middle", -1, -1, 3, 3, -1, 9);
        Tile t37 = new Tile("tile_4_middle_nr", -1, -1, 5, 5, 9, 9);

        Tile t38 = new Tile("tile_4_right", -1, -1, -1, 3, -1, 9);
        Tile t39 = new Tile("tile_4_right_nr", -1, -1, -1, 5, 9, 9);
        
        tiles.add(t1);
        tiles.add(t2);
        tiles.add(t3);
        tiles.add(t4);
        tiles.add(t5);
        tiles.add(t6);
        tiles.add(t7);
        tiles.add(t8);
        tiles.add(t9);
        tiles.add(t10);
        tiles.add(t11);
        tiles.add(t12);
        tiles.add(t13);
        tiles.add(t14);
        tiles.add(t15);
        tiles.add(t16);
        tiles.add(t17);
        tiles.add(t18);
        tiles.add(t19);
        tiles.add(t20);
        tiles.add(t21);
        tiles.add(t22);
        tiles.add(t23);
        tiles.add(t24);
        tiles.add(t25);
        tiles.add(t26);
        tiles.add(t27);
        tiles.add(t28);
        tiles.add(t29);
        tiles.add(t30);
        tiles.add(t31);
        tiles.add(t32);
        tiles.add(t33);
        tiles.add(t34);
        tiles.add(t35);
        tiles.add(t36);
        tiles.add(t37);
        tiles.add(t38);
        tiles.add(t39);
        */
        
    }

    public List<Tile> getTilesList() {
        return tiles;
    }

    public static Tile getFloor() {
        return t40;
    }

    public static Tile getAir() {
        return t0;
    }

    public static Tile getFloorAir() {
        return t0_b;
    }
    
}
