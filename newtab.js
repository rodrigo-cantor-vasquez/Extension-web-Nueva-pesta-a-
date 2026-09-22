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

    if (!menu) {
        return;
    }

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

    if (!menu) {
        return;
    }

    menu.style.display = "none";

}


// =========================================
// FUNCIONES PARA OBTENER ELEMENTOS
// =========================================

function getSiteName(site) {

    return site.querySelector(".site-name");

}


function getSiteDescription(site) {

    return site.querySelector(".site-description");

}


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
// DATOS INICIALES
// =========================================

const defaultSettings = {

    cardSize: 95,

    backgroundType: "solid",
    backgroundColor: "#eef4ff",

    gradientDirection: 90,

    gradientColors: [
        "#eef4ff",
        "#d6e3ff"
    ],

    groupColor: "#ffffff",
    groupTransparency: 0,

    cardColor: "#f8faff",
    cardTransparency: 0

};


const defaultData = {

    groups: [
        {
            name: "Mis sitios",

            sites: [
                {
                    name: "Google",
                    url: "https://www.google.com",
                    description: "Motor de búsqueda"
                }
            ]
        }
    ],

    settings: {

        ...defaultSettings,

        gradientColors: [
            ...defaultSettings.gradientColors
        ]

    }

};


// =========================================
// GUARDAR DATOS
// =========================================

function saveData(data) {

    return chrome.storage.local.set(data);

}


// =========================================
// CARGAR DATOS
// =========================================

function loadData() {

    return chrome.storage.local.get([
        "groups",
        "settings"
    ]);

}


// =========================================
// OBTENER DATOS DEL HTML
// =========================================

function getGroupsData() {

    const groups = [];


    const groupElements =
        document.querySelectorAll(".site-group");


    groupElements.forEach((groupElement) => {

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


        siteElements.forEach((siteElement) => {

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

        });


        groups.push(group);

    });


    return groups;

}


// =========================================
// GUARDAR ESTADO ACTUAL
// =========================================

async function saveCurrentData() {

    const groups =
        getGroupsData();


    const data =
        await loadData();


    const settings = {

        ...defaultSettings,

        ...data.settings

    };


    await saveData({

        groups: groups,

        settings: settings

    });

}


// =========================================
// CONVERTIR HEX A RGBA
// =========================================

function hexToRgba(
    hex,
    transparency
) {

    const cleanHex =
        hex.replace("#", "");


    const r =
        parseInt(
            cleanHex.substring(0, 2),
            16
        );


    const g =
        parseInt(
            cleanHex.substring(2, 4),
            16
        );


    const b =
        parseInt(
            cleanHex.substring(4, 6),
            16
        );


    let validTransparency =
        Number(transparency);


    if (isNaN(validTransparency)) {

        validTransparency = 0;

    }


    if (validTransparency < 0) {

        validTransparency = 0;

    }


    if (validTransparency > 100) {

        validTransparency = 100;

    }


    const alpha =
        1 - (validTransparency / 100);


    return `rgba(${r}, ${g}, ${b}, ${alpha})`;

}


// =========================================
// PANEL DE CONFIGURACIÓN
// =========================================

const settingsButton =
    document.getElementById("settings-button");

const settingsPanel =
    document.getElementById("settings-panel");

const closeSettingsButton =
    document.getElementById("close-settings-button");

const settingsOverlay =
    document.getElementById("settings-overlay");


settingsButton.addEventListener("click", () => {

    settingsPanel.style.transform =
        "translateX(0)";

    openOverlay(settingsOverlay);

});


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

