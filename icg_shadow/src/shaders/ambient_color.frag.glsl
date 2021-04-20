precision mediump float;
		
varying vec3 v2f_color;
uniform vec3 light_color;

const float ambient_intensity = 0.4;

void main() {
	gl_FragColor = vec4(light_color * v2f_color * ambient_intensity, 1.); // output: RGBA in 0..1 range
}

