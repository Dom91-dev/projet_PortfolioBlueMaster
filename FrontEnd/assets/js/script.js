// ETAPE 1 : On vérifie que le formulaire html et le JS sont bien reliés (console.log)
console.log("Le formulaire est relié au JS")


// Par rapport à la maquette je dois être capable d'afficher les catégories des works présent dans l'api (BACKEND)

// 1 : Appeler l'api pour récupérer les données des works

    fetch("http://localhost:5678/api/works")
        .then(response => response.json())
        .then(data => {
            console.log(data)
        


// 1 : Appeler l'api en GET pour récupérer les données des works;
// 1b : Vérifier que les données sont bien récupérées (console.log)
// 1c : Traiter les données pour n'afficher que les catégories (ex: "Objets, 'Appartements' etc ..)
const categories = data.map(Work=> Work.category.name)
const uniqueCategories = [...new Set(categories)]
console.log("#portfolio", uniqueCategories)

// 1d : Une fois les données récupérées, je dois les afficher dans le DOM
const container =document.querySelector("#portfolio")
uniqueCategories.forEach(category=>{
    const button = document.createElement("button")
    button.textContent = category
    container.appendChild(button)
})

        })
