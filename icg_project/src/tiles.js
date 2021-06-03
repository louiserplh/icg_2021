import { vec3, mat3, mat4 } from '../lib/gl-matrix_3.3.0/esm/index.js';
import { mat4_matmul_many } from './icg_math.js';

const PIPELINE_CACHE = {};

/*
Caches pipelines by name.
`key` - name of the current pipeline
`construction_func` - function to construct the given pipeline if not found in cache
*/
function cached_pipeline(key, construction_func) {
  if (!PIPELINE_CACHE.hasOwnProperty(key)) {
    try {
      PIPELINE_CACHE[key] = construction_func();
    } catch (e) {
      console.error('Error in construction of pipeline', key, e);
    }
  }
  return PIPELINE_CACHE[key];
}

class Actor {
  init_pipeline(regl, resources) {
    throw Error('Not implemented: Actor.init_pipeline');
  }

  constructor({}, regl, resources) {
    this.mat_model_to_world = mat4.create();
    this.mat_mvp = mat4.create();

    this.init_pipeline(regl, resources);
  }

  calculate_model_matrix(sim_time) {
    throw Error('Not implemented: Actor.calculate_model_matrix');
  }

  draw({ mat_projection, mat_view, light_position_cam, sim_time }) {
    throw Error('Not implemented: Actor.draw');
  }
}

export class UnshadedTileActor extends Actor {
  init_pipeline(regl, resources) {
    throw Error('Not implemented: UnshadedTileActor.init_pipeline, we shade here');
  }

  constructor({ name, texture, size, x, y, z, ...rest }, regl, resources) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Unpacking_fields_from_objects_passed_as_function_parameter

    super(rest, regl, resources);

    this.name = name;
    this.texture = texture;
    this.size = size;
    // Those are coordinates on our grid (10 length squares in world coord)
    this.x = x;
    this.y = y;
    this.z = z;
  }

  calculate_model_matrix({ sim_time }) {
    /*
		Construct the model matrix for the current planet and store it in this.mat_model_to_world.
		
		Scale the unit sphere to match the desired size
			scale = this.size
			mat4.fromScaling takes a 3D vector!
		*/
    let scale = this.size;
    let sizeMat = mat4.fromScaling(mat4.create(), [scale, scale, scale]);
    // Matrix to shift the tile on its coordinate (and put it above the ground). Each tile is 32px large, long and high. 1 length unit is 10px observed
    let placingMatrix = mat4.fromTranslation(
      mat4.create(),
      vec3.fromValues(3.2 * this.x, 3.2 * this.z, 3.2 * this.y)
    );
    // Rotate the tile to avoid put it on its default rotation
    let rotateMatrixX = mat4.fromXRotation(mat4.create(), Math.PI / 2);
    let rotateMatrixY = mat4.fromYRotation(mat4.create(), Math.PI / 2);
    const rotateMatrix = mat4_matmul_many(mat4.create(), rotateMatrixX, rotateMatrixY);

    // Store the combined transform in this.mat_model_to_world
    mat4_matmul_many(this.mat_model_to_world, sizeMat, rotateMatrix, placingMatrix);
  }

  draw({ mat_projection, mat_view }) {
    throw Error('Not implemented: UnshadedTileActor.draw');
  }
}

export class PhongTileActor extends UnshadedTileActor {
  init_pipeline(regl, resources) {
    throw Error('Not implemented: PhongTileActor.init_pipeline, we only load meshes');
  }

  constructor(cfg, regl, resources) {
    super(cfg, regl, resources);

    this.mat_model_view = mat4.create();
    this.mat_normals = mat3.create();

    this.shininess = cfg.shininess;
    this.ambient = cfg.ambient;
  }

  // init_pipeline(regl, resources) {
  // 	this.pipeline = PhongActor.build_pipeline(regl, resources);
  // }

  draw({ mat_projection, mat_view, light_position_cam, sim_time }) {
    // Calculate this.mat_model_view, this.mat_mvp
    // We follow the MVP pipeline (lecture 5.d, slide 4)
    mat4_matmul_many(this.mat_model_view, mat_view, this.mat_model_to_world);
    mat4_matmul_many(this.mat_mvp, mat_projection, this.mat_model_view);

    mat3.fromMat4(this.mat_normals, this.mat_model_view);
    mat3.transpose(this.mat_normals, this.mat_normals);
    mat3.invert(this.mat_normals, this.mat_normals);

    this.pipeline({
      mat_mvp: this.mat_mvp,
      mat_model_view: this.mat_model_view,
      mat_normals: this.mat_normals,

      tex_base_color: this.texture,

      light_position: light_position_cam,

      shininess: this.shininess,
      ambient: this.ambient,
      light_color: this.light_color,

      sim_time: sim_time, // this uniform will be used for earth shader
    });
  }
}

export class MeshTileActor extends PhongTileActor {
  init_pipeline(regl, resources) {
    // create pipeline only if it doesn't exist
    // if pipeline not found under that key, the arrow-function is used to create it
    this.pipeline = cached_pipeline('phong_mesh', () =>
      regl({
        // Vertex attributes
        attributes: {
          position: (ctx, { mesh }) => mesh.vertex_positions,
          tex_coord: (ctx, { mesh }) => mesh.vertex_tex_coords,
          normal: (ctx, { mesh }) => mesh.vertex_normals,
        },
        // Faces, as triplets of vertex indices
        elements: (ctx, { mesh }) => mesh.faces,

        // Uniforms: global data available to the shader
        uniforms: {
          mat_mvp: regl.prop('mat_mvp'),
          mat_model_view: regl.prop('mat_model_view'),
          mat_normals: regl.prop('mat_normals'),

          light_position: regl.prop('light_position'),
          texture_base_color: regl.prop('tex_base_color'),

          shininess: regl.prop('shininess'),
          ambient: regl.prop('ambient'),
          light_color: regl.prop('light_color'),
        },

        vert: resources.shader_phong_vert,
        frag: resources.shader_phong_frag,
      })
    );
  }

  constructor(cfg, regl, resources) {
    super(cfg, regl, resources);

    this.mesh = cfg.mesh;

    const pipeline_without_mesh = this.pipeline;
    this.pipeline = (props) => {
      pipeline_without_mesh(Object.assign({ mesh: this.mesh }, props));
    };
  }
}
