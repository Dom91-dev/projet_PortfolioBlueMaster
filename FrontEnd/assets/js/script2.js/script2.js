// ============================================================
// CONFIG & CONSTANTES
// ============================================================
const API_URL = "http://localhost:5678/api";
const token = localStorage.getItem("token");

// Sélecteurs DOM regroupés (plus facile à maintenir)
const dom = {
  filters: document.querySelector(".filters"),
  gallery: document.querySelector(".gallery"),
  loginLink: document.getElementById("login-link"),
  editionMode: document.querySelector("#edition-mode"),
  portfolioTitle: document.querySelector("#portfolio h2"),
  // Modale
  modal: document.getElementById("modal"),
  modalPart1: document.getElementById("modal-part-1"),
  modalPart2: document.getElementById("modal-part-2"),
  galleryModal: document.getElementById("gallery-modal"),
  openModalLink: document.getElementById("link-modif"),
  buttonAdd: document.getElementById("btn-add"),
  iconBack: document.getElementById("icon-back"),
  closeModal1: document.getElementById("close-modal-1"),
  closeModal2: document.getElementById("close-modal-2"),
};

// État partagé : on charge les works une fois et on les réutilise
let allWorks = [];

// ============================================================
// API
// ============================================================
async function fetchWorks() {
  const res = await fetch(`${API_URL}/works`);
  if (!res.ok) throw new Error("Erreur lors du chargement des works");
  return res.json();
}

async function deleteWork(id) {
  const res = await fetch(`${API_URL}/works/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
}

async function createWork(formData) {
  const res = await fetch(`${API_URL}/works`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }, // PAS de Content-Type avec FormData
    body: formData,
  });
  if (!res.ok) throw new Error("Erreur lors de l'ajout");
  return res.json();
}

// ============================================================
// GALERIE PRINCIPALE
// ============================================================
function renderGallery(works) {
  dom.gallery.innerHTML = works
    .map(
      (w) => `
      <figure data-id="${w.id}" class="fig-project">
        <img src="${w.imageUrl}" alt="${w.title}">
        <figcaption>${w.title}</figcaption>
      </figure>`
    )
    .join("");
}

// ============================================================
// FILTRES
// ============================================================
function renderFilters(works) {
  const categories = [...new Set(works.map((w) => w.category.name))];

  // Bouton "Tous" + un bouton par catégorie
  dom.filters.innerHTML = `
    <button data-category="all" class="btn-filter filter-selected">Tous</button>
    ${categories
      .map((c) => `<button data-category="${c}" class="btn-filter">${c}</button>`)
      .join("")}
  `;

  // Un seul listener via délégation d'événement
  dom.filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-filter");
    if (!btn) return;

    dom.filters
      .querySelectorAll(".btn-filter")
      .forEach((b) => b.classList.remove("filter-selected"));
    btn.classList.add("filter-selected");

    const category = btn.dataset.category;
    const filtered =
      category === "all"
        ? allWorks
        : allWorks.filter((w) => w.category.name === category);

    renderGallery(filtered);
  });
}

// ============================================================
// MODALE
// ============================================================
function renderModalGallery(works) {
  dom.galleryModal.innerHTML = works
    .map(
      (w) => `
      <div data-id="${w.id}" class="div-img-modal">
        <img class="img-modal" src="${w.imageUrl}" alt="${w.title}">
        <a class="link-icon-trash" data-id="${w.id}">
          <i class="fa-solid fa-trash-can"></i>
        </a>
      </div>`
    )
    .join("");
}

function showModalPart(part) {
  dom.modalPart1.classList.toggle("active", part === 1);
  dom.modalPart2.classList.toggle("active", part === 2);
}

function openModal() {
  renderModalGallery(allWorks);
  dom.modal.showModal();
  showModalPart(1);
}

function initModalEvents() {
  dom.openModalLink.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });

  dom.buttonAdd.addEventListener("click", (e) => {
    e.preventDefault();
    showModalPart(2);
  });

  dom.iconBack.addEventListener("click", (e) => {
    e.preventDefault();
    showModalPart(1);
  });

  dom.closeModal1.addEventListener("click", () => dom.modal.close());
  dom.closeModal2.addEventListener("click", () => dom.modal.close());

  // Fermer en cliquant sur le backdrop
  dom.modal.addEventListener("click", (e) => {
    if (e.target === dom.modal) dom.modal.close();
  });

  // Suppression via délégation
  dom.galleryModal.addEventListener("click", async (e) => {
    const trash = e.target.closest(".link-icon-trash");
    if (!trash) return;

    const id = Number(trash.dataset.id);
    try {
      await deleteWork(id);
      allWorks = allWorks.filter((w) => w.id !== id);
      renderGallery(allWorks);
      renderModalGallery(allWorks);
    } catch (err) {
      alert(err.message);
    }
  });
}

// ============================================================
// AUTH (login / logout)
// ============================================================
function initAuth() {
  if (!dom.loginLink) return;

  dom.loginLink.textContent = token ? "Logout" : "Login";
  dom.loginLink.addEventListener("click", (e) => {
    if (token) {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.reload();
    }
    // sinon : laisser le lien vers login.html agir naturellement
  });
}

function applyAdminMode() {
  const isAdmin = Boolean(token);

  dom.editionMode.style.display = isAdmin ? "flex" : "none";
  dom.openModalLink.style.display = isAdmin ? "inline-block" : "none";
  dom.filters.style.display = isAdmin ? "none" : "flex";

  if (isAdmin) {
    const btn = document.createElement("span");
    btn.className = "btn-modifier";
    btn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Modifier';
    btn.style.cssText = "margin-left: 10px; cursor: pointer;";
    btn.addEventListener("click", openModal);
    dom.portfolioTitle.appendChild(btn);
  }
}

// ============================================================
// POINT D'ENTRÉE
// ============================================================
async function init() {
  try {
    allWorks = await fetchWorks();
    renderGallery(allWorks);
    renderFilters(allWorks);
    initAuth();
    applyAdminMode();
    initModalEvents();
  } catch (err) {
    console.error(err);
    alert("Impossible de charger les projets");
  }
}

init();

