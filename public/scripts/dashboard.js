let canvases = [];

let drawGraph = (canvas, multiplier) => {
	let context = canvas.getContext('2d');
	let { width, height } = canvas;

	context.clearRect(0, 0, width, height)

	context.translate(width / 2, height * 2 / 3);

	context.save();
	context.fillStyle = "#88888844"
	context.beginPath()
	context.arc(0, 0, width / 3, (Math.PI / 8), (-Math.PI - (Math.PI / 8)), true)
	context.arc(0, 0, width / 2, (-Math.PI - (Math.PI / 8)), (Math.PI / 8), false)
	context.fill()

	context.fillStyle = multiplier < 80 ?
		"#34d058" :
		multiplier < 90 ? "#ffdf5d" :
			"#ea4a5a";
	context.beginPath()
	context.arc(0, 0, width / 3, (Math.PI / 8), ((-Math.PI - (Math.PI / 4)) * multiplier / 100) + (Math.PI / 8), true)
	context.arc(0, 0, width / 2, ((-Math.PI - (Math.PI / 4)) * multiplier / 100) + (Math.PI / 8), (Math.PI / 8), false)
	context.fill();
	context.restore()

	context.translate(-width / 2, -height * 2 / 3);
}

let drawRAMUsage = (container, canvas, RAM) => {
	let { total, available } = RAM;
	let percentage = (100 * (total - available) / total).toFixed(2);
	container.querySelector(".ramUsage").innerHTML = `${percentage} %`
	drawGraph(canvas, percentage)
}

let drawCPUUsage = (container, canvas, temp) => {
	container.querySelector(".cpuTemp").innerHTML = `${temp}°C`
	drawGraph(canvas, temp)
}

let drawHarddriveUsage = (canvas, harddrive) => drawGraph(canvas, harddrive.use)

let ping = async () => {
	let resp = await fetch('/hwinfo')
	let json = await resp.json();

	for (let canvas of document.querySelectorAll("canvas")) {
		let container = canvas.parentElement.parentElement;
		canvas.width = 2 * canvas.clientWidth
		canvas.height = 2 * canvas.clientHeight
		if (container.classList.contains("harddrive")) {
			let harddrive = json.harddrives.filter(h => h.index == container.id.substring(container.id.length - 1))[0]
			if (harddrive) drawHarddriveUsage(canvas, harddrive)
		} else if (container.classList.contains("cpu")) {
			let { cpuTemp } = json;
			drawCPUUsage(container, canvas, cpuTemp)
		} else if (container.classList.contains("ram")) {
			drawRAMUsage(container, canvas, json.memUsage)
		}
	}

}

ping()
setInterval(ping, 30 * 1000)