function setupGroupMenu(group) {

    const menuButton =
        group.querySelector(".group-menu-button");

    const menu =
        group.querySelector(".group-menu");


    if (!menuButton || !menu) {

        return;

    }


    // Evitar registrar el evento dos veces
    if (
        menuButton.dataset.menuConfigured === "true"
    ) {

        return;

    }


    menuButton.dataset.menuConfigured =
        "true";


    menuButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

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


// =========================================
// MENÚS DE LOS SITIOS
// =========================================

function setupSiteCard(site) {

    const menuButton =
        site.querySelector(".site-menu-button");

    const menu =
        site.querySelector(".site-menu");


    // Evitar registrar el evento general
    // de la tarjeta dos veces
    if (
        site.dataset.cardConfigured !== "true"
    ) {

        site.dataset.cardConfigured =
            "true";


        site.addEventListener(
            "click",
            () => {

                openSite(site);

            }
        );

    }


    if (!menuButton || !menu) {

        return;

    }


    // Evitar registrar el menú dos veces
    if (
        menuButton.dataset.menuConfigured === "true"
    ) {

        return;

    }


    menuButton.dataset.menuConfigured =
        "true";


    menuButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

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


// Cerrar menús al hacer clic afuera
document.addEventListener(
    "click",
    () => {

        closeAllMenus();

    }
);


// =========================================
// AGREGAR SITIO
// =========================================

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


let groupBeingAddedTo =
    null;


// =========================================
// FORMULARIO AGREGAR SITIO
// =========================================

function clearAddSiteErrors() {

    addSiteNameError.textContent = "";
    addSiteUrlError.textContent = "";

}


function resetAddSiteForm() {

    addSiteName.value = "";
    addSiteUrl.value = "";
    addSiteDescription.value = "";

    clearAddSiteErrors();

}


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


    // ICONO
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


    siteIconImage.addEventListener(
        "error",
        () => {

            siteIconImage.remove();

            siteIcon.textContent =
                "🌐";

        }
    );


    siteIcon.appendChild(
        siteIconImage
    );


    // NOMBRE
    const siteName =
        document.createElement("span");

    siteName.className =
        "site-name";

    siteName.textContent =
        name;


    // DESCRIPCIÓN
    const siteDescription =
        document.createElement("div");

    siteDescription.className =
        "site-description";

    siteDescription.textContent =
        description;


    // BOTÓN MENÚ
    const siteMenuButton =
        document.createElement("button");

    siteMenuButton.type =
        "button";

    siteMenuButton.className =
        "site-menu-button";

    siteMenuButton.textContent =
        "⋮";


    // MENÚ
    const siteMenu =
        document.createElement("div");

    siteMenu.className =
        "site-menu";


    const editSiteButton =
        document.createElement("button");

    editSiteButton.type =
        "button";

    editSiteButton.className =
        "edit-site-button";

    editSiteButton.innerHTML = `
        <span class="menu-icon">✏️</span>
        Editar sitio
    `;


    const deleteSiteButton =
        document.createElement("button");

    deleteSiteButton.type =
        "button";

    deleteSiteButton.className =
        "delete-site-button";

    deleteSiteButton.innerHTML = `
        <span class="menu-icon">🗑️</span>
        Eliminar sitio
    `;


    siteMenu.appendChild(
        editSiteButton
    );

    siteMenu.appendChild(
        deleteSiteButton
    );


    site.appendChild(siteIcon);
    site.appendChild(siteName);
    site.appendChild(siteDescription);
    site.appendChild(siteMenuButton);
    site.appendChild(siteMenu);


    // Configurar tarjeta y menú
    setupSiteCard(site);


    // EDITAR SITIO
    editSiteButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();

            openEditSite(site);

            closeMenu(siteMenu);

        }
    );


    // ELIMINAR SITIO
    deleteSiteButton.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();

            event.stopPropagation();

            site.remove();

            await saveCurrentData();

            closeMenu(siteMenu);

        }
    );


    return site;

}


// =========================================
// BOTONES "+ AGREGAR SITIO"
// =========================================

function setupAddSiteCard(addSiteCard) {

    if (
        addSiteCard.dataset.addConfigured === "true"
    ) {

        return;

    }


    addSiteCard.dataset.addConfigured =
        "true";


    addSiteCard.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

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


// =========================================
// BOTÓN GLOBAL AGREGAR SITIO
// =========================================

const addSiteButton =
    document.getElementById("add-site-button");


addSiteButton.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

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


        if (newName === "") {

            addSiteNameError.textContent =
                "Por favor, introduce un nombre.";

            return;

        }


        if (newUrl === "") {

            addSiteUrlError.textContent =
                "Por favor, introduce una URL.";

            return;

        }


        if (
            !newUrl.startsWith("http://") &&
            !newUrl.startsWith("https://")
        ) {

            newUrl =
                "https://" + newUrl;

        }


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


        if (groupBeingAddedTo === null) {

            groupBeingAddedTo =
                findGroupByName(
                    addSiteGroup.value
                );

        }


        if (!groupBeingAddedTo) {

            return;

        }


        const sitesContainer =
            groupBeingAddedTo.querySelector(
                ".sites-container"
            );


        const newSite =
            createSiteCard(
                newName,
                newUrl,
                newDescription
            );


        const addSiteCard =
            groupBeingAddedTo.querySelector(
                ".add-site-card"
            );


        sitesContainer.insertBefore(
            newSite,
            addSiteCard
        );


        applyCardAppearance(
            cardColorInput.value,
            cardTransparencyInput.value
        );


        await saveCurrentData();


        closeAddSite();

    }
);


// =========================================
// AGREGAR GRUPO
// =========================================

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


function clearAddGroupErrors() {

    addGroupNameError.textContent = "";

}


function resetAddGroupForm() {

    addGroupName.value = "";

    clearAddGroupErrors();

}


function openAddGroup() {

    resetAddGroupForm();

    openOverlay(addGroupOverlay);

    addGroupName.focus();

}


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

    groupMenuButton.type =
        "button";

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


    const groupMenu =
        document.createElement("div");

    groupMenu.className =
        "group-menu";


    const editGroupButton =
        document.createElement("button");

    editGroupButton.type =
        "button";

    editGroupButton.className =
        "edit-group-button";

    editGroupButton.innerHTML = `
        <span class="menu-icon">✏️</span>
        Editar grupo
    `;


    const deleteGroupButton =
        document.createElement("button");

    deleteGroupButton.type =
        "button";

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


    const sitesContainer =
        document.createElement("div");

    sitesContainer.className =
        "sites-container";


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


    // Configurar menú del grupo
    setupGroupMenu(group);

    // Configurar tarjeta para agregar sitio
    setupAddSiteCard(addSiteCard);


    // EDITAR GRUPO
    editGroupButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();

            openEditGroup(group);

            closeMenu(groupMenu);

        }
    );


    // ELIMINAR GRUPO
    deleteGroupButton.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();

            event.stopPropagation();

            group.remove();

            await saveCurrentData();

            closeMenu(groupMenu);

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


        if (newName === "") {

            addGroupNameError.textContent =
                "Por favor, introduce un nombre.";

            return;

        }


        const newGroup =
            createGroup(newName);


        const main =
            document.querySelector("main");


        main.appendChild(
            newGroup
        );


        applyGroupAppearance(
            groupColorInput.value,
            groupTransparencyInput.value
        );


        await saveCurrentData();


        closeAddGroup();

    }
);


