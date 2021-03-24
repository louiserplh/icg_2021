precision highp float;

#define MAX_RANGE 1e6
//#define NUM_REFLECTIONS
//#define F_VISUALIZE_AABB

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
//#define NUM_MESHES
//#define FLAT_SHADING_STRATEGY
//#define PHONG_SHADING_STRATEGY

#if defined PHONG_SHADING_STRATEGY
struct Triangle {
	mat3 vertices;
 	mat3 vertex_normals;
};
#else
struct Triangle {
	mat3 vertices;
};
#endif

struct AABB {
	vec3 corner_min;
	vec3 corner_max;
};
#if NUM_TRIANGLES != 0
//uniform Triangle triangles[NUM_TRIANGLES];
uniform AABB mesh_extent;
uniform sampler2D mesh_vert_pos_normals;
uniform int mesh_material_id;
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
uniform int object_material_id[NUM_SPHERES+NUM_PLANES+NUM_CYLINDERS+NUM_MESHES];
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

// our code ->
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
}// <- our code

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

	if (abs(normal_dot_direction) < 1e-12) {
		// The plane and the ray are orthogonal
		return false;
	}else{
		t = dot(plane_normal, plane_center-ray_origin) / normal_dot_direction;
		normal = normal_dot_direction > 0. ?  -plane_normal : plane_normal;
		return (t > 0.);
	}
	// <- our code
}

// our code ->
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
} // <- our code

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
	// our code ->
	vec2 t_candidates;
	if(ray_infinite_cylinder_intersection(ray_origin, ray_direction, cyl, t_candidates)){
		return ray_caps_cylinder_intersection(ray_origin, ray_direction, cyl, t_candidates, t, normal);
	}else{
		return false;
	} // <- our code
}


bool ray_AABB_filter(
	vec3 ray_origin, vec3 ray_direction, AABB aabb)
{
	/** TODO 3.3: 
	- construct the range of the ray parameter (`t`) values which are included in the bounding box
	- check that this range is non-empty
	- return whether the bounding box is intersected by the ray or not
	*/
	//intersection point = ray_origin + ray_direction * t;
	// computing range of t parameter where it intersect with faces of the cube
	float tx_min = (aabb.corner_min[0] - ray_origin[0]) / ray_direction[0];
	float tx_max = (aabb.corner_max[0] - ray_origin[0]) / ray_direction[0];
	float ty_min = (aabb.corner_min[1] - ray_origin[1]) / ray_direction[1];
	float ty_max = (aabb.corner_max[1] - ray_origin[1]) / ray_direction[1];
	float tz_min = (aabb.corner_min[2] - ray_origin[2]) / ray_direction[2];
	float tz_max = (aabb.corner_max[2] - ray_origin[2]) / ray_direction[2];
	float t_corner_min = max(tx_min, ty_min);
	float t_corner_max = min(tx_max, ty_max);
	return true;
	// check if ray intersect
	if ((tx_min > ty_max) || (ty_min > tx_max)){
        return false;
	}
	if ((t_corner_min > tz_max) || (t_corner_min > tz_max)){
        return false;
	}
	t_corner_min = max(tz_min, t_corner_min);
	t_corner_max = min(tz_max, t_corner_max);
	return true;
}


#if NUM_TRIANGLES != 0
Triangle get_triangle(int idx) {
	Triangle tri;

	// Texture is sampled in 0..1 coordinates
	float idx_norm = float(idx) / (float(NUM_TRIANGLES)-1.);

	tri.vertices[0] = texture2D(mesh_vert_pos_normals, vec2(0./5., idx_norm)).xyz;
	tri.vertices[1] = texture2D(mesh_vert_pos_normals, vec2(1./5., idx_norm)).xyz;
	tri.vertices[2] = texture2D(mesh_vert_pos_normals, vec2(2./5., idx_norm)).xyz;

	#ifdef PHONG_SHADING_STRATEGY
	tri.vertex_normals[0] = texture2D(mesh_vert_pos_normals, vec2(3./5., idx_norm)).xyz;
	tri.vertex_normals[1] = texture2D(mesh_vert_pos_normals, vec2(4./5., idx_norm)).xyz;
	tri.vertex_normals[2] = texture2D(mesh_vert_pos_normals, vec2(5./5., idx_norm)).xyz;
	#endif
	return tri;
}
#endif

