// =========================================
// FUNCIONES GENERALES
// =========================================

// Mostrar una ventana
function openOverlay(overlay) {

    overlay.style.opacity = "1";
    overlay.style.visibility = "visible";
    overlay.style.pointerEvents = "auto";

}


// Ocultar una ventana
function closeOverlay(overlay) {

    overlay.style.opacity = "0";
    overlay.style.visibility = "hidden";
    overlay.style.pointerEvents = "none";

}


// Abrir / cerrar un menú
function toggleMenu(menu) {

    const wasOpen =
        menu.style.display === "block";

    closeAllMenus();

    if (!wasOpen) {

        menu.style.display = "block";

    }

}


// Cerrar todos los menús
function closeAllMenus() {

    document
        .querySelectorAll(".group-menu, .site-menu")
        .forEach((menu) => {

            menu.style.display = "none";

        });

}


// Cerrar un menú específico
function closeMenu(menu) {

    menu.style.display = "none";

}


// =========================================
// FUNCIONES PARA OBTENER ELEMENTOS
// =========================================

// Obtener nombre de un sitio
function getSiteName(site) {

    return site.querySelector(".site-name");

}


// Obtener descripción de un sitio
function getSiteDescription(site) {

    return site.querySelector(".site-description");

}


// Obtener título de un grupo
function getGroupTitle(group) {

    return group.querySelector("h2");

}


// Abrir un sitio
function openSite(site) {

    const url =
        site.dataset.url;

    if (url) {

        window.location.href = url;

    }

}


// =========================================
// PANEL DE CONFIGURACIÓN
// =========================================

// Elementos
const settingsButton =
    document.getElementById("settings-button");

const settingsPanel =
    document.getElementById("settings-panel");

const closeSettingsButton =
    document.getElementById("close-settings-button");

const settingsOverlay =
    document.getElementById("settings-overlay");


// Abrir panel
settingsButton.addEventListener("click", () => {

    settingsPanel.style.transform =
        "translateX(0)";

    openOverlay(settingsOverlay);

});


// Cerrar panel
function closeSettings() {

    settingsPanel.style.transform =
        "translateX(100%)";

    closeOverlay(settingsOverlay);

}


closeSettingsButton.addEventListener(
    "click",
    closeSettings
);


settingsOverlay.addEventListener(
    "click",
    closeSettings
);


// =========================================
// MENÚS DE LOS GRUPOS
// =========================================

// Configurar menú de un grupo
function setupGroupMenu(group) {

    const menuButton =
        group.querySelector(".group-menu-button");

    const menu =
        group.querySelector(".group-menu");


    if (!menuButton || !menu) {

        return;

    }


    menuButton.addEventListener("click", (event) => {

        event.stopPropagation();

        toggleMenu(menu);

    });


    menu.addEventListener("click", (event) => {

        event.stopPropagation();

    });

}


// =========================================
// MENÚS DE LOS SITIOS
// =========================================

// Configurar comportamiento de un sitio
function setupSiteCard(site) {

    const menuButton =
        site.querySelector(".site-menu-button");

    const menu =
        site.querySelector(".site-menu");


    // Abrir sitio
    site.addEventListener("click", () => {

        openSite(site);

    });


    // Si tiene menú, configurarlo
    if (menuButton && menu) {

        menuButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                toggleMenu(menu);

            }
        );


        menu.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

            }
        );

    }

}


// Cerrar menús al hacer clic afuera
document.addEventListener("click", () => {

    closeAllMenus();

});


// =========================================
// AGREGAR SITIO
// =========================================

// Elementos
const addSiteOverlay =
    document.getElementById("add-site-overlay");

const addSiteName =
    document.getElementById("add-site-name");

const addSiteUrl =
    document.getElementById("add-site-url");

const addSiteDescription =
    document.getElementById("add-site-description");

const addSiteGroup =
    document.getElementById("add-site-group");

const addSiteNameError =
    document.getElementById("add-site-name-error");

const addSiteUrlError =
    document.getElementById("add-site-url-error");

