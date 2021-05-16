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

    vec3 m_day = texture2D(texture_surface_day, v2f_tex_coord).rgb;
    vec3 m_night = texture2D(texture_surface_night, v2f_tex_coord).rgb;
    float m_clouds = texture2D(texture_clouds, v2f_tex_coord).r;
    float m_gloss = texture2D(texture_gloss, v2f_tex_coord).r;

    // DAY COLOR ========================================================================================================
    vec3 norm_dir_to_light = normalize(v2f_dir_to_light);
    vec3 norm_dir_from_view = normalize(v2f_dir_from_view);
    vec3 norm_normal = normalize(v2f_normal);
    float n_dot_l = dot(norm_normal, norm_dir_to_light);
    float r_dot_v = dot(norm_dir_from_view, reflect(norm_dir_to_light, norm_normal));

    vec3 sum1 = m_day * light_color * ambient;
    vec3 sum2 = m_day * light_color * n_dot_l;
    vec3 sum3 = m_gloss *  (1. - m_clouds) * light_color * pow(r_dot_v, shininess) * vec3(1, 1, 1);
    vec3 day_color = sum1;
    if(n_dot_l > 0.) {
        day_color += sum2;
        if(r_dot_v > 0.){
            day_color += sum3;
        }
    }
    // CLOUDS ========================================================================================================
    vec3 cloud_sum1 = m_clouds * light_color * ambient;
    vec3 cloud_sum2 = m_clouds * light_color * n_dot_l;
    vec3 cloud_color = cloud_sum1;
    if(n_dot_l > 0.) {
        cloud_color += cloud_sum2;
    }
    // INTERPOLATE ========================================================================================================
    vec3 night_color = mix(m_night, vec3(0, 0, 0), m_clouds);
    vec3 day_color_clouds = mix(day_color, cloud_color, m_clouds);
    gl_FragColor = vec4(mix(night_color, day_color_clouds, clamp(n_dot_l, 0., 1.)), 1);
}
