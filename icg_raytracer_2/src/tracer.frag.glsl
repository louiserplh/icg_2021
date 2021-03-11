precision highp float;

#define MAX_RANGE 1e6
//#define NUM_REFLECTIONS

//#define NUM_SPHERES
#if NUM_SPHERES != 0
uniform vec4 spheres_center_radius[NUM_SPHERES]; // ...[i] = [center_x, center_y, center_z, radius]
#endif

//#define NUM_PLANES
#if NUM_PLANES != 0
uniform vec4 planes_normal_offset[NUM_PLANES]; // ...[i] = [nx, ny, nz, d] such that dot(vec3(nx, ny, nz), point_on_plane) = d
#endif

//#define NUM_CYLINDERS
struct Cylinder {
	vec3 center;
	vec3 axis;
	float radius;
	float height;
};
#if NUM_CYLINDERS != 0
uniform Cylinder cylinders[NUM_CYLINDERS];
#endif


//#define NUM_TRIANGLES
struct Triangle {
	mat3 vertices;
// 	mat3 normals;
};
struct AABB {
	vec3 corner_min;
	vec3 corner_max;
};
#if NUM_TRIANGLES != 0
uniform Triangle triangles[NUM_TRIANGLES];
uniform AABB mesh_extent;
#endif

// materials
//#define NUM_MATERIALS
struct Material {
	vec3 color;
	float ambient;
	float diffuse;
	float specular;
	float shininess;
	float mirror;
};
uniform Material materials[NUM_MATERIALS];
#if (NUM_SPHERES != 0) || (NUM_PLANES != 0) || (NUM_CYLINDERS != 0) || (NUM_TRIANGLES != 0)
uniform int object_material_id[NUM_SPHERES+NUM_PLANES+NUM_CYLINDERS];
#endif

// lights
//#define NUM_LIGHTS
struct Light {
	vec3 color;
	vec3 position;
};
#if NUM_LIGHTS != 0
uniform Light lights[NUM_LIGHTS];
#endif
uniform vec3 light_color_ambient;


varying vec3 v2f_ray_origin;
varying vec3 v2f_ray_direction;

/*
	Squares a value
*/
float square(float x){
	return x*x;
}

/*
	Computes the norm of a vec3
*/
float norm(vec3 x){
	return sqrt(dot(x,x));
}

/*
	Solve the quadratic a*x^2 + b*x + c = 0. The method returns the number of solutions and store them
	in the argument solutions.
*/
int solve_quadratic(float a, float b, float c, out vec2 solutions) {

	// Linear case: bx+c = 0
	if (abs(a) < 1e-12) {
		if (abs(b) < 1e-12) {
			// no solutions
			return 0; 
		} else {
			// 1 solution: -c/b
			solutions[0] = - c / b;
			return 1;
		}
	} else {
		float delta = b * b - 4. * a * c;

		if (delta < 0.) {
			// no solutions in real numbers, sqrt(delta) produces an imaginary value
			return 0;
		} 

		// Avoid cancellation:
		// One solution doesn't suffer cancellation:
		//      a * x1 = 1 / 2 [-b - bSign * sqrt(b^2 - 4ac)]
		// "x2" can be found from the fact:
		//      a * x1 * x2 = c

		// We do not use the sign function, because it returns 0
		// float a_x1 = -0.5 * (b + sqrt(delta) * sign(b));
		float sqd = sqrt(delta);
		if (b < 0.) {
			sqd = -sqd;
		}
		float a_x1 = -0.5 * (b + sqd);


		solutions[0] = a_x1 / a;
		solutions[1] = c / a_x1;

		// 2 solutions
		return 2;
	} 
}

