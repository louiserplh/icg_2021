precision mediump float;
const vec3 glow_color = vec3(1.0, 0.5, 0.0);
// Per-vertex outputs passed on to the fragment shader
varying vec2 v2f_tex_coord;

void main()
{
	// TODO 5.1.2 compute the alpha value of each fragment
	// The alpha value of this fragment exponentially decrease when the v2f_tex_coord is away from the center
	// We choose a decreasing by 2^(-8*dist^2) from empirical tests and prefering power of 2 functions for performances reasons
	gl_FragColor = vec4(glow_color, exp2(-8.* length(v2f_tex_coord)*length(v2f_tex_coord)));
}
