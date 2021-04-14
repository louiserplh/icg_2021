//=============================================================================
//
//   Exercise code for the lecture "Introduction to Computer Graphics"
//     by Prof. Mario Botsch, Bielefeld University
//
//   Copyright (C) by Computer Graphics Group, Bielefeld University
//
//=============================================================================

precision mediump float;

varying vec2 v2f_tex_coord;
varying vec3 v2f_normal; // normal vector in camera coordinates
varying vec3 v2f_dir_to_light; // direction to light source
varying vec3 v2f_dir_from_view; // viewing vector (from eye to vertex in view coordinates)

uniform sampler2D texture_surface_day;
uniform sampler2D texture_surface_night;
uniform sampler2D texture_clouds;
uniform sampler2D texture_gloss;
uniform float sim_time;

uniform vec3  light_color;
uniform float ambient;
uniform float shininess;

void main()
{

	/** TODO 5.3:
    * - Copy your working code from the fragment shader of your Phong shader use it as
    * starting point
    * - instead of using a single texture, use the four texures `texture_surface_day`, `texture_surface_night`,
    * `texture_clouds` and `texture_gloss` and mix them for enhanced effects
    * Hints:
    * - cloud and gloss textures are just greyscales. So you'll just need one color-
    * component.
    * - The texture(texture, 2d_position) returns a 4-vector (rgba). You can use
    * `texture(...).r` to get just the red component or `texture(...).rgb` to get a vec3 color
    * value
    * - use mix(vec3 a,vec3 b, s) = a*(1-s) + b*s for linear interpolation of two colors
     */


	// Computes the base color of our material in RGA vector

     //vec4 material_color = texture2D(texture_base_color, v2f_tex_coord);
     vec4 cloud = texture2D(texture_gloss, v2f_tex_coord);
     cloud -= texture2D(texture_clouds, v2f_tex_coord);
     // Creates the useful vectors for later computations
     vec3 n = normalize(v2f_normal);
     vec3 l = normalize(v2f_dir_to_light);
     vec3 v = -normalize(v2f_dir_from_view);
     vec3 r = normalize(2. * n * dot(n,l) - l);

     vec4 material_color_day = texture2D(texture_surface_day, v2f_tex_coord);
     vec4 material_color_night = texture2D(texture_surface_night, v2f_tex_coord);
     vec3 material_color = mix(material_color_night.rgb, material_color_day.rgb, dot(n, l));
     // Compute the ambiant component (I_a as described in handout and use the material color in component wide product of vectors)
     vec3 I_a = ambient * light_color;
     vec3 ambiant_component = I_a * material_color.rgb;

     vec4 cloud_color = texture2D(texture_clouds, v2f_tex_coord);
     vec3 ambiant_component_cloud = I_a * cloud_color.rgb;

     // Compute the diffuse component
     vec3 diffuse_component = vec3(0.);
     if(dot(n, l) > 0.){
         diffuse_component = light_color * material_color.rgb * dot(n, l);
     }

     vec3 diffuse_component_cloud = vec3(0.);
     if(dot(n, l) > 0.){
         diffuse_component_cloud = light_color * cloud_color.rgb * dot(n, l);
     }

     // Compute the specular component
     vec3 specular_component = vec3(0.);
     if(dot(n,l) > 0. && dot(r, v) > 0.){
         specular_component = light_color * material_color.rgb * pow(dot(r, v), shininess);
         specular_component *= cloud.rgb;
     }

     vec3 I_earth = ambiant_component + diffuse_component + specular_component;
     vec3 I_cloud = ambiant_component_cloud + diffuse_component_cloud;

     vec3 I = mix(I_earth.rgb, I_cloud.rgb, cloud_color.r);

	gl_FragColor = vec4(I, 1.); // output: RGBA in 0..1 range
}