// =========================================
// EDITAR SITIO
// =========================================

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


let siteBeingEdited =
    null;


function clearEditSiteErrors() {

    editSiteNameError.textContent = "";
    editSiteUrlError.textContent = "";

}


function resetEditSiteForm() {

    editSiteName.value = "";
    editSiteUrl.value = "";
    editSiteDescription.value = "";

    clearEditSiteErrors();

}


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

function setupExistingSiteEditButtons() {

    document
        .querySelectorAll(".edit-site-button")
        .forEach((button) => {

            if (
                button.dataset.editConfigured === "true"
            ) {

                return;

            }


            button.dataset.editConfigured =
                "true";


            button.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

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

}


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


        if (newName === "") {

            editSiteNameError.textContent =
                "Por favor, introduce un nombre.";

            return;

        }


        if (newUrl === "") {

            editSiteUrlError.textContent =
                "Por favor, introduce una URL.";

            return;

        }


        if (
            !newUrl.startsWith("http://") &&
            !newUrl.startsWith("https://")
        ) {

            newUrl =
                "https://" + newUrl;

        }


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


        const siteName =
            getSiteName(siteBeingEdited);

        const siteDescription =
            getSiteDescription(siteBeingEdited);


        siteName.textContent =
            newName;

        siteBeingEdited.dataset.url =
            newUrl;

        siteDescription.textContent =
            newDescription;


        const siteIconImage =
            siteBeingEdited.querySelector(
                ".site-icon img"
            );


        if (siteIconImage) {

            siteIconImage.src =
                new URL(
                    "/favicon.ico",
                    newUrl
                ).href;

        }


        await saveCurrentData();


        closeEditSite();

    }
);


// =========================================
// EDITAR GRUPO
// =========================================

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


let groupBeingEdited =
    null;


function clearEditGroupErrors() {

    editGroupNameError.textContent = "";

}


function resetEditGroupForm() {

    editGroupName.value = "";

    clearEditGroupErrors();

}


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

function setupExistingGroupEditButtons() {

    document
        .querySelectorAll(".edit-group-button")
        .forEach((button) => {

            if (
                button.dataset.editConfigured === "true"
            ) {

                return;

            }


            button.dataset.editConfigured =
                "true";


            button.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    event.stopPropagation();


                    const group =
                        button.closest(".site-group");


                    openEditGroup(group);

                }
            );

        });

}


// =========================================
// GUARDAR CAMBIOS DEL GRUPO
// =========================================

saveEditGroupButton.addEventListener(
    "click",
    async () => {

        const newName =
            editGroupName.value.trim();


        clearEditGroupErrors();


        if (newName === "") {

            editGroupNameError.textContent =
                "Por favor, introduce un nombre.";

            return;

        }


        const groupTitle =
            getGroupTitle(groupBeingEdited);


        groupTitle.textContent =
            newName;


        await saveCurrentData();


        closeEditGroup();

    }
);


// =========================================
// MOSTRAR GRUPOS Y SITIOS
// =========================================

