// =========================================
// PANEL DE CONFIGURACIÓN
// =========================================

// Elementos
const settingsButton = document.getElementById("settings-button");
const settingsPanel = document.getElementById("settings-panel");
const closeSettingsButton = document.getElementById("close-settings-button");
const settingsOverlay = document.getElementById("settings-overlay");


// =========================================
// ABRIR PANEL DE CONFIGURACIÓN
// =========================================

settingsButton.addEventListener("click", () => {

    settingsPanel.style.transform = "translateX(0)";

    settingsOverlay.style.opacity = "1";
    settingsOverlay.style.visibility = "visible";
    settingsOverlay.style.pointerEvents = "auto";

});


// =========================================
// CERRAR PANEL DE CONFIGURACIÓN
// =========================================

function closeSettings() {

    settingsPanel.style.transform = "translateX(100%)";

    settingsOverlay.style.opacity = "0";
    settingsOverlay.style.visibility = "hidden";
    settingsOverlay.style.pointerEvents = "none";

}


// Botón X
closeSettingsButton.addEventListener("click", closeSettings);


// Clic en la capa transparente
settingsOverlay.addEventListener("click", closeSettings);



// =========================================
// MENÚS DE LOS GRUPOS
// =========================================

// Botones ⋮
const groupMenuButtons = document.querySelectorAll(".group-menu-button");


// Abrir / cerrar menú
groupMenuButtons.forEach((button) => {

    button.addEventListener("click", (event) => {

        event.stopPropagation();

        const group = button.closest(".site-group");
        const menu = group.querySelector(".group-menu");


        // Cerrar los demás menús
        document.querySelectorAll(".group-menu").forEach((otherMenu) => {

            if (otherMenu !== menu) {

                otherMenu.style.display = "none";

            }

        });


        // Alternar menú actual
        if (menu.style.display === "block") {

            menu.style.display = "none";

        } else {

            menu.style.display = "block";

        }

    });

});



// =========================================
// MENÚS DE LOS SITIOS
// =========================================

// Botones ⋮
const siteMenuButtons = document.querySelectorAll(".site-menu-button");


// Abrir / cerrar menú
siteMenuButtons.forEach((button) => {

    button.addEventListener("click", (event) => {

        event.stopPropagation();

        const site = button.closest(".site-card");
        const menu = site.querySelector(".site-menu");


        // Cerrar los demás menús
        document.querySelectorAll(".site-menu").forEach((otherMenu) => {

            if (otherMenu !== menu) {

                otherMenu.style.display = "none";

            }

        });


        // Alternar menú actual
        if (menu.style.display === "block") {

            menu.style.display = "none";

        } else {

            menu.style.display = "block";

        }

    });

});



// =========================================
// CERRAR MENÚS AL HACER CLIC FUERA
// =========================================

document.addEventListener("click", () => {

    document.querySelectorAll(".group-menu, .site-menu").forEach((menu) => {

        menu.style.display = "none";

    });

});



// =========================================
// EDITAR SITIO
// =========================================

// Elementos
const editSiteOverlay = document.getElementById("edit-site-overlay");
const editSiteName = document.getElementById("edit-site-name");
const editSiteUrl = document.getElementById("edit-site-url");
const editSiteDescription = document.getElementById("edit-site-description");

const closeEditSiteButton = document.getElementById("close-edit-site-button");
const cancelEditSiteButton = document.getElementById("cancel-edit-site-button");
const saveEditSiteButton = document.getElementById("save-edit-site-button");


// Sitio que se está editando
let siteBeingEdited = null;


// =========================================
// ABRIR EDICIÓN DE SITIO
// =========================================

document.querySelectorAll(".edit-site-button").forEach((button) => {

    button.addEventListener("click", (event) => {

        event.stopPropagation();


        // Obtener sitio
        const site = button.closest(".site-card");

        siteBeingEdited = site;


        // Obtener datos actuales
        const siteName = site.querySelector(".site-name");
        const siteDescription = site.querySelector(".site-description");


        editSiteName.value = siteName.textContent.trim();

        editSiteUrl.value = site.dataset.url || "";

        editSiteDescription.value = siteDescription.textContent.trim();


        // Mostrar ventana
        editSiteOverlay.style.opacity = "1";
        editSiteOverlay.style.visibility = "visible";
        editSiteOverlay.style.pointerEvents = "auto";


        // Cerrar menú
        site.querySelector(".site-menu").style.display = "none";


        // Seleccionar nombre
        editSiteName.focus();
        editSiteName.select();

    });

});

