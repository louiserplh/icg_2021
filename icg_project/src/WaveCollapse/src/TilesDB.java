import java.util.List;
import java.util.ArrayList;

public class TilesDB {

    private List<Tile> tiles;

    private static Tile t40 = new Tile("floor", -2, -2, -2, -2, 0, -2, TileSide.INVALID);
    private static Tile t0 = new Tile("air", -1, -1, -1, -1, -1, -1, TileSide.INVALID);
    private static Tile t0_b = new Tile("air_b", -3, -3, -3, -3, -1, 0, TileSide.INVALID);

    public TilesDB() {

        /** 

        NONE = -2
        FLOOR = 0
        AIR = -1
        AIR + FLOOR = -3

        RED ROOF/FLOOR ALONE = 1

        RED ROOF/FLOOR LEFT = 6
        RED ROOF/FLOOR LEFT 90 = 10

        RED ROOF/FLOOR LEFT CORNER = 13
        RED ROOF/FLOOR LEFT CORNER 90 = 14

        RED ROOF/FLOOR RIGHT = 7
        RED ROOF/FLOOR RIGHT 90 = 11

        RED ROOF/FLOOR RIGHT CORNER = 15
        RED ROOF/FLOOR RIGHT CORNER 90 = 16

        RED ROOF/FLOOR MIDDLE = 8
        RED ROOF/FLOOR MIDDLE 90 = 12

        ROOF SIDE WITH FLOOR = 2
        ROOF SIDE WITHOUT FLOOR = 3

        NO ROOF SIDE WITH FLOOR = 4
        NO ROOF SIDE WITHOUT FLOOR = 5

        NO ROOF BALCONY = 9


        ORDER : FRONT BACK LEFT RIGHT TOP BOTTOM
                0     1    2    3     4   5

        turning to the left (=> 90 = 90 to the left)

        */

        tiles = new ArrayList<>();
        tiles.add(t0);
        tiles.add(t0_b);
        tiles.add(t40);

        Tile t1 = new Tile("tile_1_alone", -3, -3, -3, -3, -1, 0, TileSide.FRONT);
        Tile t2 = new Tile("tile_1_alone_nb", -1, -1, -1, -1, -1, 1, TileSide.INVALID);
        Tile t3 = new Tile("tile_1_alone_nr", -3, -3, -3, -3, 1, 0, TileSide.FRONT);

        Tile t4 = new Tile("tile_1_left", -3, -3, 2, -3, -1, 0, TileSide.FRONT);
        Tile t4_90 = new Tile("tile_1_left_90", -3, 2, -3, -3, -1, 0, TileSide.LEFT);

        Tile t5 = new Tile("tile_1_left_corner", -3, 2, 2, -3, -1, 0, TileSide.FRONT);
        Tile t5_90 = new Tile("tile_1_left_corner_90", -3, 2, -3, 2, -1, 0, TileSide.LEFT);

        Tile t6 = new Tile("tile_1_left_nb", -1, -1, 3, -1, -1, 6, TileSide.INVALID);
        Tile t6_90 = new Tile("tile_1_left_nb_90", -1, 3, -1, -1, -1, 10, TileSide.INVALID);

        Tile t7 = new Tile("tile_1_left_nb_corner", -1, 3, 3, -1, -1, 13, TileSide.INVALID);
        Tile t7_90 = new Tile("tile_1_left_nb_corner_90", -1, 3, -1, 3, -1, 14, TileSide.INVALID);

        Tile t8 = new Tile("tile_1_left_nr", -3, -3, 4, -3, 6, 0, TileSide.FRONT);
        Tile t8_90 = new Tile("tile_1_left_nr_90", -3, 4, -3, -3, 10, 0, TileSide.LEFT);

        Tile t9 = new Tile("tile_1_left_nr_corner", -3, 4, 4, -3, 13, 0, TileSide.FRONT);
        Tile t9_90 = new Tile("tile_1_left_nr_corner_90", -3, 4, -3, 4, 14, 0, TileSide.LEFT);

        Tile t10 = new Tile("tile_1_middle", -3, -3, 2, 2, -1, 0, TileSide.FRONT);
        Tile t10_90 = new Tile("tile_1_middle_90", 2, 2, -3, -3, -1, 0, TileSide.INVALID);

        Tile t11 = new Tile("tile_1_middle_nb", -1, -1, 2, 2, -1, 8, TileSide.INVALID);
        Tile t11_90 = new Tile("tile_1_middle_nb_90", 2, 2, -1, -1, -1, 12, TileSide.INVALID);

        Tile t12 = new Tile("tile_1_middle_nr", -3, -3, 4, 4, 8, 0, TileSide.INVALID);
        Tile t12_90 = new Tile("tile_1_middle_nr_90", 4, 4, -3, -3, 12, 0, TileSide.INVALID);

        Tile t13 = new Tile("tile_1_right", -3, -3, -3, 2, -1, 0, TileSide.FRONT);
        Tile t13_90 = new Tile("tile_1_right_90", 2, -3, -3, -3, -1, 0, TileSide.LEFT);

        Tile t14 = new Tile("tile_1_right_corner", -3, 2, -3, 2, -1, 0, TileSide.FRONT);
        Tile t14_90 = new Tile("tile_1_right_corner_90", 2, -3, -3, 2, -1, 0, TileSide.LEFT);

        Tile t15 = new Tile("tile_1_right_nb", -1, -1, -1, 3, -1, 7, TileSide.INVALID);
        Tile t15_90 = new Tile("tile_1_right_nb_90", 3, -1, -1, -1, -1, 11, TileSide.INVALID);

        Tile t16 = new Tile("tile_1_right_nb_corner", -1, 3, -1, 3, -1, 15, TileSide.INVALID);
        Tile t16_90 = new Tile("tile_1_right_nb_corner_90", -1, 3, -1, 3, -1, 16, TileSide.INVALID);

        Tile t17 = new Tile("tile_1_right_nr", -3, -3, -3, 4, 7, 0, TileSide.FRONT);
        Tile t17_90 = new Tile("tile_1_right_nr_90", 4, -3, -3, -3, 11, 0, TileSide.LEFT);

        Tile t18 = new Tile("tile_1_right_nr_corner", -3, 4, -3, 4, 15, 0, TileSide.FRONT);
        Tile t18_90 = new Tile("tile_1_right_nr_corner_90", 4, -3, 4, -3, 16, 0, TileSide.LEFT);

        Tile t19 = new Tile("tile_2_alone_nr", -1, -1, -1, -1, 1, 1, TileSide.INVALID);

        Tile t20 = new Tile("tile_2_left_nr", -1, -1, 5, -1, 6, 6, TileSide.INVALID);
        Tile t20_90 = new Tile("tile_2_left_nr_90", -1, 5, -1, -1, 10, 10, TileSide.INVALID);

        Tile t21 = new Tile("tile_2_left_nr_corner", -1, 5, 5, -1, 6, 6, TileSide.INVALID);
        Tile t21_90 = new Tile("tile_2_left_nr_corner_90", -1, 5, -1, 5, 10, 10, TileSide.INVALID);

        Tile t22 = new Tile("tile_2_middle_nr", -1, -1, 5, 5, 8, 8, TileSide.INVALID);
        Tile t22_90 = new Tile("tile_2_middle_nr_90", 5, 5, -1, -1, 12, 12, TileSide.INVALID);

        Tile t23 = new Tile("tile_2_right_nr", -1, -1, -1, 5, 7, 7, TileSide.INVALID);
        Tile t23_90 = new Tile("tile_2_right_nr_90", 5, -1, -1, -1, 11, 11, TileSide.INVALID);

        Tile t24 = new Tile("tile_2_right_nr_corner", -1, 5, -1, 5, 7, 7, TileSide.INVALID);
        Tile t24_90 = new Tile("tile_2_right_nr_corner_90", 5, -1, -1, 5, 11, 11, TileSide.INVALID);

        Tile t25 = new Tile("tile_3_left", -1, -1, 5, -1, 6, 6, TileSide.INVALID);
        Tile t25_90 = new Tile("tile_3_left_90", -1, 5, -1, -1, 10, 10, TileSide.INVALID);

        Tile t26 = new Tile("tile_3_left_fancy", -1, -1, 3, -1, -1, 6, TileSide.INVALID);
        Tile t26_90 = new Tile("tile_3_left_fancy_90", -1, 3, -1, -1, -1, 10, TileSide.INVALID);

        Tile t27 = new Tile("tile_3_left_nr", -1, -1, 5, -1, -1, 6, TileSide.INVALID);
        Tile t27_90 = new Tile("tile_3_left_nr_90", -1, 5, -1, -1, -1, 10, TileSide.INVALID);

        Tile t28 = new Tile("tile_3_middle", -1, -1, 5, 5, 8, 8, TileSide.INVALID);
        Tile t28_90 = new Tile("tile_3_middle_90", 5, 5, -1, -1, 12, 12, TileSide.INVALID);

        Tile t29 = new Tile("tile_3_middle_fancy", -1, -1, 3, 3, 8, 8, TileSide.INVALID);
        Tile t29_90 = new Tile("tile_3_middle_fancy_90", 3, 3, -1, -1, 12, 12, TileSide.INVALID);

        Tile t30 = new Tile("tile_3_middle_nr", -1, -1, 5, 5, -1, 8, TileSide.INVALID);
        Tile t30_90 = new Tile("tile_3_middle_nr_90", 5, 5, -1, -1, -1, 12, TileSide.INVALID);

        Tile t31 = new Tile("tile_3_right", -1, -1, -1, 5, 7, 7, TileSide.INVALID);
        Tile t31_90 = new Tile("tile_3_right_90", 5, -1, -1, -1, 11, 11, TileSide.INVALID);

        Tile t32 = new Tile("tile_3_right_fancy", -1, -1, -1, 3, -1, 7, TileSide.INVALID);
        Tile t32_90 = new Tile("tile_3_right_fancy_90", 3, -1, -1, -1, -1, 11, TileSide.INVALID);

        Tile t33 = new Tile("tile_3_right_nr", -1, -1, -1, 5, -1, 7, TileSide.INVALID);
        Tile t33_90 = new Tile("tile_3_right_nr", 5, -1, -1, -1, -1, 11, TileSide.INVALID);

        tiles.add(t1);
        tiles.add(t2);
        tiles.add(t3);
        tiles.add(t4);
        tiles.add(t4_90);
        tiles.add(t13);
        tiles.add(t13_90);
        tiles.add(t5);
        tiles.add(t5_90);
        tiles.add(t6);
        tiles.add(t6_90);
        tiles.add(t7);
        tiles.add(t7_90);
        tiles.add(t8);
        tiles.add(t8_90);
        tiles.add(t10);
        tiles.add(t10_90);
        tiles.add(t11);
        tiles.add(t11_90);
        tiles.add(t12);
        tiles.add(t12_90);
        tiles.add(t9);
        tiles.add(t9_90);
        tiles.add(t14);
        tiles.add(t14_90);
        tiles.add(t15);
        tiles.add(t15_90);
        tiles.add(t16);
        tiles.add(t16_90);
        tiles.add(t17);
        tiles.add(t17_90);
        tiles.add(t18);
        tiles.add(t18_90);
        tiles.add(t19);
        tiles.add(t20);
        tiles.add(t20_90);
        tiles.add(t21);
        tiles.add(t21_90);
        tiles.add(t22);
        tiles.add(t22_90);
        tiles.add(t23);
        tiles.add(t23_90);
        tiles.add(t24);
        tiles.add(t24_90);
        tiles.add(t25);
        tiles.add(t25_90);
        tiles.add(t26);
        tiles.add(t26_90);
        tiles.add(t27);
        tiles.add(t27_90);
        tiles.add(t28);
        tiles.add(t28_90);
        tiles.add(t29);
        tiles.add(t29_90);
        tiles.add(t30);
        tiles.add(t30_90);
        tiles.add(t31);
        tiles.add(t31_90);
        tiles.add(t32);
        tiles.add(t32_90);
        tiles.add(t33);
        tiles.add(t33_90);

        /** 
        Tile t34 = new Tile("tile_4_left", -1, -1, 3, -1, -1, 9);
        Tile t35 = new Tile("tile_4_left_nr", -1, -1, 5, -1, 9, 9);

        Tile t36 = new Tile("tile_4_middle", -1, -1, 3, 3, -1, 9);
        Tile t37 = new Tile("tile_4_middle_nr", -1, -1, 5, 5, 9, 9);

        Tile t38 = new Tile("tile_4_right", -1, -1, -1, 3, -1, 9);
        Tile t39 = new Tile("tile_4_right_nr", -1, -1, -1, 5, 9, 9);
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