function renderGroups(groups) {

    const main =
        document.querySelector("main");


    groups.forEach((groupData) => {

        const group =
            createGroup(
                groupData.name
            );


        const sitesContainer =
            group.querySelector(
                ".sites-container"
            );


        const addSiteCard =
            group.querySelector(
                ".add-site-card"
            );


        (groupData.sites || []).forEach(
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


        main.appendChild(
            group
        );

    });

}


// =========================================
// TAMAÑO DE LAS TARJETAS
// =========================================

const cardSizeInput =
    document.getElementById("card-size");


function applyCardSize(size) {

    let validSize =
        Number(size);


    if (isNaN(validSize)) {

        validSize =
            defaultSettings.cardSize;

    }


    if (validSize < 95) {

        validSize = 95;

    }


    if (validSize > 140) {

        validSize = 140;

    }


    document
        .querySelectorAll(
            ".site-card, .add-site-card"
        )
        .forEach((card) => {

            card.style.width =
                `${validSize}px`;

            card.style.height =
                `${validSize}px`;

        });


    cardSizeInput.value =
        validSize;

}


cardSizeInput.addEventListener(
    "change",
    async () => {

        applyCardSize(
            cardSizeInput.value
        );


        const data =
            await loadData();


        await saveData({

            settings: {

                ...defaultSettings,

                ...data.settings,

                cardSize:
                    Number(
                        cardSizeInput.value
                    )

            }

        });

    }
);


// =========================================
// COLOR Y TRANSPARENCIA DE LOS GRUPOS
// =========================================

const groupColorInput =
    document.getElementById("group-color");

const groupTransparencyInput =
    document.getElementById(
        "group-transparency"
    );

const groupTransparencyValue =
    document.getElementById(
        "group-transparency-value"
    );


function applyGroupAppearance(
    color,
    transparency
) {

    const rgba =
        hexToRgba(
            color,
            transparency
        );


    document
        .querySelectorAll(".site-group")
        .forEach((group) => {

            group.style.backgroundColor =
                rgba;

        });


    groupColorInput.value =
        color;

    groupTransparencyInput.value =
        transparency;

    groupTransparencyValue.textContent =
        `${transparency}%`;

}


groupColorInput.addEventListener(
    "input",
    async () => {

        const color =
            groupColorInput.value;

        const transparency =
            groupTransparencyInput.value;


        applyGroupAppearance(
            color,
            transparency
        );


        const data =
            await loadData();


        await saveData({

            settings: {

                ...defaultSettings,

                ...data.settings,

                groupColor:
                    color,

                groupTransparency:
                    Number(transparency)

            }

        });

    }
);


groupTransparencyInput.addEventListener(
    "input",
    async () => {

        const color =
            groupColorInput.value;

        const transparency =
            Number(
                groupTransparencyInput.value
            );


        applyGroupAppearance(
            color,
            transparency
        );


        const data =
            await loadData();


        await saveData({

            settings: {

                ...defaultSettings,

                ...data.settings,

                groupColor:
                    color,

                groupTransparency:
                    transparency

            }

        });

    }
);


// =========================================
// COLOR Y TRANSPARENCIA DE LAS TARJETAS
// =========================================

const cardColorInput =
    document.getElementById("card-color");

const cardTransparencyInput =
    document.getElementById(
        "card-transparency"
    );

const cardTransparencyValue =
    document.getElementById(
        "card-transparency-value"
    );


function applyCardAppearance(
    color,
    transparency
) {

    const rgba =
        hexToRgba(
            color,
            transparency
        );


    document
        .querySelectorAll(
            ".site-card, .add-site-card"
        )
        .forEach((card) => {

            card.style.backgroundColor =
                rgba;

        });


    cardColorInput.value =
        color;

    cardTransparencyInput.value =
        transparency;

    cardTransparencyValue.textContent =
        `${transparency}%`;

}


cardColorInput.addEventListener(
    "input",
    async () => {

        const color =
            cardColorInput.value;

        const transparency =
            cardTransparencyInput.value;


        applyCardAppearance(
            color,
            transparency
        );


        const data =
            await loadData();


        await saveData({

            settings: {

                ...defaultSettings,

                ...data.settings,

                cardColor:
                    color,

                cardTransparency:
                    Number(transparency)

            }

        });

    }
);


cardTransparencyInput.addEventListener(
    "input",
    async () => {

        const color =
            cardColorInput.value;

        const transparency =
            Number(
                cardTransparencyInput.value
            );


        applyCardAppearance(
            color,
            transparency
        );


        const data =
            await loadData();


        await saveData({

            settings: {

                ...defaultSettings,

                ...data.settings,

                cardColor:
                    color,

                cardTransparency:
                    transparency

            }

        });

    }
);


// =========================================
// COLOR DE FONDO
// =========================================

const backgroundColorInput =
    document.getElementById(
        "background-color"
    );


function applyBackgroundColor(color) {

    document.body.style.backgroundColor =
        color;

    document.body.style.backgroundImage =
        "none";

}


backgroundColorInput.addEventListener(
    "input",
    async () => {

        const color =
            backgroundColorInput.value;


        applyBackgroundColor(
            color
        );


        const data =
            await loadData();


        await saveData({

            settings: {

                ...defaultSettings,

                ...data.settings,

                backgroundColor:
                    color

            }

        });

    }
);


// =========================================
// IMAGEN DE FONDO
// =========================================

const backgroundImageInput =
    document.getElementById(
        "background-image-file"
    );


let pendingBackgroundImage =
    null;


function imageToDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = () => {

                resolve(
                    reader.result
                );

            };


            reader.onerror = () => {

                reject(
                    reader.error
                );

            };


            reader.readAsDataURL(
                file
            );

        }
    );

}


function applyBackgroundImage(imageData) {

    return new Promise(
        (resolve) => {

            const image =
                new Image();


            image.onload = () => {

                document.body.style.backgroundImage =
                    `url("${imageData}")`;

                document.body.style.backgroundColor =
                    "transparent";

                document.body.style.backgroundSize =
                    "cover";

                document.body.style.backgroundPosition =
                    "center";

                document.body.style.backgroundRepeat =
                    "no-repeat";


                resolve(true);

            };


            image.onerror = () => {

                resolve(false);

            };


            image.src =
                imageData;

        }
    );

}


