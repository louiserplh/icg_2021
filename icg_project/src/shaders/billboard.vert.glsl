// Per-vertex outputs passed on to the fragment shader
varying vec2 v2f_tex_coord;

// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 position;

// Global variables specified in "uniforms" entry of the pipeline
uniform mat4 mat_mvp;

void main() {
	v2f_tex_coord = position.xy;
	// TODO 4.2.1.1: Edit the vertex shader to apply mat_mvp to the vertex position.
	// Copy your from your previous homework
	// We just make the matrix-vector multiplication (see http://learnwebgl.brown37.net/12_shader_language/glsl_mathematical_operations.html)
	gl_Position = mat_mvp * vec4(position, 1);
}