const closeAddSiteButton =
    document.getElementById("close-add-site-button");

const cancelAddSiteButton =
    document.getElementById("cancel-add-site-button");

const saveAddSiteButton =
    document.getElementById("save-add-site-button");


// Grupo al que se agregará el sitio
let groupBeingAddedTo =
    null;


// =========================================
// FORMULARIO AGREGAR SITIO
// =========================================

// Limpiar errores
function clearAddSiteErrors() {

    addSiteNameError.textContent = "";
    addSiteUrlError.textContent = "";

}


// Limpiar formulario
function resetAddSiteForm() {

    addSiteName.value = "";
    addSiteUrl.value = "";
    addSiteDescription.value = "";

    clearAddSiteErrors();

}


// Limpiar estado
function resetAddSiteState() {

    groupBeingAddedTo =
        null;

    resetAddSiteForm();

}


// =========================================
// CARGAR GRUPOS EN EL SELECT
// =========================================

function loadSiteGroups() {

    addSiteGroup.innerHTML = "";


    const groups =
        document.querySelectorAll(".site-group");


    groups.forEach((group) => {

        const groupTitle =
            getGroupTitle(group);

        const groupName =
            groupTitle.textContent.trim();


        const option =
            document.createElement("option");


        option.value =
            groupName;

        option.textContent =
            groupName;


        addSiteGroup.appendChild(option);

    });

}


// =========================================
// ABRIR MODAL AGREGAR SITIO
// =========================================

function openAddSite() {

    resetAddSiteForm();

    openOverlay(addSiteOverlay);

    addSiteName.focus();

}


// =========================================
// CERRAR MODAL AGREGAR SITIO
// =========================================

function closeAddSite() {

    closeOverlay(addSiteOverlay);

    resetAddSiteState();

}


closeAddSiteButton.addEventListener(
    "click",
    closeAddSite
);


cancelAddSiteButton.addEventListener(
    "click",
    closeAddSite
);


addSiteOverlay.addEventListener(
    "click",
    (event) => {

        if (event.target === addSiteOverlay) {

            closeAddSite();

        }

    }
);


// =========================================
// OBTENER GRUPO POR NOMBRE
// =========================================

function findGroupByName(groupName) {

    const groups =
        document.querySelectorAll(".site-group");


    for (const group of groups) {

        const groupTitle =
            getGroupTitle(group);


        if (
            groupTitle.textContent.trim() ===
            groupName
        ) {

            return group;

        }

    }


    return null;

}


// =========================================
// CREAR TARJETA DE SITIO
// =========================================

function createSiteCard(
    name,
    url,
    description
) {

    const site =
        document.createElement("div");

    site.className =
        "site-card";

    site.dataset.url =
        url;


// Icono
const siteIcon =
    document.createElement("div");

siteIcon.className =
    "site-icon";

const siteIconImage =
    document.createElement("img");

siteIconImage.src =
    new URL("/favicon.ico", url).href;

siteIconImage.alt =
    "";


// Icono predeterminado
siteIconImage.addEventListener("error", () => {

    siteIconImage.remove();

    siteIcon.textContent =
        "🌐";

});


// Agregar imagen al contenedor
siteIcon.appendChild(
    siteIconImage
);


    // Nombre
    const siteName =
        document.createElement("span");

    siteName.className =
        "site-name";

    siteName.textContent =
        name;


    // Descripción
    const siteDescription =
        document.createElement("div");

    siteDescription.className =
        "site-description";

    siteDescription.textContent =
        description;


    // Botón menú
    const siteMenuButton =
        document.createElement("button");

    siteMenuButton.className =
        "site-menu-button";

    siteMenuButton.textContent =
        "⋮";


    // Menú
    const siteMenu =
        document.createElement("div");

    siteMenu.className =
        "site-menu";


    // Editar
    const editSiteButton =
        document.createElement("button");

    editSiteButton.className =
        "edit-site-button";

    editSiteButton.innerHTML = `
        <span class="menu-icon">✏️</span>
        Editar sitio
    `;


    // Eliminar
    const deleteSiteButton =
        document.createElement("button");

    deleteSiteButton.className =
        "delete-site-button";

    deleteSiteButton.innerHTML = `
        <span class="menu-icon">🗑️</span>
        Eliminar sitio
    `;


    // Agregar botones al menú
    siteMenu.appendChild(
        editSiteButton
    );

    siteMenu.appendChild(
        deleteSiteButton
    );


    // Agregar elementos a la tarjeta
    site.appendChild(siteIcon);
    site.appendChild(siteName);
    site.appendChild(siteDescription);
    site.appendChild(siteMenuButton);
    site.appendChild(siteMenu);


    // Configurar comportamiento
    setupSiteCard(site);


    // Editar sitio
    editSiteButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            openEditSite(site);

            closeMenu(siteMenu);

        }
    );


    // Eliminar sitio
    deleteSiteButton.addEventListener(
        "click",
        async (event) => {

            event.stopPropagation();

            site.remove();

            await saveCurrentData();

        }
    );


    return site;

}