backgroundImageInput.addEventListener(
    "change",
    async () => {

        const file =
            backgroundImageInput.files[0];


        if (!file) {

            return;

        }


        pendingBackgroundImage =
            await imageToDataURL(file);


        const imageLoaded =
            await applyBackgroundImage(
                pendingBackgroundImage
            );


        if (!imageLoaded) {

            pendingBackgroundImage =
                null;

            return;

        }


        document.getElementById(
            "background-image"
        ).checked = true;


        document.getElementById(
            "background-solid"
        ).checked = false;


        document.getElementById(
            "background-gradient"
        ).checked = false;


        const data =
            await loadData();


        await saveData({

            settings: {

                ...defaultSettings,

                ...data.settings,

                backgroundType:
                    "image",

                backgroundImage:
                    pendingBackgroundImage

            }

        });

    }
);


// =========================================
// DEGRADADO
// =========================================

const gradientDirectionInput =
    document.getElementById(
        "gradient-direction"
    );


const gradientColorsContainer =
    document.getElementById(
        "gradient-colors"
    );


const addGradientColorButton =
    document.getElementById(
        "add-gradient-color-button"
    );


function getGradientColors() {

    const colorInputs =
        gradientColorsContainer.querySelectorAll(
            'input[type="color"]'
        );


    return Array.from(colorInputs)
        .map(
            (input) => input.value
        );

}


function createGradientCSS(
    direction,
    colors
) {

    return `linear-gradient(${direction}deg, ${colors.join(", ")})`;

}


function applyGradient(
    direction,
    colors
) {

    if (
        !colors ||
        colors.length < 2
    ) {

        return;

    }


    document.body.style.backgroundColor =
        "transparent";


    document.body.style.backgroundImage =
        createGradientCSS(
            direction,
            colors
        );


    document.body.style.backgroundSize =
        "cover";

}


async function saveGradientSettings() {

    const direction =
        Number(
            gradientDirectionInput.value
        );


    const colors =
        getGradientColors();


    const data =
        await loadData();


    await saveData({

        settings: {

            ...defaultSettings,

            ...data.settings,

            backgroundType:
                "gradient",

            gradientDirection:
                direction,

            gradientColors:
                colors

        }

    });

}


function createGradientColor(
    color,
    index
) {

    const gradientColor =
        document.createElement("div");

    gradientColor.className =
        "gradient-color";


    const label =
        document.createElement("label");

    label.textContent =
        `Color ${index}`;


    const controls =
        document.createElement("div");

    controls.className =
        "gradient-color-controls";


    const colorInput =
        document.createElement("input");

    colorInput.type =
        "color";

    colorInput.value =
        color;


    const removeButton =
        document.createElement("button");

    removeButton.type =
        "button";

    removeButton.className =
        "remove-gradient-color-button";

    removeButton.setAttribute(
        "aria-label",
        `Eliminar color ${index}`
    );

    removeButton.textContent =
        "×";


    colorInput.addEventListener(
        "input",
        async () => {

            const backgroundGradient =
                document.getElementById(
                    "background-gradient"
                );


            if (
                backgroundGradient.checked
            ) {

                applyGradient(
                    gradientDirectionInput.value,
                    getGradientColors()
                );

            }


            await saveGradientSettings();

        }
    );


    removeButton.addEventListener(
        "click",
        async () => {

            const colorInputs =
                gradientColorsContainer.querySelectorAll(
                    'input[type="color"]'
                );


            if (
                colorInputs.length <= 2
            ) {

                return;

            }


            gradientColor.remove();


            updateGradientColorLabels();


            const backgroundGradient =
                document.getElementById(
                    "background-gradient"
                );


            if (
                backgroundGradient.checked
            ) {

                applyGradient(
                    gradientDirectionInput.value,
                    getGradientColors()
                );

            }


            await saveGradientSettings();

        }
    );


    controls.appendChild(
        colorInput
    );

    controls.appendChild(
        removeButton
    );


    gradientColor.appendChild(
        label
    );

    gradientColor.appendChild(
        controls
    );


    return gradientColor;

}


function updateGradientColorLabels() {

    const gradientColors =
        gradientColorsContainer.querySelectorAll(
            ".gradient-color"
        );


    gradientColors.forEach(
        (gradientColor, index) => {

            const label =
                gradientColor.querySelector(
                    "label"
                );

            const removeButton =
                gradientColor.querySelector(
                    ".remove-gradient-color-button"
                );


            const number =
                index + 1;


            label.textContent =
                `Color ${number}`;


            removeButton.setAttribute(
                "aria-label",
                `Eliminar color ${number}`
            );

        }
    );

}


addGradientColorButton.addEventListener(
    "click",
    async () => {

        const colors =
            getGradientColors();


        const lastColor =
            colors[
                colors.length - 1
            ] ??
            "#ffffff";


        const newColor =
            createGradientColor(
                lastColor,
                colors.length + 1
            );


        gradientColorsContainer.appendChild(
            newColor
        );


        updateGradientColorLabels();


        const backgroundGradient =
            document.getElementById(
                "background-gradient"
            );


        if (
            backgroundGradient.checked
        ) {

            applyGradient(
                gradientDirectionInput.value,
                getGradientColors()
            );

        }


        await saveGradientSettings();

    }
);