/*
	Check for intersection of the ray with a given sphere in the scene.
*/
bool ray_sphere_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		vec3 sphere_center, float sphere_radius, 
		out float t, out vec3 normal) 
{
	vec3 oc = ray_origin - sphere_center;

	vec2 solutions; // solutions will be stored here

	int num_solutions = solve_quadratic(
		// A: t^2 * ||d||^2 = dot(ray_direction, ray_direction) but ray_direction is normalized
		1., 
		// B: t * (2d dot (o - c))
		2. * dot(ray_direction, oc),	
		// C: ||o-c||^2 - r^2				
		dot(oc, oc) - sphere_radius*sphere_radius,
		// where to store solutions
		solutions
	);

	// result = distance to collision
	// MAX_RANGE means there is no collision found
	t = MAX_RANGE+10.;
	bool collision_happened = false;

	if (num_solutions >= 1 && solutions[0] > 0.) {
		t = solutions[0];
	}
	
	if (num_solutions >= 2 && solutions[1] > 0. && solutions[1] < t) {
		t = solutions[1];
	}

	if (t < MAX_RANGE) {
		vec3 intersection_point = ray_origin + ray_direction * t;
		normal = (intersection_point - sphere_center) / sphere_radius;

		return true;
	} else {
		return false;
	}	
}

/*
	Check for intersection of the ray with a given plane in the scene.
*/
bool ray_plane_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		vec3 plane_normal, float plane_offset, 
		out float t, out vec3 normal) 
{
	/** TODO 1.1:
	The plane is described by its normal vec3(nx, ny, nz) and an offset d.
	Point p belongs to the plane iff `dot(normal, p) = d`.

	- compute the ray's ntersection of the plane
	- if ray and plane are parallel there is no intersection
	- otherwise compute intersection data and store it in `normal`, and `t` (distance along ray until intersection).
	- return whether there is an intersection in front of the viewer (t > 0)
	*/

	// can use the plane center if you need it
	vec3 plane_center = plane_normal * plane_offset;
	t = MAX_RANGE + 10.;
	//our code ->

	float normal_dot_direction = dot(plane_normal, ray_direction);

	if (normal_dot_direction == 0.) {
		// The plane and the ray are orthogonal
		return false;
	}else{
		t = dot(plane_normal, plane_center-ray_origin) / normal_dot_direction;
		normal = normal_dot_direction > 0. ?  -plane_normal : plane_normal;
		return (t > 0.);
	}
	// <- our code
}

/*
	Computes wether a ray intersects the cylinder 'cyl' imagining
	it has inifite length.
*/
bool ray_infinite_cylinder_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		Cylinder cyl, out vec2 t_candidates) 
{
	vec3 intersection_point;
	t_candidates[0] = MAX_RANGE + 10.;
	t_candidates[1] = MAX_RANGE + 10.;

	// d-(a.d)a
	vec3 comp1 = ray_direction-dot(cyl.axis, ray_direction)*cyl.axis;

	// o-c-a(a.(o-c))
	vec3 comp2 = ray_origin-cyl.center-cyl.axis*dot(cyl.axis, ray_origin-cyl.center);
	
	// a=(d-(a.d)a)^2
	float a = dot(comp1, comp1);
	// b=2d.(o-c)-2a.(d+o-c)
	float b = 2.*dot(comp1,comp2);
	// c=(o-c-a(a.(o-c)))^2-r^2
	float c = dot(comp2, comp2)-square(cyl.radius);

	vec2 solutions;
	int num_solutions = solve_quadratic(a, b, c, solutions);

	/* see implementation in ray_sphere_intersection */

	// if the ray is tangent to the cylinder
	if(num_solutions >=1 && solutions[0] > 0.){
		t_candidates[0] = solutions[0];
	}
	// if the ray crosses the cylinder, we take the closest one
	if(num_solutions>=2 && solutions[1] > 0.){
		t_candidates[0] = solutions[0] < solutions[1]?solutions[0]:solutions[1];
		t_candidates[1] = solutions[0] > solutions[1]?solutions[0]:solutions[1];
	}

	// MAX_RANGE indicates there is no collision detected
	if(t_candidates[0] < MAX_RANGE){
		return true;
	} else {
		return false;
	}
}