// =========================================
// BOTONES "+ AGREGAR SITIO"
// =========================================

function setupAddSiteCard(addSiteCard) {

    addSiteCard.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();


            const group =
                addSiteCard.closest(".site-group");


            groupBeingAddedTo =
                group;


            openAddSite();


            addSiteGroup.style.display =
                "none";

        }
    );

}


// Configurar tarjetas existentes
document
    .querySelectorAll(".add-site-card")
    .forEach((card) => {

        setupAddSiteCard(card);

    });


// =========================================
// BOTÓN GLOBAL AGREGAR SITIO
// =========================================

const addSiteButton =
    document.getElementById("add-site-button");


addSiteButton.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();


        groupBeingAddedTo =
            null;


        loadSiteGroups();


        addSiteGroup.style.display =
            "block";


        openAddSite();

    }
);


// =========================================
// GUARDAR NUEVO SITIO
// =========================================

saveAddSiteButton.addEventListener(
    "click",
    async () => {

        const newName =
            addSiteName.value.trim();

        let newUrl =
            addSiteUrl.value.trim();

        const newDescription =
            addSiteDescription.value.trim();


        clearAddSiteErrors();


        // Validar nombre
        if (newName === "") {

            addSiteNameError.textContent =
                "Por favor, introduce un nombre.";

            return;

        }


        // Validar URL vacía
        if (newUrl === "") {

            addSiteUrlError.textContent =
                "Por favor, introduce una URL.";

            return;

        }


        // Agregar https
        if (
            !newUrl.startsWith("http://") &&
            !newUrl.startsWith("https://")
        ) {

            newUrl =
                "https://" + newUrl;

        }


        // Validar URL
        try {

            const url =
                new URL(newUrl);


            if (!url.hostname.includes(".")) {

                addSiteUrlError.textContent =
                    "Introduce una URL válida.";

                return;

            }

        } catch {

            addSiteUrlError.textContent =
                "Introduce una URL válida.";

            return;

        }


        // Obtener grupo si no fue seleccionado directamente
        if (groupBeingAddedTo === null) {

            groupBeingAddedTo =
                findGroupByName(
                    addSiteGroup.value
                );

        }


        // Verificar grupo
        if (!groupBeingAddedTo) {

            return;

        }


        // Obtener contenedor
        const sitesContainer =
            groupBeingAddedTo.querySelector(
                ".sites-container"
            );


        // Crear sitio
        const newSite =
            createSiteCard(
                newName,
                newUrl,
                newDescription
            );


        // Obtener tarjeta "+ Agregar sitio"
        const addSiteCard =
            groupBeingAddedTo.querySelector(
                ".add-site-card"
            );


        // Insertar antes de "+ Agregar sitio"
        sitesContainer.insertBefore(
            newSite,
            addSiteCard
        );


        // Guardar
        await saveCurrentData();


        // Cerrar ventana
        closeAddSite();

    }
);


// =========================================
// AGREGAR GRUPO
// =========================================

// Elementos
const addGroupButton =
    document.getElementById("add-group-button");