gradientDirectionInput.addEventListener(
    "change",
    async () => {

        const backgroundGradient =
            document.getElementById(
                "background-gradient"
            );


        if (
            backgroundGradient.checked
        ) {

            applyGradient(
                gradientDirectionInput.value,
                getGradientColors()
            );

        }


        await saveGradientSettings();

    }
);


function loadGradientColors(colors) {

    gradientColorsContainer.innerHTML = "";


    const gradientColorList =
        colors &&
        colors.length >= 2
            ? colors
            : defaultSettings.gradientColors;


    gradientColorList.forEach(
        (color, index) => {

            const gradientColor =
                createGradientColor(
                    color,
                    index + 1
                );


            gradientColorsContainer.appendChild(
                gradientColor
            );

        }
    );


    updateGradientColorLabels();

}


// =========================================
// TIPO DE FONDO
// =========================================

const backgroundTypeInputs =
    document.querySelectorAll(
        'input[name="background-type"]'
    );


backgroundTypeInputs.forEach(
    (radio) => {

        radio.addEventListener(
            "change",
            async () => {

                // COLOR SÓLIDO
                if (
                    radio.value === "solid"
                ) {

                    const data =
                        await loadData();


                    const backgroundColor =
                        data.settings?.backgroundColor ??
                        defaultSettings.backgroundColor;


                    applyBackgroundColor(
                        backgroundColor
                    );


                    document.getElementById(
                        "background-solid"
                    ).checked = true;


                    backgroundColorInput.value =
                        backgroundColor;


                    pendingBackgroundImage =
                        null;


                    await saveData({

                        settings: {

                            ...defaultSettings,

                            ...data.settings,

                            backgroundType:
                                "solid"

                        }

                    });

                }


                // IMAGEN
                if (
                    radio.value === "image"
                ) {

                    const data =
                        await loadData();


                    const backgroundImage =
                        pendingBackgroundImage ??
                        data.settings?.backgroundImage;


                    if (backgroundImage) {

                        const imageLoaded =
                            await applyBackgroundImage(
                                backgroundImage
                            );


                        if (imageLoaded) {

                            await saveData({

                                settings: {

                                    ...defaultSettings,

                                    ...data.settings,

                                    backgroundType:
                                        "image",

                                    backgroundImage:
                                        backgroundImage

                                }

                            });

                        }


                        else {

                            const backgroundColor =
                                data.settings?.backgroundColor ??
                                defaultSettings.backgroundColor;


                            radio.checked =
                                false;


                            document.getElementById(
                                "background-solid"
                            ).checked = true;


                            applyBackgroundColor(
                                backgroundColor
                            );


                            backgroundColorInput.value =
                                backgroundColor;


                            pendingBackgroundImage =
                                null;


                            await saveData({

                                settings: {

                                    ...defaultSettings,

                                    ...data.settings,

                                    backgroundType:
                                        "solid"

                                }

                            });

                        }

                    }


                    else {

                        radio.checked =
                            false;


                        document.getElementById(
                            "background-solid"
                        ).checked = true;


                        const backgroundColor =
                            data.settings?.backgroundColor ??
                            defaultSettings.backgroundColor;


                        applyBackgroundColor(
                            backgroundColor
                        );


                        backgroundColorInput.value =
                            backgroundColor;


                        await saveData({

                            settings: {

                                ...defaultSettings,

                                ...data.settings,

                                backgroundType:
                                    "solid"

                            }

                        });

                    }

                }


                // DEGRADADO
                if (
                    radio.value === "gradient"
                ) {

                    const data =
                        await loadData();


                    const direction =
                        data.settings?.gradientDirection ??
                        defaultSettings.gradientDirection;


                    const colors =
                        data.settings?.gradientColors ??
                        defaultSettings.gradientColors;


                    gradientDirectionInput.value =
                        direction;


                    loadGradientColors(
                        colors
                    );


                    applyGradient(
                        direction,
                        colors
                    );


                    pendingBackgroundImage =
                        null;


                    await saveData({

                        settings: {

                            ...defaultSettings,

                            ...data.settings,

                            backgroundType:
                                "gradient",

                            gradientDirection:
                                direction,

                            gradientColors:
                                colors

                        }

                    });

                }

            }
        );

    }
);


// =========================================
// REINICIAR CONFIGURACIÓN
// =========================================

const resetBackgroundButton =
    document.getElementById(
        "reset-background-button"
    );


// =========================================
// MODAL DE CONFIRMACIÓN
// =========================================

const resetConfirmationOverlay =
    document.getElementById(
        "reset-confirmation-overlay"
    );

const closeResetConfirmationButton =
    document.getElementById(
        "close-reset-confirmation-button"
    );

const cancelResetButton =
    document.getElementById(
        "cancel-reset-button"
    );

const confirmResetButton =
    document.getElementById(
        "confirm-reset-button"
    );


// =========================================
// ABRIR CONFIRMACIÓN
// =========================================

function openResetConfirmation() {

    openOverlay(
        resetConfirmationOverlay
    );

}


// =========================================
// CERRAR CONFIRMACIÓN
// =========================================

