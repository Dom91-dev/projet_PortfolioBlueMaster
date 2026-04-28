
// ===== CONNEXION DU SCRIPT =====
// On vérifie dans la console que le fichier JS est bien chargé par le HTML
console.log("Le formulaire est relié au JS");

// ===== DÉCLARATION DES VARIABLES GLOBALES =====
// Sélection des éléments DOM principaux
const divFilters = document.querySelector(".filters");
const divProjects = document.querySelector(".gallery");
const loginLink = document.getElementById("login-link");
const token = localStorage.getItem("token");
const modal = document.getElementById("modal");
const modalPart1 = document.getElementById("modal-part-1");
const modalPart2 = document.getElementById("modal-part-2");
const buttonAdd = document.getElementById("btn-add");
const backBtn = document.getElementById("icon-back");
const closeModal1 = document.getElementById("close-modal-1");
const closeModal2 = document.getElementById("close-modal-2");
const contentModal = document.getElementById("gallery-modal");
const linkOpenModal = document.getElementById("link-modif");
const editionMode = document.querySelector("#edition-mode");
const formAddWork = document.getElementById("form-ajout-work");

// Tableau pour stocker tous les travaux récupérés depuis l'API
let allWorks = [];

// ===== FONCTIONS D'AUTHENTIFICATION =====
// Fonction pour gérer le mode d'authentification (connecté ou non)
function setAuthMode() {
  if (loginLink) {
    loginLink.textContent = token ? "Logout" : "Login";
    loginLink.addEventListener("click", (event) => {
      if (token) {
        event.preventDefault();
        localStorage.removeItem("token");
        window.location.reload();
      } else {
        window.location.href = "login.html";
      }
    });
  }

  if (token) {
    if (linkOpenModal) linkOpenModal.style.display = "inline-block";
    if (editionMode) editionMode.style.display = "flex";
    if (divFilters) divFilters.style.display = "none";
  } else {
    if (linkOpenModal) linkOpenModal.style.display = "none";
    if (editionMode) editionMode.style.display = "none";
    if (divFilters) divFilters.style.display = "flex";
  }
}

// ===== FONCTIONS DE GESTION DE LA MODALE =====
// Ouvre la première partie de la modale (galerie)
function openModalPart1() {
  if (!modal) return;
  modalPart1.classList.add("active");
  modalPart2.classList.remove("active");
  modal.showModal();
  afficherWorksModal();
}

// Ouvre la deuxième partie de la modale (ajout de travail)
function openModalPart2() {
  if (!modal) return;
  modalPart1.classList.remove("active");
  modalPart2.classList.add("active");
}

// Ferme la modale
function closeModal() {
  if (!modal) return;
  modal.close();
}

// Configure les événements pour la modale
function setupModalEvents() {
  if (linkOpenModal) {
    linkOpenModal.addEventListener("click", (e) => {
      e.preventDefault();
      openModalPart1();
    });
  }

  if (buttonAdd) {
    buttonAdd.addEventListener("click", (e) => {
      e.preventDefault();
      openModalPart2();
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModalPart1();
    });
  }

  if (closeModal1) {
    closeModal1.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  if (closeModal2) {
    closeModal2.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!isInDialog) {
        closeModal();
      }
    });
  }
}

// ===== FONCTIONS DE RÉCUPÉRATION DES DONNÉES =====
// Récupère les travaux depuis l'API et les affiche
async function fetchWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
      throw new Error("Erreur de la requête HTTP");
    }
    const works = await response.json();
    allWorks = works;
    afficherWorks(allWorks);
  } catch (error) {
    console.error("Erreur lors de la récupération des works :", error);
    alert("La requête n'a pas pu être effectuée");
  }
}

// ===== FONCTIONS D'AFFICHAGE =====
// Affiche les travaux dans la galerie principale
function afficherWorks(works) {
  if (!divProjects) return;
  divProjects.innerHTML = "";
  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;
    figure.classList.add("fig-project");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    divProjects.appendChild(figure);
  });
}