const addGroupOverlay =
    document.getElementById("add-group-overlay");

const addGroupName =
    document.getElementById("add-group-name");

const addGroupNameError =
    document.getElementById("add-group-name-error");

const closeAddGroupButton =
    document.getElementById("close-add-group-button");

const cancelAddGroupButton =
    document.getElementById("cancel-add-group-button");

const saveAddGroupButton =
    document.getElementById("save-add-group-button");


// =========================================
// FORMULARIO AGREGAR GRUPO
// =========================================

// Limpiar errores
function clearAddGroupErrors() {

    addGroupNameError.textContent = "";

}


// Limpiar formulario
function resetAddGroupForm() {

    addGroupName.value = "";

    clearAddGroupErrors();

}


// Abrir modal
function openAddGroup() {

    resetAddGroupForm();

    openOverlay(addGroupOverlay);

    addGroupName.focus();

}


// Cerrar modal
function closeAddGroup() {

    closeOverlay(addGroupOverlay);

    resetAddGroupForm();

}


addGroupButton.addEventListener(
    "click",
    openAddGroup
);


closeAddGroupButton.addEventListener(
    "click",
    closeAddGroup
);


cancelAddGroupButton.addEventListener(
    "click",
    closeAddGroup
);


addGroupOverlay.addEventListener(
    "click",
    (event) => {

        if (event.target === addGroupOverlay) {

            closeAddGroup();

        }

    }
);


// =========================================
// CREAR GRUPO
// =========================================

function createGroup(name) {

    const group =
        document.createElement("section");

    group.className =
        "site-group";


    // =========================================
    // ENCABEZADO
    // =========================================

    const groupHeader =
        document.createElement("div");

    groupHeader.className =
        "group-header";


    const groupTitleContainer =
        document.createElement("div");

    groupTitleContainer.className =
        "group-title-container";


    const groupTitle =
        document.createElement("h2");

    groupTitle.textContent =
        name;


    const groupMenuButton =
        document.createElement("button");

    groupMenuButton.className =
        "group-menu-button";

    groupMenuButton.textContent =
        "⋮";


    groupTitleContainer.appendChild(
        groupTitle
    );

    groupTitleContainer.appendChild(
        groupMenuButton
    );


    groupHeader.appendChild(
        groupTitleContainer
    );


    // =========================================
    // MENÚ DEL GRUPO
    // =========================================

    const groupMenu =
        document.createElement("div");

    groupMenu.className =
        "group-menu";


    const editGroupButton =
        document.createElement("button");

    editGroupButton.className =
        "edit-group-button";

    editGroupButton.innerHTML = `
        <span class="menu-icon">✏️</span>
        Editar grupo
    `;


    const deleteGroupButton =
        document.createElement("button");

    deleteGroupButton.className =
        "delete-group-button";

    deleteGroupButton.innerHTML = `
        <span class="menu-icon">🗑️</span>
        Eliminar grupo
    `;


    groupMenu.appendChild(
        editGroupButton
    );

    groupMenu.appendChild(
        deleteGroupButton
    );


    groupHeader.appendChild(
        groupMenu
    );


    group.appendChild(
        groupHeader
    );


    // =========================================
    // CONTENEDOR DE SITIOS
    // =========================================

    const sitesContainer =
        document.createElement("div");

    sitesContainer.className =
        "sites-container";


    // Tarjeta "+ Agregar sitio"
    const addSiteCard =
        document.createElement("div");

    addSiteCard.className =
        "add-site-card";


    const addSiteIcon =
        document.createElement("div");

    addSiteIcon.className =
        "add-site-icon";

    addSiteIcon.textContent =
        "+";


    const addSiteNameLabel =
        document.createElement("span");

    addSiteNameLabel.className =
        "add-site-name";

    addSiteNameLabel.textContent =
        "Agregar sitio";


    addSiteCard.appendChild(
        addSiteIcon
    );

    addSiteCard.appendChild(
        addSiteNameLabel
    );


    sitesContainer.appendChild(
        addSiteCard
    );


    group.appendChild(
        sitesContainer
    );


    // =========================================
    // EVENTOS
    // =========================================

    setupGroupMenu(group);

    setupAddSiteCard(addSiteCard);


    // Editar grupo
    editGroupButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            openEditGroup(group);

        }
    );


    // Eliminar grupo
    deleteGroupButton.addEventListener(
        "click",
        async (event) => {

            event.stopPropagation();

            group.remove();

            await saveCurrentData();

        }
    );


    return group;

}