function closeResetConfirmation() {

    closeOverlay(
        resetConfirmationOverlay
    );

}


async function resetExtension() {

    // =====================================
    // 1. CERRAR MENÚS
    // =====================================

    closeAllMenus();


    // =====================================
    // 2. CERRAR VENTANAS
    // =====================================

    closeOverlay(addSiteOverlay);
    closeOverlay(addGroupOverlay);
    closeOverlay(editSiteOverlay);
    closeOverlay(editGroupOverlay);
    closeOverlay(resetConfirmationOverlay);


    // =====================================
    // 3. REINICIAR ESTADOS INTERNOS
    // =====================================

    groupBeingAddedTo =
        null;

    siteBeingEdited =
        null;

    groupBeingEdited =
        null;

    pendingBackgroundImage =
        null;


    // =====================================
    // 4. BORRAR TODO EL STORAGE
    // =====================================

    await chrome.storage.local.clear();


    // =====================================
    // 5. CREAR DATOS INICIALES
    // =====================================

    const resetData = {

        groups: [
            {
                name: "Mis sitios",

                sites: [
                    {
                        name: "Google",
                        url: "https://www.google.com",
                        description: "Motor de búsqueda"
                    }
                ]
            }
        ],

        settings: {

            ...defaultSettings,

            gradientColors: [
                ...defaultSettings.gradientColors
            ]

        }

    };


    // =====================================
    // 6. GUARDAR DATOS INICIALES
    // =====================================

    await saveData(
        resetData
    );


    // =====================================
    // 7. LIMPIAR MAIN
    // =====================================

    const main =
        document.querySelector("main");


    main.innerHTML = "";


    // =====================================
    // 8. CREAR GRUPO Y TARJETA
    // =====================================

    renderGroups(
        resetData.groups
    );


    // =====================================
    // 9. CONFIGURAR EVENTOS
    // =====================================

    setupExistingElements();


    // =====================================
    // 10. RESTAURAR TAMAÑO
    // =====================================

    applyCardSize(
        defaultSettings.cardSize
    );


    // =====================================
    // 11. RESTAURAR GRUPO
    // =====================================

    applyGroupAppearance(
        defaultSettings.groupColor,
        defaultSettings.groupTransparency
    );


    // =====================================
    // 12. RESTAURAR TARJETA
    // =====================================

    applyCardAppearance(
        defaultSettings.cardColor,
        defaultSettings.cardTransparency
    );


    // =====================================
    // 13. RESTAURAR FONDO
    // =====================================

    backgroundColorInput.value =
        defaultSettings.backgroundColor;


    applyBackgroundColor(
        defaultSettings.backgroundColor
    );


    // =====================================
    // 14. RESTAURAR CONTROLES DEL FONDO
    // =====================================

    document.getElementById(
        "background-solid"
    ).checked = true;


    document.getElementById(
        "background-image"
    ).checked = false;


    document.getElementById(
        "background-gradient"
    ).checked = false;


    // =====================================
    // 15. RESTAURAR DEGRADADO
    // =====================================

    gradientDirectionInput.value =
        defaultSettings.gradientDirection;


    loadGradientColors(
        defaultSettings.gradientColors
    );


    // =====================================
    // 16. LIMPIAR INPUT DE IMAGEN
    // =====================================

    backgroundImageInput.value =
        "";


    // =====================================
    // 17. CERRAR PANEL
    // =====================================

    closeSettings();

}


// =========================================
// EVENTOS DEL MODAL DE CONFIRMACIÓN
// =========================================

// Abrir modal al pulsar "Reiniciar configuración"
resetBackgroundButton.addEventListener(
    "click",
    openResetConfirmation
);


// Cerrar con la X
closeResetConfirmationButton.addEventListener(
    "click",
    closeResetConfirmation
);


// Cancelar
cancelResetButton.addEventListener(
    "click",
    closeResetConfirmation
);


// Cerrar al hacer clic fuera del modal
resetConfirmationOverlay.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            resetConfirmationOverlay
        ) {

            closeResetConfirmation();

        }

    }
);


// Confirmar reinicio
confirmResetButton.addEventListener(
    "click",
    async () => {

        closeResetConfirmation();

        await resetExtension();

    }
);


// =========================================
// CONFIGURAR ELEMENTOS EXISTENTES
// =========================================

function setupExistingElements() {

    // Grupos
    document
        .querySelectorAll(".site-group")
        .forEach((group) => {

            setupGroupMenu(group);

        });


    // Tarjetas "+ Agregar sitio"
    document
        .querySelectorAll(".add-site-card")
        .forEach((card) => {

            setupAddSiteCard(card);

        });


    // Tarjetas de sitios
    document
        .querySelectorAll(".site-card")
        .forEach((site) => {

            setupSiteCard(site);

        });


    // Botones editar sitio
    setupExistingSiteEditButtons();


    // Botones editar grupo
    setupExistingGroupEditButtons();


    // =====================================
    // ELIMINAR GRUPOS EXISTENTES
    // =====================================

    document
        .querySelectorAll(".delete-group-button")
        .forEach((button) => {

            if (
                button.dataset.deleteConfigured === "true"
            ) {

                return;

            }


            button.dataset.deleteConfigured =
                "true";


            button.addEventListener(
                "click",
                async (event) => {

                    event.preventDefault();

                    event.stopPropagation();


                    const group =
                        button.closest(".site-group");


                    group.remove();


                    await saveCurrentData();

                }
            );

        });


    // =====================================
    // ELIMINAR SITIOS EXISTENTES
    // =====================================

    document
        .querySelectorAll(".delete-site-button")
        .forEach((button) => {

            if (
                button.dataset.deleteConfigured === "true"
            ) {

                return;

            }


            button.dataset.deleteConfigured =
                "true";


            button.addEventListener(
                "click",
                async (event) => {

                    event.preventDefault();

                    event.stopPropagation();


                    const site =
                        button.closest(".site-card");


                    site.remove();


                    await saveCurrentData();

                }
            );

        });

}


