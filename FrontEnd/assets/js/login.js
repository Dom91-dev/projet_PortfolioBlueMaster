


console.log("Le formulaire est relié au JS")

//  On écoute l'évènement de soumission du formulaire
const form = document.getElementById("login-form")
const inputEmail = document.getElementById("email")
const inputPassword = document.getElementById("password")
const emailError = document.getElementById("email-error")
const passwordError = document.getElementById("password-error")
const loginError = document.getElementById("login-error")
console.log(form)

// Fonction pour afficher les messages d'erreur
function showLoginError(field, message) {
	if (field === "email") {
		emailError.textContent = message
		emailError.style.display = message ? "block" : "none"
	} else if (field === "password") {
		passwordError.textContent = message
		passwordError.style.display = message ? "block" : "none"
	} else if (field === "general") {
		loginError.textContent = message
		loginError.style.display = message ? "block" : "none"
	}
}

// Fonction pour réinitialiser les erreurs
function clearLoginErrors() {
	emailError.textContent = ""
	passwordError.textContent = ""
	loginError.textContent = ""
	emailError.style.display = "none"
	passwordError.style.display = "none"
	loginError.style.display = "none"
}

// 2.2 : On crée un écouteur d'évènement sur le formulaire pour écouter la soumission du formulaire
form.addEventListener("submit", event => {

	event.preventDefault()
	clearLoginErrors()

	// Validation des champs
	if (!inputEmail.value.trim()) {
		showLoginError("email", "Veuillez entrer votre email.")
		return
	}
	if (!inputPassword.value) {
		showLoginError("password", "Veuillez entrer votre mot de passe.")
		return
	}

	// On créer une const typé pour l'API qui contient les données du formulaire
	const objectJsonLogin = {
		email: inputEmail.value, // toto@toto.fr
		password: inputPassword.value, // 12345678
	}

	
	const bodyRequete = JSON.stringify(objectJsonLogin)

	// On envoi la requete à l'API (BACKEND) pour vérifier les données du formulaire
	fetch("http://localhost:5678/api/users/login", {
		method: "POST", // Par défaut si pas de méthode = GET
		headers: { "Content-Type": "application/json" },
		body: bodyRequete,
	}).then(response => {
		if (response.ok) { 
			return response.json()
		} else {
			showLoginError("general", "Email ou mot de passe incorrect.")
			throw new Error ("Erreur l'ors de la connexion")
		}
	}).then(({ token }) => { 
		window.localStorage.setItem("token", token)
		window.location.href = "../../index.html"
	}).catch(() => {  
		console.error("Connexion impossible")
	})
})
