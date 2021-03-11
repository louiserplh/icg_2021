
import {load_text} from "./icg_web.js"
import {Mesh} from "../lib/webgl-obj-loader_2.0.8/webgl-obj-loader.module.js"

export async function load_mesh_obj(url) {
	const file_content = await load_text(url)
	const mesh_parsed = new Mesh(file_content)

	return mesh_parsed
}

