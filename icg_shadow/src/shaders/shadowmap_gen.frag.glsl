precision mediump float;

varying vec3 v2f_position_view;

void main () {
	/* Todo 6.2.1
	Draw the shadow map.
	Compute the Euclidean distance from the light camera to the fragment.
	Store the distance into the red channel of the fragment's color.
	*/
	float depth = 5.0 * (1.0 + cos(v2f_position_view.x)); // Something temporary for you to visualize when you debug the cube camera matrices
	gl_FragColor.r = depth;
}
