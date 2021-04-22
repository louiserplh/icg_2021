precision highp float;

varying vec3 v2f_normal;         // normal vector in camera coordinates
varying vec3 v2f_position_view;  // vertex position in camera coordinates
varying vec3 v2f_diffuse_color;  // Material's diffuse color, m_d
varying vec3 v2f_specular_color; // Material's specular color, m_s

uniform vec3 light_position; // light position in camera coordinates

uniform vec3 light_color;
uniform samplerCube shadow_cubemap;

// Material parameters
uniform float shininess;

void main() {
    // Normalize the interpolated normal
    vec3 N = -sign(dot(v2f_normal, v2f_position_view)) *  // Orient the normal so it always points opposite the camera rays (for backfaces)
             normalize(v2f_normal);
    vec3 v2f_dir_to_light = light_position - v2f_position_view;
    vec3 I = vec3(0.);
    /** Todo 6.2.2
    * Compute this light's diffuse and specular contributions.
    * You should be able to copy your phong lighting code from assignment 5 mostly as-is,
    * though notice that the light and view vectors need to be computed from scratch
    * here; this time, they are not passed from the vertex shader. Also, the light/material
	* colors have changed; see the Phong lighting equation in the handout if you need
	* a refresher to understand how to incorporate `light_color` (the diffuse and specular
	* colors of the light), `v2f_diffuse_color` and `v2f_specular_color`.
	*
	* To model the attenuation of a point light, you should scale the light
	* color by the inverse distance squared to the point being lit.
    *
    * The light should only contribute to this fragment if the fragment is not occluded
    * by another object in the scene. You need to check this by comparing the distance
    * from the fragment to the light against the distance recorded for this
    * light ray in the shadow map.
    *
    * To prevent "shadow acne" and minimize aliasing issues, we need a rather large
    * tolerance on the distance comparison. It's recommended to use a *multiplicative*
    * instead of additive tolerance: compare the fragment's distance to 1.01x the
    * distance from the shadow map.
    ***/
    float shadow_map_dist = textureCube(shadow_cubemap, - v2f_dir_to_light).r;
    if(length(v2f_dir_to_light) <= 1.01 * shadow_map_dist){ //  prevent shadow acne

        vec3 l = normalize(v2f_dir_to_light);
        vec3 v = -normalize(v2f_position_view);
        vec3 r = normalize(2. * N * dot(N,l) - l);
        //vec3 n = normalize(v2f_normal);

        // Compute attenuation
        vec3 attenuation = (1. / pow(length(v2f_dir_to_light), 2.)) * light_color;
        // Compute the diffuse component
        vec3 diffuse_component = vec3(0.);
        if(dot(N, l) > 0.){
            diffuse_component = attenuation * v2f_diffuse_color * dot(N, l);
        }

        // Compute the specular component
        vec3 specular_component = vec3(0.);
        if(dot(N,l) > 0. && dot(r, v) > 0.){
            specular_component = attenuation * v2f_specular_color * pow(dot(r, v), shininess);
        }

        I = diffuse_component + specular_component;
    }

	gl_FragColor = vec4(I, 1.); // output: RGBA in 0..1 range
}
