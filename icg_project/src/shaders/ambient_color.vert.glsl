// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 position;
attribute vec3 color;

varying vec3 v2f_color;

uniform mat4 mat_mvp;

void main() {
	v2f_color = color;
	gl_Position = mat_mvp *  vec4(position, 1);
}
