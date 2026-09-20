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
// ABRIR SITIOS
// =========================================

const siteCards = document.querySelectorAll(".site-card");


siteCards.forEach((site) => {

    site.addEventListener("click", () => {

        const url = site.dataset.url;

        if (url) {

            window.location.href = url;

        }

    });

});



// =========================================
// AGREGAR SITIO
// =========================================

// Elementos
const addSiteOverlay = document.getElementById("add-site-overlay");
const addSiteName = document.getElementById("add-site-name");
const addSiteUrl = document.getElementById("add-site-url");
const addSiteDescription = document.getElementById("add-site-description");
const addSiteNameError = document.getElementById("add-site-name-error");
const addSiteUrlError = document.getElementById("add-site-url-error");

const closeAddSiteButton = document.getElementById("close-add-site-button");
const cancelAddSiteButton = document.getElementById("cancel-add-site-button");
const saveAddSiteButton = document.getElementById("save-add-site-button");


// Grupo al que se agregará el sitio
let groupBeingAddedTo = null;


// Botones "+ Agregar sitio"
const addSiteButtons = document.querySelectorAll(".add-site-card");


// Abrir modal
addSiteButtons.forEach((button) => {

    button.addEventListener("click", (event) => {

        event.stopPropagation();


        // Obtener el grupo al que pertenece el botón
        const group = button.closest(".site-group");

        groupBeingAddedTo = group;


        // Limpiar campos
        addSiteName.value = "";
        addSiteUrl.value = "";
        addSiteDescription.value = "";

        addSiteNameError.textContent = "";
        addSiteUrlError.textContent = "";


        // Mostrar ventana
        addSiteOverlay.style.opacity = "1";
        addSiteOverlay.style.visibility = "visible";
        addSiteOverlay.style.pointerEvents = "auto";


        // Seleccionar nombre
        addSiteName.focus();

    });

});



// =========================================
// GUARDAR NUEVO SITIO
// =========================================

saveAddSiteButton.addEventListener("click", () => {

    const newName = addSiteName.value.trim();
    let newUrl = addSiteUrl.value.trim();
    const newDescription = addSiteDescription.value.trim();

    addSiteNameError.textContent = "";
    addSiteUrlError.textContent = "";


    // No permitir nombre vacío
    if (newName === "") {

        addSiteNameError.textContent = "Por favor, introduce un nombre.";

        return;

    }


    // No permitir URL vacía
    if (newUrl === "") {

        addSiteUrlError.textContent = "Por favor, introduce una URL.";

        return;

    }


    // Agregar https si no se escribió el protocolo
    if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {

        newUrl = "https://" + newUrl;

    }


    // Validar URL
    try {

        const url = new URL(newUrl);

        if (!url.hostname.includes(".")) {

            addSiteUrlError.textContent = "Introduce una URL válida.";

            return;

        }

    } catch {

        addSiteUrlError.textContent = "Introduce una URL válida.";

        return;

    }


    // Obtener el contenedor de sitios del grupo
    const sitesContainer = groupBeingAddedTo.querySelector(".sites-container");


    // Crear tarjeta del nuevo sitio
    const newSite = document.createElement("div");

    newSite.className = "site-card";
    newSite.dataset.url = newUrl;


    // Crear icono
    const siteIcon = document.createElement("div");

    siteIcon.className = "site-icon";
    siteIcon.textContent = "🌐";


    // Crear nombre
    const siteName = document.createElement("span");

    siteName.className = "site-name";
    siteName.textContent = newName;


    // Crear descripción
    const siteDescription = document.createElement("div");

    siteDescription.className = "site-description";
    siteDescription.textContent = newDescription;


    // Agregar elementos a la tarjeta
    newSite.appendChild(siteIcon);
    newSite.appendChild(siteName);
    newSite.appendChild(siteDescription);


    // Crear botón del menú
    const siteMenuButton = document.createElement("button");

    siteMenuButton.className = "site-menu-button";
    siteMenuButton.textContent = "⋮";


    // Crear menú del sitio
    const siteMenu = document.createElement("div");

    siteMenu.className = "site-menu";


    // Crear botón "Editar sitio"
    const editSiteButton = document.createElement("button");

    editSiteButton.className = "edit-site-button";
    editSiteButton.innerHTML = `
        <span class="menu-icon">✏️</span>
        Editar sitio
    `;


    // Crear botón "Eliminar sitio"
    const deleteSiteButton = document.createElement("button");

    deleteSiteButton.className = "delete-site-button";
    deleteSiteButton.innerHTML = `
        <span class="menu-icon">🗑️</span>
        Eliminar sitio
    `;


    // Agregar botones al menú
    siteMenu.appendChild(editSiteButton);
    siteMenu.appendChild(deleteSiteButton);


    // Agregar botón y menú a la tarjeta
    newSite.appendChild(siteMenuButton);
    newSite.appendChild(siteMenu);


    // Insertar la tarjeta antes de "Agregar sitio"
    const addSiteCard = groupBeingAddedTo.querySelector(".add-site-card");

    sitesContainer.insertBefore(newSite, addSiteCard);


    // =========================================
    // EVENTOS DE LA NUEVA TARJETA
    // =========================================

    // Abrir sitio
    newSite.addEventListener("click", () => {

        const url = newSite.dataset.url;

        if (url) {

            window.location.href = url;

        }

    });


    // Abrir / cerrar menú
    siteMenuButton.addEventListener("click", (event) => {

        event.stopPropagation();


        // Cerrar los demás menús
        document.querySelectorAll(".site-menu").forEach((otherMenu) => {

            if (otherMenu !== siteMenu) {

                otherMenu.style.display = "none";

            }

        });


        // Alternar menú actual
        if (siteMenu.style.display === "block") {

            siteMenu.style.display = "none";

        } else {

            siteMenu.style.display = "block";

        }

    });


    // Evitar que el clic dentro del menú abra el sitio
    siteMenu.addEventListener("click", (event) => {

        event.stopPropagation();

    });


    // Cerrar menú después de editar
    editSiteButton.addEventListener("click", (event) => {

        event.stopPropagation();

        siteBeingEdited = newSite;

        editSiteName.value = newSite.querySelector(".site-name").textContent.trim();
        editSiteUrl.value = newSite.dataset.url || "";
        editSiteDescription.value = newSite.querySelector(".site-description").textContent.trim();

        editSiteNameError.textContent = "";
        editSiteUrlError.textContent = "";

        editSiteOverlay.style.opacity = "1";
        editSiteOverlay.style.visibility = "visible";
        editSiteOverlay.style.pointerEvents = "auto";

        siteMenu.style.display = "none";

        editSiteName.focus();
        editSiteName.select();

    });


    // Eliminar sitio
    deleteSiteButton.addEventListener("click", (event) => {

        event.stopPropagation();

        newSite.remove();

    });


    // Cerrar modal
    closeAddSite();

});