/*
	Computes the intersection point of a finite cylinder given
	it intersects an infinite length's one at 'intersection' 
*/
bool ray_caps_cylinder_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		Cylinder cyl,
		vec2 t_candidates,
		out float t, out vec3 normal) 
{
	
	float cap1_offset = cyl.height/2.;
	float cap2_offset = -cyl.height/2.;

	vec3 center_cap_1 = cyl.center+cap1_offset*cyl.axis;
	vec3 center_cap_2 = cyl.center+cap2_offset*cyl.axis;

	for(int i = 0; i < 2; ++i){
		vec3 intersection_point = ray_origin + ray_direction * t_candidates[i];
		// x-c
		vec3 cyl_center_to_intersection = intersection_point-cyl.center;
		// projection of (x-c) along a axis: (a.(x-c))a
		vec3 x_c_along_a = dot(cyl.axis, cyl_center_to_intersection)*cyl.axis;
		// component from cylinder axis to intersection point
		vec3 r = cyl_center_to_intersection - x_c_along_a;

		vec3 intersection_to_cap1 = center_cap_1-intersection_point+r;
		vec3 intersection_to_cap2 = center_cap_2-intersection_point+r;

		// compute if the intersection is at most h far from both caps
		if(norm(intersection_to_cap1)<=cyl.height
		&& norm(intersection_to_cap2)<=cyl.height){
			t=t_candidates[i];
			normal = dot(r, ray_direction) > 0. ?  -normalize(r) : normalize(r);
			return true;
		}
	}
	return false;
}

/*
	Check for intersection of the ray with a given cylinder in the scene.
*/
bool ray_cylinder_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		Cylinder cyl,
		out float t, out vec3 normal) 
{
	/** TODO 1.2.2: 
	- compute the ray's first valid intersection with the cylinder
		(valid means in front of the viewer: t > 0)
	- store intersection point in `intersection_point`
	- store ray parameter in `t`
	- store normal at intersection_point in `normal`.
	- return whether there is an intersection with t > 0
	*/
	vec2 t_candidates;
	if(ray_infinite_cylinder_intersection(ray_origin, ray_direction, cyl, t_candidates)){
		return ray_caps_cylinder_intersection(ray_origin, ray_direction, cyl, t_candidates, t, normal);
	}else{
		return false;
	}
}


bool ray_AABB_filter(
	vec3 ray_origin, vec3 ray_direction, AABB aabb)
{
	return true;
}

bool ray_triangle_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		Triangle tri,
		out float t, out vec3 normal) 
{

	vec3 p0 = tri.vertices[0];
	vec3 p1 = tri.vertices[1];
	vec3 p2 = tri.vertices[2];

	vec3 intersection_point;
	t = MAX_RANGE + 10.;

	return false;
}


