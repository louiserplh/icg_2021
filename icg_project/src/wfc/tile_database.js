import { Tile } from "./tile_object.js";

/**
 * A class to store in main memory the definition and socket values of all the tiles we created
 */

/**
* NONE = -2
* FLOOR = 0
* AIR = -1
* AIR + FLOOR = -3
*
* RED ROOF/FLOOR ALONE = 1
*
* RED ROOF/FLOOR LEFT = 6
* RED ROOF/FLOOR LEFT 90 = 10
*
* RED ROOF/FLOOR LEFT CORNER = 13
* RED ROOF/FLOOR LEFT CORNER 90 = 14
*
* RED ROOF/FLOOR RIGHT = 7
* RED ROOF/FLOOR RIGHT 90 = 11
*
* RED ROOF/FLOOR RIGHT CORNER = 15
* RED ROOF/FLOOR RIGHT CORNER 90 = 16
*
* RED ROOF/FLOOR MIDDLE = 8
* RED ROOF/FLOOR MIDDLE 90 = 12
*
* ROOF SIDE WITH FLOOR = 2
* ROOF SIDE WITHOUT FLOOR = 3
*
* NO ROOF SIDE WITH FLOOR = 4
* NO ROOF SIDE WITHOUT FLOOR = 5
*
* NO ROOF BALCONY = 9
*
* ORDER : FRONT BACK LEFT RIGHT TOP BOTTOM
*         0    1     2    3
*
* turning to the right (=> 90 = 90 to the right)

*/

const t40 = new Tile("floor", -2, -2, -2, -2, 0, -2, -1);
const t0 = new Tile("air", -1, -1, -1, -1, -1, -1, -1);
const t0_b = new Tile("air_b", -3, -3, -3, -3, -1, 0, -1);

const t1 = new Tile("tile_1_alone", -3, -3, -3, -3, -1, 0, 0);
const t2 = new Tile("tile_1_alone_nb", -1, -1, -1, -1, -1, 1, -1);
const t3 = new Tile("tile_1_alone_nr", -3, -3, -3, -3, 1, 0, 0);

const t4 = new Tile("tile_1_left", -3, -3, 2, -3, -1, 0, 0);
const t4_90 = new Tile("tile_1_left_90", -3, 2, -3, -3, -1, 0, 2);

const t5 = new Tile("tile_1_left_corner", -3, 2, 2, -3, -1, 0, 0);
const t5_90 = new Tile("tile_1_left_corner_90", -3, 2, -3, 2, -1, 0, 2);

const t6 = new Tile("tile_1_left_nb", -1, -1, 3, -1, -1, 6, -1);
const t6_90 = new Tile("tile_1_left_nb_90", -1, 3, -1, -1, -1, 10, -1);

const t7 = new Tile("tile_1_left_nb_corner", -1, 3, 3, -1, -1, 13, -1);
const t7_90 = new Tile("tile_1_left_nb_corner_90", -1, 3, -1, 3, -1, 14, -1);

const t8 = new Tile("tile_1_left_nr", -3, -3, 4, -3, 6, 0, 0);
const t8_90 = new Tile("tile_1_left_nr_90", -3, 4, -3, -3, 10, 0, 2);

const t9 = new Tile("tile_1_left_nr_corner", -3, 4, 4, -3, 13, 0, 0);
const t9_90 = new Tile("tile_1_left_nr_corner_90", -3, 4, -3, 4, 14, 0, 2);

const t10 = new Tile("tile_1_middle", -3, -3, 2, 2, -1, 0, 0);
const t10_90 = new Tile("tile_1_middle_90", 2, 2, -3, -3, -1, 0, -1);

const t11 = new Tile("tile_1_middle_nb", -1, -1, 2, 2, -1, 8, -1);
const t11_90 = new Tile("tile_1_middle_nb_90", 2, 2, -1, -1, -1, 12, -1);

const t12 = new Tile("tile_1_middle_nr", -3, -3, 4, 4, 8, 0, -1);
const t12_90 = new Tile("tile_1_middle_nr_90", 4, 4, -3, -3, 12, 0, -1);

const t13 = new Tile("tile_1_right", -3, -3, -3, 2, -1, 0, 0);
const t13_90 = new Tile("tile_1_right_90", 2, -3, -3, -3, -1, 0, 2);

const t14 = new Tile("tile_1_right_corner", -3, 2, -3, 2, -1, 0, 0);
const t14_90 = new Tile("tile_1_right_corner_90", 2, -3, -3, 2, -1, 0, 2);

const t15 = new Tile("tile_1_right_nb", -1, -1, -1, 3, -1, 7, -1);
const t15_90 = new Tile("tile_1_right_nb_90", 3, -1, -1, -1, -1, 11, -1);

const t16 = new Tile("tile_1_right_nb_corner", -1, 3, -1, 3, -1, 15, -1);
const t16_90 = new Tile("tile_1_right_nb_corner_90", -1, 3, -1, 3, -1, 16, -1);

const t17 = new Tile("tile_1_right_nr", -3, -3, -3, 4, 7, 0, 0);
const t17_90 = new Tile("tile_1_right_nr_90", 4, -3, -3, -3, 11, 0, 2);

const t18 = new Tile("tile_1_right_nr_corner", -3, 4, -3, 4, 15, 0, 0);
const t18_90 = new Tile("tile_1_right_nr_corner_90", 4, -3, 4, -3, 16, 0, 2);