// Récupère et affiche les filtres de catégories
async function afficherFiltres() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
      throw new Error("Erreur de la requête catégories");
    }
    const categories = await response.json();
    if (!divFilters) return;

    divFilters.innerHTML = "";
    const btnAll = document.createElement("button");
    btnAll.textContent = "Tous";
    btnAll.classList.add("filter-btn", "active");
    btnAll.dataset.category = "all";
    divFilters.appendChild(btnAll);

    categories.forEach((category) => {
      const button = document.createElement("button");
      button.textContent = category.name;
      button.classList.add("filter-btn");
      button.dataset.category = category.id;
      divFilters.appendChild(button);
    });
    addEventFilters();
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
  }
}

// Ajoute les événements de clic aux boutons de filtre
function addEventFilters() {
  const btnFilters = document.querySelectorAll(".filter-btn");
  btnFilters.forEach((button) => {
    button.addEventListener("click", () => {
      btnFilters.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const category = button.dataset.category;
      if (category === "all") {
        afficherWorks(allWorks);
      } else {
        const worksFilters = allWorks.filter(
          (work) => work.categoryId === parseInt(category, 10)
        );
        afficherWorks(worksFilters);
      }
    });
  });
}

// Affiche les travaux dans la modale avec les boutons de suppression
async function afficherWorksModal() {
  if (!contentModal) return;
  contentModal.innerHTML = "";
  allWorks.forEach((work) => {
    contentModal.innerHTML += `
      <div data-id="${work.id}" class="div-img-modal">
        <img class="img-modal" src="${work.imageUrl}" alt="${work.title}">
        <a id="${work.id}" class="link-icon-trash" href="#">
          <i class="fa-solid fa-trash-can"></i>
        </a>
      </div>
    `;
  });
  document.querySelectorAll(".link-icon-trash").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      event.preventDefault();
      const id = btn.id;
      await supprimerWork(id);
    });
  });
}

// ===== FONCTIONS DE GESTION DES TRAVAUX =====
// Supprime un travail via l'API
async function supprimerWork(id) {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Erreur suppression");
    }
    allWorks = allWorks.filter((work) => work.id !== parseInt(id, 10));
    afficherWorks(allWorks);
    afficherWorksModal();
  } catch (error) {
    console.error("Erreur :", error);
    alert("Impossible de supprimer ce work.");
  }
}

// Soumet le formulaire d'ajout d'un nouveau travail
async function submitNewWork(event) {
  event.preventDefault();
  if (!formAddWork) return;

  const image = document.querySelector("#image").files[0];
  const title = document.querySelector("#title").value.trim();
  const category = document.querySelector("#category").value;

  if (!image || !title || !category) {
    alert("Veuillez remplir tous les champs du formulaire.");
    return;
  }

  const formData = new FormData();
  formData.append("image", image);
  formData.append("title", title);
  formData.append("category", category);

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur lors de l'ajout du work :", errorData);
      alert("Une erreur est survenue lors de l'ajout du work.");
      return;
    }

    const newWork = await response.json();
    allWorks.push(newWork);
    afficherWorks(allWorks);
    afficherWorksModal();
    formAddWork.reset();
    openModalPart1();
    alert("Work ajouté avec succès !");
  } catch (err) {
    console.error(err);
    alert("Une erreur est survenue lors de l'ajout du work. Veuillez réessayer.");
  }
}

// Ajoute le bouton "Modifier" si l'utilisateur est connecté
function addModifierButton() {
  if (!token) return;
  const btnModifier = document.createElement("span");
  btnModifier.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Modifier';
  btnModifier.classList.add("btn-modifier");
  btnModifier.style.marginLeft = "10px";
  btnModifier.style.cursor = "pointer";
  const portfolioTitle = document.querySelector("#portfolio h2");
  if (portfolioTitle) {
    portfolioTitle.appendChild(btnModifier);
    btnModifier.addEventListener("click", () => {
      openModalPart1();
    });
  }
}

// ===== FONCTION D'INITIALISATION =====
// Initialise la page en configurant l'authentification, les événements et en chargeant les données
async function init() {
  setAuthMode();
  setupModalEvents();
  await fetchWorks();
  await afficherFiltres();
  if (token) {
    addModifierButton();
  }
}

// ===== ÉCOUTEURS D'ÉVÉNEMENTS =====
// Écouteur pour la soumission du formulaire d'ajout de travail
if (formAddWork) {
  formAddWork.addEventListener("submit", submitNewWork);
}

// Écouteur pour l'initialisation une fois le DOM chargé
document.addEventListener("DOMContentLoaded", init);