/*
	Check for intersection of the ray with any object in the scene.
*/
bool ray_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		out float col_distance, out vec3 col_normal, out int material_id) 
{
	col_distance = MAX_RANGE + 10.;
	col_normal = vec3(0., 0., 0.);

	float object_distance;
	vec3 object_normal;

	// Check for intersection with each sphere
	#if NUM_SPHERES != 0 // only run if there are spheres in the scene
	for(int i = 0; i < NUM_SPHERES; i++) {
		bool b_col = ray_sphere_intersection(
			ray_origin, 
			ray_direction, 
			spheres_center_radius[i].xyz, 
			spheres_center_radius[i][3], 
			object_distance, 
			object_normal
		);

		// choose this collision if its closer than the previous one
		if (b_col && object_distance < col_distance) {
			col_distance = object_distance;
			col_normal = object_normal;
			material_id =  object_material_id[i];
		}
	}
	#endif

	// Check for intersection with each plane
	#if NUM_PLANES != 0 // only run if there are planes in the scene
	for(int i = 0; i < NUM_PLANES; i++) {
		bool b_col = ray_plane_intersection(
			ray_origin, 
			ray_direction, 
			planes_normal_offset[i].xyz, 
			planes_normal_offset[i][3], 
			object_distance, 
			object_normal
		);

		// choose this collision if its closer than the previous one
		if (b_col && object_distance < col_distance) {
			col_distance = object_distance;
			col_normal = object_normal;
			material_id =  object_material_id[NUM_SPHERES+i];
		}
	}
	#endif

	// Check for intersection with each cylinder
	#if NUM_CYLINDERS != 0 // only run if there are cylinders in the scene
	for(int i = 0; i < NUM_CYLINDERS; i++) {
		bool b_col = ray_cylinder_intersection(
			ray_origin, 
			ray_direction,
			cylinders[i], 
			object_distance, 
			object_normal
		);

		// choose this collision if its closer than the previous one
		if (b_col && object_distance < col_distance) {
			col_distance = object_distance;
			col_normal = object_normal;
			material_id =  object_material_id[NUM_SPHERES+NUM_PLANES+i];
		}
	}
	#endif

	// Check for intersection with each triangle
	#if NUM_TRIANGLES != 0 // only run if there are triangles in the scene
	if( ray_AABB_filter(ray_origin, ray_direction, mesh_extent) ) {
		for(int i = 0; i < NUM_TRIANGLES; i++) {
			bool b_col = ray_triangle_intersection(
				ray_origin, 
				ray_direction,
				triangles[i],
				object_distance, 
				object_normal
			);

			// choose this collision if its closer than the previous one
			if (b_col && object_distance < col_distance) {
				col_distance = object_distance;
				col_normal = object_normal;
				material_id = object_material_id[NUM_SPHERES+NUM_PLANES+NUM_CYLINDERS+i];
			}
		}
	}
	#endif

	return col_distance < MAX_RANGE;
}

/*
	Return the color at an intersection point given a light and a material, exluding the contribution
	of potential reflected rays.
*/
vec3 lighting(
		vec3 object_point, vec3 object_normal, vec3 direction_to_camera, 
		Light light, Material mat) {

	/** TODO 2.1: 
	- compute the diffuse component
	- make sure that the light is located in the correct side of the object
	- compute the specular component 
	- make sure that the reflected light shines towards the camera
	- return the ouput color
	*/

	/** TODO 2.2: 
	- shoot a shadow ray from the intersection point to the light
	- check whether it intersects an object from the scene
	- update the lighting accordingly
	*/

	return vec3(0.);
}

/*
	Get the material corresponding to mat_id from the list of materials.
*/
Material get_mat2(int mat_id) {
	Material m = materials[0];
	for(int mi = 1; mi < NUM_MATERIALS; mi++) {
		if(mi == mat_id) {
			m = materials[mi];
		}
	}
	return m;
}

void main() {


	vec3 ray_origin = v2f_ray_origin;
	vec3 ray_direction = normalize(v2f_ray_direction);

	vec3 pix_color = vec3(0.);

	/** TODO 2.1: 
	- check whether the ray intersects an object in the scene
	- if it does, compute the ambient contribution to the total intensity
	- compute the intensity contribution from each light in the scene and store the sum in pix_color
	*/

	/** TODO 2.3.2: 
	- create an outer loop on the number of reflections (see below for a suggested structure)
	- compute lighting with the current ray (might be reflected)
	- use the above formula for blending the current pixel color with the reflected one
	- update ray origin and direction

	We suggest you structure your code in the following way:

	vec3 pix_color          = vec3(0.);
	float reflection_weight = ...;

	for(int i_reflection = 0; i_reflection < NUM_REFLECTIONS+1; i_reflection++) {
		float col_distance;
		vec3 col_normal = vec3(0.);
		int mat_id      = 0;

		...

		Material m = get_mat2(mat_id); // get material of the intersected object

		ray_origin        = ...;
		ray_direction     = ...;
		reflection_weight = ...;
	}
	*/

	float col_distance;
	vec3 col_normal = vec3(0.);
	int mat_id      = 0;
	ray_intersection(ray_origin, ray_direction, col_distance, col_normal, mat_id);

	gl_FragColor = vec4(0.5+0.5*col_normal, 1.);
	//gl_FragColor *= sin(5.*col_distance);
}