// =========================================
// INICIAR EXTENSIÓN
// =========================================

async function init() {

    let data =
        await loadData();


    // =====================================
    // PRIMERA EJECUCIÓN
    // =====================================

    if (!data.groups) {

        const initialGroups =
            defaultData.groups;


        const initialSettings = {

            ...defaultSettings,

            ...data.settings,

            gradientColors: [
                ...(data.settings?.gradientColors ??
                    defaultSettings.gradientColors)
            ]

        };


        await saveData({

            groups:
                initialGroups,

            settings:
                initialSettings

        });


        data = {

            groups:
                initialGroups,

            settings:
                initialSettings

        };

    }


    console.log(
        "Datos cargados:",
        data
    );


    // =====================================
    // LIMPIAR HTML ESTÁTICO
    // =====================================

    const main =
        document.querySelector("main");


    main.innerHTML = "";


    // =====================================
    // DIBUJAR GRUPOS
    // =====================================

    renderGroups(
        data.groups || []
    );


    // =====================================
    // CONFIGURAR ELEMENTOS
    // =====================================

    setupExistingElements();


    // =====================================
    // TAMAÑO
    // =====================================

    const cardSize =
        data.settings?.cardSize ??
        defaultSettings.cardSize;


    applyCardSize(
        cardSize
    );


    // =====================================
    // APARIENCIA GRUPOS
    // =====================================

    const groupColor =
        data.settings?.groupColor ??
        defaultSettings.groupColor;


    const groupTransparency =
        data.settings?.groupTransparency ??
        defaultSettings.groupTransparency;


    applyGroupAppearance(
        groupColor,
        groupTransparency
    );


    // =====================================
    // APARIENCIA TARJETAS
    // =====================================

    const cardColor =
        data.settings?.cardColor ??
        defaultSettings.cardColor;


    const cardTransparency =
        data.settings?.cardTransparency ??
        defaultSettings.cardTransparency;


    applyCardAppearance(
        cardColor,
        cardTransparency
    );


    // =====================================
    // DATOS DEL FONDO
    // =====================================

    const backgroundColor =
        data.settings?.backgroundColor ??
        defaultSettings.backgroundColor;


    backgroundColorInput.value =
        backgroundColor;


    const backgroundType =
        data.settings?.backgroundType ??
        "solid";


    // =====================================
    // IMAGEN
    // =====================================

    if (
        backgroundType === "image" &&
        data.settings?.backgroundImage
    ) {

        const imageLoaded =
            await applyBackgroundImage(
                data.settings.backgroundImage
            );


        if (imageLoaded) {

            document.getElementById(
                "background-image"
            ).checked = true;


            document.getElementById(
                "background-solid"
            ).checked = false;


            document.getElementById(
                "background-gradient"
            ).checked = false;

        }


        else {

            applyBackgroundColor(
                backgroundColor
            );


            document.getElementById(
                "background-image"
            ).checked = false;


            document.getElementById(
                "background-solid"
            ).checked = true;


            document.getElementById(
                "background-gradient"
            ).checked = false;


            await saveData({

                settings: {

                    ...defaultSettings,

                    ...data.settings,

                    backgroundType:
                        "solid"

                }

            });

        }

    }


    // =====================================
    // DEGRADADO
    // =====================================

    else if (
        backgroundType === "gradient"
    ) {

        const gradientDirection =
            data.settings?.gradientDirection ??
            defaultSettings.gradientDirection;


        const gradientColors =
            data.settings?.gradientColors ??
            defaultSettings.gradientColors;


        gradientDirectionInput.value =
            gradientDirection;


        loadGradientColors(
            gradientColors
        );


        applyGradient(
            gradientDirection,
            gradientColors
        );


        document.getElementById(
            "background-image"
        ).checked = false;


        document.getElementById(
            "background-solid"
        ).checked = false;


        document.getElementById(
            "background-gradient"
        ).checked = true;

    }


    // =====================================
    // COLOR SÓLIDO
    // =====================================

    else {

        applyBackgroundColor(
            backgroundColor
        );


        document.getElementById(
            "background-image"
        ).checked = false;


        document.getElementById(
            "background-solid"
        ).checked = true;


        document.getElementById(
            "background-gradient"
        ).checked = false;

    }

}


// =========================================
// INICIAR
// =========================================

init();