const t19 = new Tile("tile_2_alone_nr", -1, -1, -1, -1, 1, 1, -1);

const t20 = new Tile("tile_2_left_nr", -1, -1, 5, -1, 6, 6, -1);
const t20_90 = new Tile("tile_2_left_nr_90", -1, 5, -1, -1, 10, 10, -1);

const t21 = new Tile("tile_2_left_nr_corner", -1, 5, 5, -1, 6, 6, -1);
const t21_90 = new Tile("tile_2_left_nr_corner_90", -1, 5, -1, 5, 10, 10, -1);

const t22 = new Tile("tile_2_middle_nr", -1, -1, 5, 5, 8, 8, -1);
const t22_90 = new Tile("tile_2_middle_nr_90", 5, 5, -1, -1, 12, 12, -1);

const t23 = new Tile("tile_2_right_nr", -1, -1, -1, 5, 7, 7, -1);
const t23_90 = new Tile("tile_2_right_nr_90", 5, -1, -1, -1, 11, 11, -1);

const t24 = new Tile("tile_2_right_nr_corner", -1, 5, -1, 5, 7, 7, -1);
const t24_90 = new Tile("tile_2_right_nr_corner_90", 5, -1, -1, 5, 11, 11, -1);

const t25 = new Tile("tile_3_left", -1, -1, 5, -1, 6, 6, -1);
const t25_90 = new Tile("tile_3_left_90", -1, 5, -1, -1, 10, 10, -1);

const t26 = new Tile("tile_3_left_fancy", -1, -1, 3, -1, -1, 6, -1);
const t26_90 = new Tile("tile_3_left_fancy_90", -1, 3, -1, -1, -1, 10, -1);

const t27 = new Tile("tile_3_left_nr", -1, -1, 5, -1, -1, 6, -1);
const t27_90 = new Tile("tile_3_left_nr_90", -1, 5, -1, -1, -1, 10, -1);

const t28 = new Tile("tile_3_middle", -1, -1, 5, 5, 8, 8, -1);
const t28_90 = new Tile("tile_3_middle_90", 5, 5, -1, -1, 12, 12, -1);

const t29 = new Tile("tile_3_middle_fancy", -1, -1, 3, 3, 8, 8, -1);
const t29_90 = new Tile("tile_3_middle_fancy_90", 3, 3, -1, -1, 12, 12, -1);

const t30 = new Tile("tile_3_middle_nr", -1, -1, 5, 5, -1, 8, -1);
const t30_90 = new Tile("tile_3_middle_nr_90", 5, 5, -1, -1, -1, 12, -1);

const t31 = new Tile("tile_3_right", -1, -1, -1, 5, 7, 7, -1);
const t31_90 = new Tile("tile_3_right_90", 5, -1, -1, -1, 11, 11, -1);

const t32 = new Tile("tile_3_right_fancy", -1, -1, -1, 3, -1, 7, -1);
const t32_90 = new Tile("tile_3_right_fancy_90", 3, -1, -1, -1, -1, 11, -1);

const t33 = new Tile("tile_3_right_nr", -1, -1, -1, 5, -1, 7, -1);
const t33_90 = new Tile("tile_3_right_nr", 5, -1, -1, -1, -1, 11, -1);

const t34 = new Tile("tile_4_left", -1, -1, 3, -1, -1, 9);
const t35 = new Tile("tile_4_left_nr", -1, -1, 5, -1, 9, 9);

const t36 = new Tile("tile_4_middle", -1, -1, 3, 3, -1, 9);
const t37 = new Tile("tile_4_middle_nr", -1, -1, 5, 5, 9, 9);

const t38 = new Tile("tile_4_right", -1, -1, -1, 3, -1, 9);
const t39 = new Tile("tile_4_right_nr", -1, -1, -1, 5, 9, 9);

const all_tiles = [
  t0,
  t0_b,
  t40,
  t1,
  t2,
  t3,
  t4,
  t4_90,
  t5,
  t5_90,
  t6,
  t6_90,
  t7,
  t7_90,
  t8,
  t8_90,
  t9,
  t9_90,
  t10,
  t10_90,
  t11,
  t11_90,
  t12,
  t12_90,
  t13,
  t13_90,
  t14,
  t14_90,
  t15,
  t15_90,
  t16,
  t16_90,
  t17,
  t17_90,
  t18,
  t18_90,
  t19,
  t20,
  t20_90,
  t21,
  t21_90,
  t22,
  t22_90,
  t23,
  t23_90,
  t24,
  t24_90,
  t25,
  t25_90,
  t26,
  t26_90,
  t27,
  t27_90,
  t28,
  t28_90,
  t29,
  t29_90,
  t30,
  t30_90,
  t31,
  t31_90,
  t32,
  t32_90,
  t33,
  t33_90,
  t34,
  t35,
  t36,
  t37,
  t38,
  t39,
];

// returns an immutable copy of the array of all tiles
export function getTilesList() {
  return [].concat(all_tiles);
}

// returns floor tile TODO what does it mean ?
export function getFloor() {
  return t40;
}

// returns air tile TODO what does it mean ?
export function getAir() {
  return t0;
}

// returns floor/air tile TODO what does it mean ?
export function getFloorAir() {
  return t0_b;
}