// =========================================
// GUARDAR NUEVO GRUPO
// =========================================

saveAddGroupButton.addEventListener(
    "click",
    async () => {

        const newName =
            addGroupName.value.trim();


        clearAddGroupErrors();


        // Validar nombre
        if (newName === "") {

            addGroupNameError.textContent =
                "Por favor, introduce un nombre.";

            return;

        }


        // Crear grupo
        const newGroup =
            createGroup(newName);


        // Agregar a la página
        const main =
            document.querySelector("main");


        main.appendChild(
            newGroup
        );


        // Guardar
        await saveCurrentData();


        // Cerrar ventana
        closeAddGroup();

    }
);


// =========================================
// CONFIGURAR GRUPOS EXISTENTES
// =========================================

document
    .querySelectorAll(".site-group")
    .forEach((group) => {

        setupGroupMenu(group);

    });


// Eliminar grupos existentes
document
    .querySelectorAll(".delete-group-button")
    .forEach((button) => {

        button.addEventListener(
            "click",
            async (event) => {

                event.stopPropagation();


                const group =
                    button.closest(".site-group");


                group.remove();


                await saveCurrentData();

            }
        );

    });


// =========================================
// ELIMINAR SITIOS EXISTENTES
// =========================================

document
    .querySelectorAll(".delete-site-button")
    .forEach((button) => {

        button.addEventListener(
            "click",
            async (event) => {

                event.stopPropagation();


                const site =
                    button.closest(".site-card");


                site.remove();


                await saveCurrentData();

            }
        );

    });


// =========================================
// CONFIGURAR SITIOS EXISTENTES
// =========================================

document
    .querySelectorAll(".site-card")
    .forEach((site) => {

        setupSiteCard(site);

    });


// =========================================
// EDITAR SITIO
// =========================================

// Elementos
const editSiteOverlay =
    document.getElementById("edit-site-overlay");

const editSiteName =
    document.getElementById("edit-site-name");

const editSiteUrl =
    document.getElementById("edit-site-url");

const editSiteDescription =
    document.getElementById("edit-site-description");

const editSiteUrlError =
    document.getElementById("edit-site-url-error");

const editSiteNameError =
    document.getElementById("edit-site-name-error");

const closeEditSiteButton =
    document.getElementById("close-edit-site-button");

const cancelEditSiteButton =
    document.getElementById("cancel-edit-site-button");

const saveEditSiteButton =
    document.getElementById("save-edit-site-button");


// Sitio que se está editando
let siteBeingEdited =
    null;


// =========================================
// FORMULARIO EDITAR SITIO
// =========================================

// Limpiar errores
function clearEditSiteErrors() {

    editSiteNameError.textContent = "";
    editSiteUrlError.textContent = "";

}


// Limpiar formulario
function resetEditSiteForm() {

    editSiteName.value = "";
    editSiteUrl.value = "";
    editSiteDescription.value = "";

    clearEditSiteErrors();

}


// =========================================
// ABRIR EDICIÓN DE SITIO
// =========================================

function openEditSite(site) {

    resetEditSiteForm();


    const siteName =
        getSiteName(site);

    const siteDescription =
        getSiteDescription(site);


    siteBeingEdited =
        site;


    editSiteName.value =
        siteName.textContent.trim();

    editSiteUrl.value =
        site.dataset.url || "";

    editSiteDescription.value =
        siteDescription.textContent.trim();


    openOverlay(editSiteOverlay);


    editSiteName.focus();
    editSiteName.select();

}


// =========================================
// CERRAR EDICIÓN DE SITIO
// =========================================

