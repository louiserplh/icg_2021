precision mediump float;
		
varying vec2 v2f_tex_coord;
varying vec3 v2f_normal; // normal vector in camera coordinates
varying vec3 v2f_dir_to_light; // direction to light source
varying vec3 v2f_dir_from_view; // viewing vector (from eye to vertex in view coordinates)


uniform vec3  light_color;
uniform float ambient;
uniform float shininess;

uniform sampler2D texture_base_color;

void main() {

	/**
    *  Implement the Phong shading model by using the passed
    *  variables and write the resulting color to `color`.
    *  `texture_base_color` should be used as material parameter for ambient, diffuse and specular lighting.
    * Hints:
    * - The texture(texture, 2d_position) returns a 4-vector (rgba). You can use
    * `texture(...).r` to get just the red component or `texture(...).rgb` to get a vec3 color
    * value
     */
     // Computes the base color of our material in RGA vector
     vec4 material_color = texture2D(texture_base_color, v2f_tex_coord);
     // Creates the useful vectors for later computations
     vec3 n = normalize(v2f_normal);
     vec3 l = normalize(v2f_dir_to_light);
     vec3 v = -normalize(v2f_dir_from_view);
     vec3 r = normalize(2. * n * dot(n,l) - l);
     
     // Compute the ambiant component (I_a as described in handout and use the material color in component wide product of vectors)
     vec3 I_a = ambient * light_color;
     vec3 ambiant_component = I_a * material_color.rgb;

     // Compute the diffuse component
     vec3 diffuse_component = vec3(0.);
     if(dot(n, l) > 0.){
         diffuse_component = light_color * material_color.rgb * dot(n, l);
     }

     // Compute the specular component
     vec3 specular_component = vec3(0.);
     if(dot(n,l) > 0. && dot(r, v) > 0.){
         specular_component = light_color * material_color.rgb * pow(dot(r, v), shininess);
     }

     vec3 I = ambiant_component + diffuse_component + specular_component;

	gl_FragColor = vec4(I, 1.); // output: RGBA in 0..1 range
}
