// Dans le dossier BACKEND
// 1 : Installer NodeJS 
// 2 : Installer les packages dans Backend ( npm install )
// 3 : npm run start -> Faut le démarrer à chaque fois que tu veut utiliser l'API (BACKEND) pour que ça fonctionne

// Permet d'avoir une API qui fonctionne en local sur le port 3000

// ETAPE 1 : On vérifie que le formulaire html et le JS sont bien reliés (console.log)
console.log("Le formulaire est relié au JS")

// ETAPE 2 : On écoute l'évènement de soumission du formulaire
// 2.1 : On à créer une const (variable) pour cibler le formulaire dans le DOM
const form = document.getElementById("login-form")
const inputEmail = document.getElementById("email")
const inputPassword = document.getElementById("password")
console.log(form)

// 2.2 : On crée un écouteur d'évènement sur le formulaire pour écouter la soumission du formulaire
form.addEventListener("submit", event => {
    // On empêche le comportement par défaut du formulaire (rechargement de la page)
    event.preventDefault()

    // On créer une const typé pour l'API qui contient les données du formulaire
    const objectJsonLogin = {
        email: inputEmail.value, // toto@toto.fr
        password: inputPassword.value, // 12345678
    }

    // On transforme l'objet en JSON pour pouvoir l'envoyer à l'API
    const bodyRequete = JSON.stringify(objectJsonLogin)

    // On envoi la requete à l'API (BACKEND) pour vérifier les données du formulaire
    fetch("http://localhost:5678/api/users/login", {
        method: "POST", // Par défaut si pas de méthode = GET
        headers: { "Content-Type": "application/json" },
        body: bodyRequete,
    }).then(response => {
        if (response.ok) { // SI OK (20*) https://developer.mozilla.org/fr/docs/Web/HTTP/Reference/Status
            return response.json()
        } else {
            console.log("erreur de connexion")
        }
    }).then(({ token }) => { // On récupère le token de l'API (BACKEND) et on le stocke dans le localStorage du navigateur
        window.localStorage.setItem("token", token)
        window.location.href = "../../index.html"
    }).catch(() => {  // En cas d'erreur (ex: serveur éteint, mauvaise adresse, etc ...)
        console.error("Connexion impossible")
    })
})