/*
	Computes the determinant of a 3x3 matrix a
*/
float determinant(mat3 a) {
	float a00 = a[0][0];
	float a01 = a[0][1];
	float a02 = a[0][2];
	float a10 = a[1][0];
	float a11 = a[1][1];
	float a12 = a[1][2];
	float a20 = a[2][0];
	float a21 = a[2][1];
	float a22 = a[2][2];
  return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
}

/*
	Returns wether the 3x3 system
		ti*a+beta*b+gamma*c = d
	has solutions (in that case, returns barycentric coordinates and ti)
	(see https://en.wikipedia.org/wiki/Cramer's_rule)
*/
bool cramer_solve(
	vec3 a, vec3 b, vec3 c, vec3 d, out float ti, out float alpha,
	out float beta, out float gamma
){
	// see https://www.khronos.org/opengl/wiki/Data_Type_(GLSL)#Matrix_constructors 
	mat3 D = mat3(
		a,		// first column
		b,		// second colum
		c		// third column
	);

	// The system has no solutions if this det is nul
	float det_d = determinant(D);
	if(abs(det_d) < 1e-12){
		return false;
	}
	
	mat3 Dx = mat3(d,b,c);
	float det_x = determinant(Dx);

	mat3 Dy = mat3(a,d,c);
	float det_y = determinant(Dy);

	mat3 Dz = mat3(a,b,d);
	float det_z = determinant(Dz);

	ti = det_x / det_d;
	beta = det_y / det_d;
	gamma = det_z / det_d;	
	alpha = 1. - beta - gamma;

	return true;
}