// =========================================
// CERRAR MODAL AGREGAR SITIO
// =========================================

function closeAddSite() {

    addSiteOverlay.style.opacity = "0";
    addSiteOverlay.style.visibility = "hidden";
    addSiteOverlay.style.pointerEvents = "none";

    groupBeingAddedTo = null;

}


// Botón X
closeAddSiteButton.addEventListener("click", closeAddSite);


// Botón Cancelar
cancelAddSiteButton.addEventListener("click", closeAddSite);


// Clic fuera de la ventana
addSiteOverlay.addEventListener("click", (event) => {

    if (event.target === addSiteOverlay) {

        closeAddSite();

    }

});



// =========================================
// EDITAR SITIO
// =========================================

// Elementos
const editSiteOverlay = document.getElementById("edit-site-overlay");
const editSiteName = document.getElementById("edit-site-name");
const editSiteUrl = document.getElementById("edit-site-url");
const editSiteDescription = document.getElementById("edit-site-description");
const editSiteUrlError = document.getElementById("edit-site-url-error");
const editSiteNameError = document.getElementById("edit-site-name-error");

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

        editSiteUrlError.textContent = "";
        editSiteNameError.textContent = "";


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
    let newUrl = editSiteUrl.value.trim();
    const newDescription = editSiteDescription.value.trim();

    editSiteUrlError.textContent = "";
    editSiteNameError.textContent = "";


    // No permitir nombre vacío
    if (newName === "") {

        editSiteNameError.textContent = "Por favor, introduce un nombre.";
        
        return;

    }


    // No permitir URL vacía
    if (newUrl === "") {

        editSiteUrlError.textContent = "Por favor, introduce una URL.";

        return;

    }


    // Agregar https si no se escribió el protocolo
    if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {

        newUrl = "https://" + newUrl;

    }


    // Validar URL
    try {

        const url = new URL(newUrl);

        if (!url.hostname.includes(".")) {

            editSiteUrlError.textContent = "Introduce una URL válida.";

            return;

        }

    } catch {

        editSiteUrlError.textContent = "Introduce una URL válida.";

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
const editGroupNameError = document.getElementById("edit-group-name-error");
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

        editGroupNameError.textContent = "";


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

    editGroupNameError.textContent = "";


    // No permitir nombres vacíos
    if (newName === "") {

        editGroupNameError.textContent = "Por favor, introduce un nombre.";

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