
function scene_choser(elem, rt, initial_scene) {

	const buttons = {}

	function update() {
		Object.values(buttons).forEach((item) => {
			item.classList.remove('selected')
		})
		if (rt.scene_name) {
			buttons[rt.scene_name].classList.add('selected')

			document.location.hash = rt.scene_name
		}
	}

	function set_scene(sc_name) {
		if(sc_name != rt.scene_name) {
			rt.draw_scene({scene_name: sc_name})
			update()
		}
	}

	function set_scene_from_url() {
		const url_hash = document.location.hash
		
		if(url_hash !== "") {
			const sc_from_url = url_hash.substr(1)
			if( buttons.hasOwnProperty(sc_from_url)) {
				set_scene(sc_from_url)
				return sc_from_url
			}	
		}
		return false
	}

	window.addEventListener('popstate', set_scene_from_url)

	rt.get_scene_names().forEach((scn) => {
		const item = document.createElement('li')
		item.textContent = scn
		item.addEventListener('click', () => set_scene(scn))
		elem.appendChild(item)
		buttons[scn] = item
	})

	if(! set_scene_from_url() ) {
		set_scene(initial_scene)
	}
}

function reflection_choser(elem, rt) {

	const buttons = []

	function update() {
		Object.values(buttons).forEach((item) => {
			item.classList.remove('selected')
		})
		buttons[rt.num_reflections].classList.add('selected')
	}

	function set_num_reflections(num_reflections) {
		if(num_reflections >= 0 && num_reflections != rt.num_reflections) {
			rt.draw_scene({
				scene_name: rt.scene_name,
				num_reflections: num_reflections,
			})
			update()
		}
	}

	const available_num_reflections = [0, 1, 2, 3, 4]

	available_num_reflections.forEach((nr) => {
		const item = document.createElement('li')
		item.textContent = nr.toFixed(0)
		item.addEventListener('click', () => set_num_reflections(nr))
		elem.appendChild(item)
		buttons[nr] = item
	})

	console.log(buttons)
	
	update()
}


export function init_menu(rt, initial_scene) {
	const elem_scenes = document.querySelector('#menu-scenes')
	scene_choser(elem_scenes, rt, initial_scene)

	const elem_reflections = document.querySelector('#menu-reflections')
	reflection_choser(elem_reflections, rt)
}
