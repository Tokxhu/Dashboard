let loginButton = document.getElementById("loginButton")
let passwordInput = document.getElementById("passwordInput")
let errorContainer = document.querySelector("div.errors")
let errorText = document.querySelector("div.login h2")

let login = async () => {
	try {
		let resp = await fetch('/login', {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				password: passwordInput.value
			})
		})
		let text = await resp.text();
		if (!resp.ok) throw new Error(text)

		document.location.href = '/'
	} catch (err) {
		errorText.innerHTML = err.message;
		errorContainer.classList.add('shown')
	}
}

document.onkeydown = (e) => {
	if (e.key === "Enter") login()
}

loginButton.onclick = login