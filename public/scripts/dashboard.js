let canvases = [];

let drawRAMUsage = (canvas, percentage) => {
	let context = canvas.getContext('2d');
	let { width, height } = canvas;

	context.clearRect(0, 0, width, height)

	context.translate(width / 2, height * 2 / 3);

	context.save();
	context.fillStyle = document.body.classList.contains("dark") ? "#FFFFFF22" : "#00000022"
	context.beginPath()
	context.arc(0, 0, width / 3, 0.5, -Math.PI - 0.5, true)
	context.arc(0, 0, width / 2, -Math.PI - 0.5, 0.5, false)
	context.fill()
	context.restore()

	context.save();
	context.beginPath()
	context.fillStyle = "#34d058"
	context.arc(0, 0, width / 3, 0.5, (-Math.PI - 0.5) * (percentage / 100), true)
	context.arc(0, 0, width / 2, (-Math.PI - 0.5) * (percentage / 100), 0.5, false)
	context.fill();
	context.restore()
	context.translate(-width / 2, -height * 2 / 3);
}

let drawCPUUsage = (canvas, temp) => {
	let context = canvas.getContext('2d');
	let { width, height } = canvas;

	context.clearRect(0, 0, width, height)

	context.translate(width / 2, height * 2 / 3);

	context.save();
	context.fillStyle = document.body.classList.contains("dark") ? "#FFFFFF22" : "#00000022"
	context.beginPath()
	context.arc(0, 0, width / 3, 0.5, -Math.PI - 0.5, true)
	context.arc(0, 0, width / 2, -Math.PI - 0.5, 0.5, false)
	context.fill()
	context.restore()

	context.save();
	context.beginPath()
	context.fillStyle = "#34d058"
	context.arc(0, 0, width / 3, 0.5, (-Math.PI - 0.5) * (temp / 100), true)
	context.arc(0, 0, width / 2, (-Math.PI - 0.5) * (temp / 100), 0.5, false)
	context.fill();
	context.restore()
	context.translate(-width / 2, -height * 2 / 3);
}

let drawHarddriveUsage = (canvas, harddrive) => {
	let context = canvas.getContext('2d');
	let { width, height } = canvas;

	context.clearRect(0, 0, width, height)

	context.translate(width / 2, height * 2 / 3);

	context.save();
	context.fillStyle = document.body.classList.contains("dark") ? "#FFFFFF22" : "#00000022"
	context.beginPath()
	context.arc(0, 0, width / 3, 0.5, -Math.PI - 0.5, true)
	context.arc(0, 0, width / 2, -Math.PI - 0.5, 0.5, false)
	context.fill()
	context.restore()

	context.save();
	context.beginPath()
	context.fillStyle = "#34d058"
	context.arc(0, 0, width / 3, 0.5, (-Math.PI - 0.5) * (harddrive.use / 100), true)
	context.arc(0, 0, width / 2, (-Math.PI - 0.5) * harddrive.use / 100, 0.5, false)
	context.fill();
	context.restore()
	context.translate(-width / 2, -height * 2 / 3);
}

let init = async () => {
	let resp = await fetch('/hwinfo')
	let json = await resp.json();

	console.log(json)

	for (let canvas of document.querySelectorAll("canvas")) {
		let container = canvas.parentElement.parentElement;
		canvas.width = 2 * canvas.clientWidth
		canvas.height = 2 * canvas.clientHeight
		if (container.classList.contains("harddrive")) {
			let harddrive = json.harddrives.filter(h => h.index == container.id.substring(container.id.length - 1))[0]
			drawHarddriveUsage(canvas, harddrive)
		} else if (container.classList.contains("cpu")) {
			let { cpuTemp } = json;
			container.querySelector(".cpuTemp").innerHTML = `${cpuTemp}°C`
			drawCPUUsage(canvas, cpuTemp)
		} else if (container.classList.contains("ram")) {
			let { total, available } = json.memUsage;
			let percentage = (100 * (total - available) / total).toFixed(2);
			container.querySelector(".ramUsage").innerHTML = `${percentage} %`
			drawRAMUsage(canvas, percentage)
		}
	}

}

init()
setInterval(init, 30 * 1000)