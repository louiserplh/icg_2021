// Vertex attributes, specified in the "attributes" entry of the pipeline
attribute vec3 position;
attribute vec3 normal;

attribute vec3 diffuse_color;
attribute vec3 specular_color;

// Per-vertex outputs passed on to the fragment shader
varying vec3 v2f_position_view; // vertex position in eye (camera) coordinates
varying vec3 v2f_normal;		// normal vector   in eye (camera) coordinates
varying vec3 v2f_diffuse_color;
varying vec3 v2f_specular_color;

uniform mat4 mat_mvp;
uniform mat4 mat_model_view;
uniform mat3 mat_normals; // mat3 not 4, because normals are only rotated and not translated

void main() {
	vec4 position_v4 = vec4(position, 1);

	/** TODO 5.2:
	Adapt implementation from assignment 5 to calculate the `varying` outputs
	of this shader (v2f_position_view and v2f_normal) and the gl_Position.
    */
	// viewing vector (from camera to vertex in view coordinates), camera is at vec3(0, 0, 0) in cam coords
	v2f_position_view = vec3(1, 0, 0); // TODO calculate
	// transform normal to camera coordinates
	v2f_normal = normal; // TODO apply normal transformation
	gl_Position = vec4(0., 0., 0., 1.); // TODO apply mvp matrix to position

	v2f_diffuse_color = diffuse_color;
	v2f_specular_color = specular_color;
}