function closeEditSite() {

    closeOverlay(editSiteOverlay);

    siteBeingEdited =
        null;

    resetEditSiteForm();

}


closeEditSiteButton.addEventListener(
    "click",
    closeEditSite
);


cancelEditSiteButton.addEventListener(
    "click",
    closeEditSite
);


editSiteOverlay.addEventListener(
    "click",
    (event) => {

        if (event.target === editSiteOverlay) {

            closeEditSite();

        }

    }
);


// =========================================
// EDITAR SITIOS EXISTENTES
// =========================================

document
    .querySelectorAll(".edit-site-button")
    .forEach((button) => {

        button.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                const site =
                    button.closest(".site-card");


                openEditSite(site);


                closeMenu(
                    site.querySelector(".site-menu")
                );

            }
        );

    });


// =========================================
// GUARDAR CAMBIOS DEL SITIO
// =========================================

saveEditSiteButton.addEventListener(
    "click",
    async () => {

        const newName =
            editSiteName.value.trim();

        let newUrl =
            editSiteUrl.value.trim();

        const newDescription =
            editSiteDescription.value.trim();


        clearEditSiteErrors();


        // Validar nombre
        if (newName === "") {

            editSiteNameError.textContent =
                "Por favor, introduce un nombre.";

            return;

        }


        // Validar URL
        if (newUrl === "") {

            editSiteUrlError.textContent =
                "Por favor, introduce una URL.";

            return;

        }


        // Agregar https
        if (
            !newUrl.startsWith("http://") &&
            !newUrl.startsWith("https://")
        ) {

            newUrl =
                "https://" + newUrl;

        }


        // Validar URL
        try {

            const url =
                new URL(newUrl);


            if (!url.hostname.includes(".")) {

                editSiteUrlError.textContent =
                    "Introduce una URL válida.";

                return;

            }

        } catch {

            editSiteUrlError.textContent =
                "Introduce una URL válida.";

            return;

        }


        // Obtener elementos
        const siteName =
            getSiteName(siteBeingEdited);

        const siteDescription =
            getSiteDescription(siteBeingEdited);


        // Actualizar
        siteName.textContent =
            newName;

        siteBeingEdited.dataset.url =
            newUrl;

        siteDescription.textContent =
            newDescription;


        // Guardar
        await saveCurrentData();


        closeEditSite();

    }
);


// =========================================
// EDITAR GRUPO
// =========================================

// Elementos
const editGroupOverlay =
    document.getElementById("edit-group-overlay");

const editGroupName =
    document.getElementById("edit-group-name");

const editGroupNameError =
    document.getElementById("edit-group-name-error");

const closeEditGroupButton =
    document.getElementById("close-edit-group-button");

const cancelEditGroupButton =
    document.getElementById("cancel-edit-group-button");

const saveEditGroupButton =
    document.getElementById("save-edit-group-button");


// Grupo que se está editando
let groupBeingEdited =
    null;


// =========================================
// FORMULARIO EDITAR GRUPO
// =========================================

// Limpiar errores
function clearEditGroupErrors() {

    editGroupNameError.textContent = "";

}


// Limpiar formulario
function resetEditGroupForm() {

    editGroupName.value = "";

    clearEditGroupErrors();

}


// =========================================
// ABRIR EDICIÓN DE GRUPO
// =========================================

function openEditGroup(group) {

    groupBeingEdited =
        group;


    const groupTitle =
        getGroupTitle(group);


    resetEditGroupForm();


    editGroupName.value =
        groupTitle.textContent.trim();


    openOverlay(editGroupOverlay);


    closeMenu(
        group.querySelector(".group-menu")
    );


    editGroupName.focus();
    editGroupName.select();

}


// =========================================
// CERRAR EDICIÓN DE GRUPO
// =========================================

function closeEditGroup() {

    closeOverlay(editGroupOverlay);

    groupBeingEdited =
        null;

    resetEditGroupForm();

}


closeEditGroupButton.addEventListener(
    "click",
    closeEditGroup
);


cancelEditGroupButton.addEventListener(
    "click",
    closeEditGroup
);