// =========================================
// GUARDAR CAMBIOS DEL SITIO
// =========================================

saveEditSiteButton.addEventListener("click", () => {

    const newName = editSiteName.value.trim();
    const newUrl = editSiteUrl.value.trim();
    const newDescription = editSiteDescription.value.trim();


    // No permitir nombre vacío
    if (newName === "") {

        return;

    }


    // No permitir URL vacía
    if (newUrl === "") {

        return;

    }


    // Obtener elementos del sitio
    const siteName = siteBeingEdited.querySelector(".site-name");
    const siteDescription = siteBeingEdited.querySelector(".site-description");


    // Actualizar nombre
    siteName.textContent = newName;


    // Actualizar URL
    siteBeingEdited.dataset.url = newUrl;


    // Actualizar descripción
    siteDescription.textContent = newDescription;

        // Cerrar ventana
    closeEditSite();

});

// =========================================
// CANCELAR EDICIÓN DEL SITIO
// =========================================

cancelEditSiteButton.addEventListener("click", closeEditSite);
// Botón X
closeEditSiteButton.addEventListener("click", closeEditSite);

// Clic fuera de la ventana
editSiteOverlay.addEventListener("click", (event) => {

    if (event.target === editSiteOverlay) {

        closeEditSite();

    }

});

// =========================================
// EDITAR GRUPO
// =========================================

// Elementos
const editGroupOverlay = document.getElementById("edit-group-overlay");
const editGroupName = document.getElementById("edit-group-name");
const closeEditGroupButton = document.getElementById("close-edit-group-button");
const cancelEditGroupButton = document.getElementById("cancel-edit-group-button");
const saveEditGroupButton = document.getElementById("save-edit-group-button");


// Grupo que se está editando
let groupBeingEdited = null;


// =========================================
// ABRIR EDICIÓN DE GRUPO
// =========================================

document.querySelectorAll(".edit-group-button").forEach((button) => {

    button.addEventListener("click", (event) => {

        event.stopPropagation();


        // Obtener grupo
        const group = button.closest(".site-group");

        groupBeingEdited = group;


        // Obtener nombre actual
        const groupTitle = group.querySelector("h2");

        editGroupName.value = groupTitle.textContent.trim();


        // Mostrar ventana
        editGroupOverlay.style.opacity = "1";
        editGroupOverlay.style.visibility = "visible";
        editGroupOverlay.style.pointerEvents = "auto";


        // Cerrar menú
        group.querySelector(".group-menu").style.display = "none";


        // Seleccionar nombre
        editGroupName.focus();
        editGroupName.select();

    });

});



// =========================================
// GUARDAR CAMBIOS DEL GRUPO
// =========================================

saveEditGroupButton.addEventListener("click", () => {

    const newName = editGroupName.value.trim();


    // No permitir nombres vacíos
    if (newName === "") {

        return;

    }


    // Cambiar nombre
    const groupTitle = groupBeingEdited.querySelector("h2");

    groupTitle.textContent = newName;


    // Cerrar ventana
    closeEditGroup();

});



// =========================================
// CANCELAR EDICIÓN DEL GRUPO
// =========================================

cancelEditGroupButton.addEventListener("click", closeEditGroup);


// Botón X
closeEditGroupButton.addEventListener("click", closeEditGroup);


// Clic fuera de la ventana
editGroupOverlay.addEventListener("click", (event) => {

    if (event.target === editGroupOverlay) {

        closeEditGroup();

    }

});



// =========================================
// CERRAR VENTANA DE EDICIÓN DE GRUPO
// =========================================

function closeEditGroup() {

    editGroupOverlay.style.opacity = "0";
    editGroupOverlay.style.visibility = "hidden";
    editGroupOverlay.style.pointerEvents = "none";

    groupBeingEdited = null;

}

// =========================================
// CERRAR VENTANA DE EDICIÓN DEL SITIO
// =========================================

function closeEditSite() {

    editSiteOverlay.style.opacity = "0";
    editSiteOverlay.style.visibility = "hidden";
    editSiteOverlay.style.pointerEvents = "none";

    siteBeingEdited = null;

}

