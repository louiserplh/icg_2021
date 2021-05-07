precision highp float;

varying vec3 v2f_position_view;  // vertex position in camera coordinates
varying vec3 v2f_position_mesh;

uniform samplerCube light_distance_cubemap;
uniform samplerCube annotation_cubemap;

const vec3 arrow_color = vec3(0.91, 0.58, 0.08);
const vec3 text_color = vec3(0.91, 0.28, 0.08);

void main() {
    
    vec4 cubemap_value = textureCube(light_distance_cubemap, v2f_position_mesh);
	vec4 annotation_value = textureCube(annotation_cubemap, v2f_position_mesh);
    
    float annotation_opacity = min(1., annotation_value.r + annotation_value.g);
	vec3 annotation_color = annotation_value.r * arrow_color + annotation_value.g * text_color;

	vec3 color = mix(vec3(cubemap_value.r * 0.1), annotation_color, annotation_opacity);

    gl_FragColor = vec4(color, 1.); // output: RGBA in 0..1 range
}
