

export const SCENES = [
{
	name: "floor",
	camera: {
		position: [-2, 0, 1], target: [0, 0, 0], up: [1, 0, 0.75], fov: 75,
	},
	materials: [
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.6, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
	],
	lights: [],
	spheres: [],
	planes: [
		{center: [0.0, 0., -0.5], normal: [0, 0, 1], material: 'white'}, // floor
	],
	cylinders: [],
	mesh: null,
},
{
	name: "primitives",
	camera: {
		position: [0, 0, 0], target: [0, 0, 1], up: [0, 1, 0], fov: 75,
	},
	materials: [
		{name: 'green', color: [0.3, 1., 0.4], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.},
	],
	lights: [
		{position: [3., 0, -0.5], color: [1.0, 0.4, 0.2]},
		{position: [-3., -0.8, 3], color: [0.2, 0.4, 0.9]},
	],
	spheres: [
		{center: [0.0, 0.0, 2.0], radius: 1.0, material: 'green'},
		{center: [0.3, 0.5, 1.5], radius: 0.45, material: 'green'},
		{center: [-0.3, 0.5, 1.5], radius: 0.45, material: 'green'},
		{center: [0., -0.1, 1.0], radius: 0.2, material: 'green'},
	],
	planes: [
		{center: [0.0, 1., 0.], normal: [0., -1., 0.], material: 'green'}, // top
		{center: [0.0, -1., 0.], normal: [0., 1., 0.], material: 'green'}, // bottom
	],
	cylinders: [
		{center: [0.0, -0.75, 1.5], radius: 0.5, height: 0.2, axis: [0., 1., 0.], material: 'green'},
	],
	mesh: null,
},
{
	name: "corner",
	camera: {
		position: [0, 0.5, 0], target: [0, 0.5, 1], up: [0, 1, 0], fov: 75,
	},
	materials: [
		{name: 'green', color: [0.3, 1., 0.4], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.},
	],
	lights: [
		{position: [0., 0., 0.1], color: [1.0, 0.4, 0.2]},
	],
	spheres: [],
	planes: [
		{center: [0.0, 0., 1.], normal: [0., 0., 1.], material: 'green'},
		{center: [0.0, 0., 0.], normal: [0., 1., 0.], material: 'green'},
		{center: [-0.3, 0., 0.], normal: [1., 0., 0.], material: 'green'},
	],
	cylinders: [],
	mesh: null,
},
{
	name: "barrel",
	camera: {
		position: [0, 0, 0], target: [0, 0, 1], up: [0, 1, 0], fov: 75,
	},
	materials: [
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.6, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
	],
	lights: [
		{position: [0., 0., 0.], color: [1.0, 0.4, 0.2]},
	],
	spheres: [
		{center: [0, 0, 7], radius: 1, material: 'white'},
	],
	planes: [],
	cylinders: [
		{center: [0.0, 0.0, 0.0], radius: 0.1, height: 0.5, axis: [0., 0., 1.], material: 'white'},
	],
	mesh: null,
},
{
	name: "cylinders",
	camera: {
		position: [0, 3, 8], target: [0, 1, 0], up: [0, 1, 0], fov: 45,
	},
	materials: [
		{name: 'white', color: [0.9, 0.9, 0.9], ambient: 0.6, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.1},
	],
	lights: [
		{position: [20, 50, 0], color: [1.0, 0.4, 0.2]},
		{position: [50, 50, 50], color: [0.2, 0.4, 0.9]},
		{position: [-50, 50, 50], color: [0.2, 0.8, 0.2]},
	],
	spheres: [],
	planes: [],
	cylinders: [
		{center: [-1.5, 1.0, 0.0], radius: 0.5, height: 1.5, axis: [-1, 1, 1], material: 'white'},
		{center: [ 0.0, 1.0, 0.0], radius: 0.5, height: 1.5, axis: [0, 1, 1], material: 'white'},
		{center: [ 1.5, 1.0, 0.0], radius: 0.5, height: 1.5, axis: [1, 1, 1], material: 'white'},
	],
	mesh: null,
},
{
	name: "empty",
	camera: {
		position: [0, 0, 0], target: [0, 0, 1], up: [0, 1, 0], fov: 75,
	},
	materials: [
		{name: 'green', color: [0.3, 1., 0.4], ambient: 0.2, diffuse: 0.9, specular: 0.1, shininess: 4., mirror: 0.},
	],
	lights: [],
	spheres: [],
	planes: [],
	cylinders: [],
	mesh: null,
}
]

export const SCENES_BY_NAME = Object.fromEntries(SCENES.map((sc) => [sc.name, sc]))
