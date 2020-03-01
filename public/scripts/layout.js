let links = document.querySelector("nav.links");
let settingsOverlay = document.querySelector("#settingsOverlay")

window.addEventListener('beforeinstallprompt', (event) => {
	console.log('👍', 'beforeinstallprompt', event);
	window.deferredPrompt = event;
});

window.addEventListener('appinstalled', (event) => {
	console.log('👍', 'appinstalled', event);
});

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/service-worker.js')
}

let cookie = document.cookie.split(";").filter(cookie => {
	return cookie.trim().indexOf('darkmode=') !== -1
})

let darkmode = cookie.length > 0 && cookie[0].split("=")[1] == 1 ? true : false;

if (darkmode) document.body.classList.add("dark")

let toggleTheme = () => {
	darkmode = !darkmode
	document.cookie = `darkmode=${darkmode ? 1 : 0}`
	document.body.classList.toggle("dark")
	if (document.location.href.endsWith('.tk/')) ping();
}

let installPWA = () => {
	const promptEvent = window.deferredPrompt;
	console.log("Install clicked", promptEvent)
	if (!promptEvent) return;

	promptEvent.prompt();

	promptEvent.userChoice.then((result) => {
		console.log('👍', 'userChoice', result);
		window.deferredPrompt = null;
	});
}

let toggleSettings = () => {
	settingsOverlay.classList.toggle("shown")
}

let saveSettings = () => {
	toggleSettings()
}