bool ray_triangle_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		Triangle tri,
		out float t, out vec3 normal) 
{	
	/** TODO 3.2.1: 
	- compute the ray's first valid intersection with the triangle
	- check that the intersection occurs in front of the viewer: `t > 0`
	- store ray parameter in `t`
	- store normal at intersection_point in `normal`.
	- return whether there is an intersection with `t > 0`
	*/

	/** TODO 3.2.2: 
	- test which of `FLAT_SHADING_STRATEGY` or `PHONG_SHADING_STRATEGY` is defined
	- implement flat shading using the triangle normal you computed in task 3.2.1
	- implement Phong shading using the vertex normals stored in `tri.vertex_normals`
	Hint: vertex normals are stored in the same order as the vertex positions
	*/

	vec3 A = tri.vertices[0];
	vec3 B = tri.vertices[1];
	vec3 C = tri.vertices[2];

	t = MAX_RANGE + 10.;

	// we initialize our elements to invalid values to make sure not to use them
	float ti = -1.;
	float alpha = -1.;
	float beta = -1.;
	float gamma = -1.;

	// we want to solve the system :
	// (o-A)=ti*(-d)+beta*(B-A)+gamma*(C-A)
	vec3 d = ray_origin - A;
	vec3 a = - ray_direction;
	vec3 b = B - A;
	vec3 c = C - A;
	// there is intersection point only if the system has a solution
	cramer_solve(a, b, c, d, ti , alpha, beta, gamma);
	
	// we make sure to validate the conditions of barycentric coordinates
	if(ti > 0. && ti < MAX_RANGE 
	&& alpha >= 0.-1e-12 && beta >= 0.-1e-12 && gamma >= 0.-1e-12
	&& alpha <= 1.+1e-12 && beta <= 1.+1e-12 && gamma <= 1.+1e-12){
		t = ti;

		#ifdef FLAT_SHADING_STRATEGY
		// the code for flat shading
		// a normal to the triangle is normal to both its edges
		vec3 normal_to_triangle = cross(B-A, C-A);
		if(dot(normal_to_triangle, ray_direction) > 0.){
			normal_to_triangle = -normal_to_triangle;
		}
		normal = normalize(normal_to_triangle);
		#endif
		
		#ifdef PHONG_SHADING_STRATEGY
		// the code for Phong shading
		vec3 n_A = tri.vertex_normals[0];
		vec3 n_B = tri.vertex_normals[1];
		vec3 n_C = tri.vertex_normals[2];
		vec3 n_X = alpha*n_A + beta*n_B + gamma*n_C;
		if(dot(n_X, ray_direction) > 0.){
			n_X = -n_X;
		}
		normal = normalize(n_X);
		#endif

		return true;
	}else {

		return false;
	}
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
	// if (true){
		for(int i = 0; i < NUM_TRIANGLES; i++) {
			bool b_col = ray_triangle_intersection(
				ray_origin, 
				ray_direction,
				get_triangle(i),
				object_distance, 
				object_normal
			);

			// choose this collision if its closer than the previous one
			if (b_col && object_distance < col_distance) {
				col_distance = object_distance;
				col_normal = object_normal;
				// there is only one mesh, and it has the last entry in the array
				material_id = object_material_id[NUM_SPHERES+NUM_PLANES+NUM_CYLINDERS];
				//material_id = mesh_material_id;
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

	// our code ->
	// initializes l (toward light), r (perfect reflection) vectors, v (toward camera) vectors
	vec3 l = normalize(light.position - object_point);
	vec3 r = normalize(reflect(-l, object_normal)); //normalize(2.*object_normal*dot(object_normal, l) - l);
	vec3 v = normalize(direction_to_camera);
	
	// the total light RGB value at the object_point in space
	vec3 intersection_color = vec3(0.);

	// diffuse iff in that case (slide 17)
	if(dot(object_normal, l)>0.){
		// diffuse component computation to total color
		vec3 md = mat.color * mat.diffuse;
		intersection_color += md * (dot(object_normal,l));
	}

	// specular iff in that case (slide 23)
	if(dot(object_normal, l)>0. && dot(r,v)>0.){
		// specular component
		vec3 ms = mat.color * mat.specular;
		vec3 specular = ms * (pow(dot(r, v), mat.shininess));
		intersection_color += specular;
	}
	
	/** TODO 2.2: 
	- shoot a shadow ray from the intersection point to the light
	- check whether it intersects an object from the scene	
	- update the lighting accordingly
	*/
	// ray collision's distance and normal
	float col_distance;
	vec3 col_normal;
	// id of hit material
	int material_id = 0;
	if (ray_intersection(object_point + l*1e-4, l, col_distance, col_normal, material_id) && col_distance < norm(light.position-object_point)){
		return vec3(0.);
	}

	// return the total ambiant and specular contribution of this light ray in RGB (component-wise product)
	return light.color * intersection_color;
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
	// -> our code
	vec3 pix_color = vec3(0.);
	float reflection_weight = 1.;

	for(int i_reflection = 0; i_reflection < NUM_REFLECTIONS+1; i_reflection++) {
		// ray collision's distance and normal
		float col_distance;
		vec3 col_normal = vec3(0.);
		// id of hit material
		int material_id = 0;

		// computes where an intersection happens (if there is one)
		if (ray_intersection(ray_origin, ray_direction, col_distance, col_normal, material_id)){
			Material mat = get_mat2(material_id);
			vec3 collision_point = ray_origin + col_distance*ray_direction;

			// computes ambiant light contribution
			vec3 ma = mat.color * mat.ambient;
			vec3 c_i = light_color_ambient * ma;

			#if NUM_LIGHTS != 0
				// computes diffuse, specular and shadow contribution for each light source
				for(int i = 0; i < NUM_LIGHTS; ++i){
					c_i += lighting(collision_point, col_normal, -ray_direction, lights[i], mat);
				}
			#endif

			// Implements theory (see TheoryExercice.pdf)
			pix_color += (1.-mat.mirror)*reflection_weight*c_i;
			reflection_weight *= mat.mirror;
			ray_direction = normalize(reflect(ray_direction, col_normal));
			ray_origin = collision_point + 1e-4*ray_direction;
		}
	}
	gl_FragColor = vec4(pix_color, 1.);

	// <- our code

	/*pix_color = 0.5+0.5*col_normal;
	#if defined F_VISUALIZE_AABB && (NUM_TRIANGLES != 0)
	if(ray_in_AABB) {
		pix_color = 1. - pix_color;
	}
	#endif
	gl_FragColor = vec4(pix_color, 1.);
	//gl_FragColor *= sin(5.*col_distance);*/
}