editGroupOverlay.addEventListener(
    "click",
    (event) => {

        if (event.target === editGroupOverlay) {

            closeEditGroup();

        }

    }
);


// =========================================
// EDITAR GRUPOS EXISTENTES
// =========================================

document
    .querySelectorAll(".edit-group-button")
    .forEach((button) => {

        button.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                const group =
                    button.closest(".site-group");


                openEditGroup(group);

            }
        );

    });


// =========================================
// GUARDAR CAMBIOS DEL GRUPO
// =========================================

saveEditGroupButton.addEventListener(
    "click",
    async () => {

        const newName =
            editGroupName.value.trim();


        clearEditGroupErrors();


        // Validar nombre
        if (newName === "") {

            editGroupNameError.textContent =
                "Por favor, introduce un nombre.";

            return;

        }


        const groupTitle =
            getGroupTitle(groupBeingEdited);


        groupTitle.textContent =
            newName;


        // Guardar
        await saveCurrentData();


        closeEditGroup();

    }
);


// =========================================
// DATOS INICIALES
// =========================================

const defaultData = {

    groups: []

};


// =========================================
// GUARDAR DATOS
// =========================================

function saveData(data) {

    return chrome.storage.local.set(
        data
    );

}


// =========================================
// CARGAR DATOS
// =========================================

function loadData() {

    return chrome.storage.local.get(
        "groups"
    );

}


// =========================================
// OBTENER DATOS DEL HTML
// =========================================

function getGroupsData() {

    const groups = [];


    const groupElements =
        document.querySelectorAll(".site-group");


    groupElements.forEach(
        (groupElement) => {

            const group = {

                name:
                    groupElement
                        .querySelector("h2")
                        .textContent
                        .trim(),

                sites: []

            };


            const siteElements =
                groupElement.querySelectorAll(
                    ".site-card"
                );


            siteElements.forEach(
                (siteElement) => {

                    const site = {

                        name:
                            siteElement
                                .querySelector(".site-name")
                                .textContent
                                .trim(),

                        url:
                            siteElement.dataset.url,

                        description:
                            siteElement
                                .querySelector(".site-description")
                                .textContent
                                .trim()

                    };


                    group.sites.push(site);

                }
            );


            groups.push(group);

        }
    );


    return groups;

}


// =========================================
// GUARDAR ESTADO ACTUAL
// =========================================

async function saveCurrentData() {

    const groups =
        getGroupsData();


    await saveData({

        groups: groups

    });

}


// =========================================
// MOSTRAR GRUPOS Y SITIOS
// =========================================

function renderGroups(groups) {

    const main =
        document.querySelector("main");


    groups.forEach(
        (groupData) => {

            // Crear grupo
            const group =
                createGroup(
                    groupData.name
                );


            // Obtener contenedor de sitios
            const sitesContainer =
                group.querySelector(
                    ".sites-container"
                );


            // Obtener tarjeta "+ Agregar sitio"
            const addSiteCard =
                group.querySelector(
                    ".add-site-card"
                );


            // Crear sitios
            groupData.sites.forEach(
                (siteData) => {

                    const site =
                        createSiteCard(
                            siteData.name,
                            siteData.url,
                            siteData.description
                        );


                    sitesContainer.insertBefore(
                        site,
                        addSiteCard
                    );

                }
            );


            // Agregar grupo al HTML
            main.appendChild(
                group
            );

        }
    );

}


// =========================================
// INICIAR EXTENSIÓN
// =========================================

async function init() {

    let data =
        await loadData();


    // Primera ejecución
    if (!data.groups) {

        const initialGroups =
            getGroupsData();


        await saveData({

            groups: initialGroups

        });


        data = {

            groups: initialGroups

        };

    }


    console.log(
        "Datos cargados:",
        data
    );


    // Eliminar los grupos escritos directamente
    // en newtab.html
    const main =
        document.querySelector("main");


    main.innerHTML = "";


    // Dibujar los grupos desde Storage
    renderGroups(
        data.groups
    );

}


// Iniciar
init();

