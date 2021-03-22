import * as vec3 from "../lib/gl-matrix_3.3.0/esm/vec3.js"

function get_vert(mesh, vert_id) {

    const offset = vert_id*3
    const scaled_vertex = mesh.tris.vertices.slice(offset, offset+3).map(function(x) {return mesh.scale*x;})
    return vec3.add([0., 0., 0.], scaled_vertex, mesh.offset)
}

export function compute_triangle_normals_and_angle_weights(mesh) {

    /** TODO 3.1.1: 
	- compute the normal vector to each triangle in the mesh
    - push it into the array `tri_normals`
    - compute the angle weights for vert1, vert2, then vert3 and store it into an array [w1, w2, w3]
    - push this array into `angle_weights`

    Hint: you can use `vec3` specific methods such as `normalize()`, `add()`, `cross()`, `angle()`, or `subtract()`.
          The absolute value of a float is given by `Math.abs()`.
	*/

	const num_faces     = (mesh.tris.indices.length / 3) | 0
    const tri_normals   = []
    const angle_weights = []
    for(let i_face = 0; i_face < num_faces; i_face++) {
        // our code ->
        const a = get_vert(mesh, mesh.tris.indices[3*i_face + 0])
        const b = get_vert(mesh, mesh.tris.indices[3*i_face + 1])
        const c = get_vert(mesh, mesh.tris.indices[3*i_face + 2])

        let b_a = vec3.zero
        let c_a = vec3.zero
        let c_b = vec3.zero
        vec3.subtract(b_a, b, a)
        vec3.subtract(c_a, c, a)
        vec3.subtract(c_b, c, b)

        let cross = vec3.zero
        vec3.cross(cross, b_a, c_a)
        let normalized_cross = vec3.zero
        vec3.normalize(normalized_cross, cross)

        let angle1 = Math.abs(vec3.angle(b_a, c_a))
        let angle2 = Math.abs(vec3.angle(b_a, c_b))
        let angle3 = Math.abs(vec3.angle(c_a, c_b))
        
        tri_normals.push([normalized_cross[0], normalized_cross[1], normalized_cross[2]])
        angle_weights.push([angle1, angle2, angle3])
        // <- our code
    }
    return [tri_normals, angle_weights]
}

export function compute_vertex_normals(mesh, tri_normals, angle_weights) {

    /** TODO 3.1.2: 
	- go through the triangles in the mesh
    - add the contribution of the current triangle to its vertices' normal
    - normalize the obtained vertex normals
	*/

	const num_faces    = (mesh.tris.indices.length / 3) | 0
    const num_vertices = (mesh.tris.vertices.length / 3) | 0
    let vertex_normals = Array(num_vertices).fill([0., 0., 0.])

    for(let i_face = 0; i_face < num_faces; i_face++) {
        const iv1 = mesh.tris.indices[3*i_face + 0]
        const iv2 = mesh.tris.indices[3*i_face + 1]
        const iv3 = mesh.tris.indices[3*i_face + 2]

        // Add your code for adding the contribution of the current triangle to its vertices' normals
        // -> our code

        const a_w_1 = angle_weights[iv1]
        const a_w_2 = angle_weights[iv2]
        const a_w_3 = angle_weights[iv2]

        vertex_normals[iv1] += tri_normals[i_face]*a_w_1
        vertex_normals[iv2] += tri_normals[i_face]*a_w_2
        vertex_normals[iv3] += tri_normals[i_face]*a_w_3

        // <- our code
    }

    for(let i_vertex = 0; i_vertex < num_vertices; i_vertex++) {
        // Normalize the vertices

        // -> our code
        vertex_normals[i_vertex] = vec3.normalize([0.,0.,0.], vertex_normals[i_vertex])
        // <- our code
    }

    return vertex_normals
}