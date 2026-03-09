// ===== CONNEXION DU SCRIPT =====
// On vérifie dans la console que le fichier JS est bien chargé par le HTML
console.log("Le formulaire est relié au JS");

// On récupère les éléments du DOM où on injectera les filtres et les projets
const divFilters = document.querySelector(".filters");
const divProjects = document.querySelector(".gallery");

// ===== APPEL API =====
// On utilise fetch() pour récupérer les works depuis l'API (requête GET par défaut)
// Le try/catch permet de gérer les erreurs réseau ou JS
try {
  fetch("http://localhost:5678/api/works")
    // fetch renvoie une Promise → .then() s'exécute quand la réponse arrive
    .then((response) => {
      // On vérifie que le serveur a bien répondu (status 200-299)
      if (response.ok === false) {
        throw new Error("Erreur de la requête HTTP");
      }
      // On convertit la réponse en JSON (c'est aussi une Promise)
      return response.json();
    })
    .then((works) => {
      // "works" est maintenant un tableau d'objets JS exploitable

      // ===== GÉNÉRATION DES FILTRES =====
      // Un Set ne stocke que des valeurs uniques → pas de doublons de catégories
      const categoryName = new Set();
      works.forEach((work) => {
        categoryName.add(work.category.name);
      });

      // On convertit le Set en tableau pour pouvoir le parcourir facilement
      const tableCategories = Array.from(categoryName);

      // On construit le HTML des boutons filtres
      let filterHTML = "";

      // Bouton "Tous" : son id contient TOUTES les catégories (séparées par des virgules)
      // Astuce : quand on fera un split(",") dessus, on récupèrera toutes les catégories
      filterHTML = `<button id="${tableCategories}" class="btn-filter">Tous</button>`;

      // Un bouton par catégorie, avec son nom en id ET en texte affiché
      tableCategories.forEach((filter) => {
        filterHTML += `
          <button id="${filter}" class="btn-filter">${filter}</button>
        `;
      });

      // On injecte tous les boutons dans le DOM
      divFilters.innerHTML = filterHTML;

      // ===== LOGIQUE DE FILTRAGE =====
      // On sélectionne tous les boutons qu'on vient de créer
      const btnFilters = document.querySelectorAll(".btn-filter");

      btnFilters.forEach((filter) => {
        filter.addEventListener("click", () => {
          // On retire la classe "selected" de TOUS les boutons...
          btnFilters.forEach((btn) => {
            btn.classList.remove("filter-selected");
          });
          // ...puis on l'ajoute uniquement au bouton cliqué (highlight visuel)
          filter.classList.add("filter-selected");

          // On récupère l'id du bouton cliqué
          // Pour "Tous" → id = "Objets,Appartements,Hotels,..." → split donne un tableau de toutes les catégories
          // Pour un filtre simple → id = "Objets" → split donne ["Objets"]
          const id = filter.id;
          const categories = id.split(",");

          // On filtre le tableau works : on ne garde que ceux dont la catégorie est dans notre liste
          const projectfilters = works.filter((work) =>
            categories.includes(work.category.name)
          );

          // On construit le HTML pour la galerie principale et pour la modale
          let projectfiltersHTML = "";
          let projectModalHTML = "";

          projectfilters.forEach((data) => {
            // Carte projet pour la page principale (figure + image + légende)
            projectfiltersHTML += `
              <figure data-id="${data.id}" class="fig-project">
                <img src="${data.imageUrl}" alt="${data.title}">
                <figcaption>${data.title}</figcaption>
              </figure>
            `;
            // Carte projet pour la modale d'admin (image + icône poubelle pour suppression)
            projectModalHTML += `
              <div data-id="${data.id}" class="div-img-modal">
                <img class="img-modal" src="${data.imageUrl}">
                <a id="${data.id}" class="link-icon-trash">
                  <i class="fa-solid fa-trash-can"></i>
                </a>
              </div>
            `;
          });
        });
      });

      // ===== CHARGEMENT INITIAL =====
      // On simule un clic sur le premier bouton ("Tous") pour afficher tous les projets au chargement
      btnFilters[0].click();
    });
} catch (error) {
  // Gestion des erreurs : affichage en console + alerte utilisateur
  console.error(error);
  alert("La requête n'a pas pu être effectuée");
}


// Prochaine étape 
/*
 1 : Vérifier si l'utilisateur est connecté (token dans le localStorage)
 1 a: Si oui -> afficher les élements admin (barre noir en haut) + bouton éditions
 1 b : si non -> masquer les éléments admin + bouton édition


 // Modal 

 Je clique sur Edition -> la modale s'affiche

 2 : La modal affiche tous les works avec un bouton de suppresion (icone poubelle (a faire en dernier))
 2 : Bouton ajouter une photo qui va t'amener sur une 2 eme modale avec le formulaire qui permet de créer un work (image, titre, une catégorie)
 3 : On sauvegarde (e.prevendDefault()) pour ne pas recharger la page lors de l'envoie
 4 : Suppresion d'un works dans la modale et dans le DOM et affichage en direct sans rechargement de la page



*/