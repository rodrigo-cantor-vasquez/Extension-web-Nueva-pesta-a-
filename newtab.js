// =========================================
// FUNCIONES GENERALES
// =========================================

function openOverlay(overlay) {
    overlay.style.opacity = "1";
    overlay.style.visibility = "visible";
    overlay.style.pointerEvents = "auto";
}

function closeOverlay(overlay) {
    overlay.style.opacity = "0";
    overlay.style.visibility = "hidden";
    overlay.style.pointerEvents = "none";
}

function toggleMenu(menu) {
    if (!menu) {
        return;
    }

    const wasOpen = menu.style.display === "block";

    closeAllMenus();

    if (!wasOpen) {
        menu.style.display = "block";
    }
}

function closeAllMenus() {
    document
        .querySelectorAll(".group-menu, .site-menu")
        .forEach((menu) => {
            menu.style.display = "none";
        });
}

function closeMenu(menu) {
    if (!menu) {
        return;
    }

    menu.style.display = "none";
}

function getSiteName(site) {
    return site.querySelector(".site-name");
}

function getSiteDescription(site) {
    return site.querySelector(".site-description");
}

function getGroupTitle(group) {
    return group.querySelector("h2");
}

function openSite(site) {
    const url = site.dataset.url;

    if (url) {
        window.location.href = url;
    }
}


// =========================================
// ACTUALIZAR DESCRIPCIÓN DE UNA TARJETA
// =========================================
//
// Esta función se encarga de:
//
// 1. Crear la descripción si se escribe una.
// 2. Actualizarla si ya existe.
// 3. Eliminarla si se deja vacía.
//
// De esta forma, una tarjeta sin descripción
// NO tendrá el elemento .site-description
// y por lo tanto no tendrá hover.
//

function updateSiteDescription(
    site,
    description
) {

    const cleanDescription =
        (description || "").trim();

    let siteDescription =
        getSiteDescription(site);


    // -----------------------------------------
    // SI NO HAY DESCRIPCIÓN
    // -----------------------------------------

    if (cleanDescription === "") {

        if (siteDescription) {
            siteDescription.remove();
        }

        return;
    }


    // -----------------------------------------
    // SI NO EXISTÍA, LA CREAMOS
    // -----------------------------------------

    if (!siteDescription) {

        siteDescription =
            document.createElement("div");

        siteDescription.className =
            "site-description";

        const siteMenuButton =
            site.querySelector(
                ".site-menu-button"
            );


        // La descripción debe quedar:
        //
        // icono
        // nombre
        // descripción
        // botón ⋮
        //
        if (siteMenuButton) {

            site.insertBefore(
                siteDescription,
                siteMenuButton
            );

        } else {

            site.appendChild(
                siteDescription
            );
        }
    }


    // -----------------------------------------
    // ACTUALIZAR TEXTO
    // -----------------------------------------

    siteDescription.textContent =
        cleanDescription;
}


// =========================================
// CONFIGURACIÓN POR DEFECTO
// =========================================

const defaultSettings = {
    cardSize: 95,
    containerWidth: 807,
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
    cardTransparency: 0,

    cardTextColor: "#2f3f5f",
    addSiteTextColor: "#2f3f5f"
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
// OBTENER DATOS DE LOS GRUPOS
// =========================================

function getGroupsData() {

    const groups = [];

    const groupElements =
        document.querySelectorAll(
            ".site-group"
        );

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

            const descriptionElement =
                siteElement.querySelector(
                    ".site-description"
                );

            const site = {
                name:
                    siteElement
                        .querySelector(".site-name")
                        .textContent
                        .trim(),

                url:
                    siteElement.dataset.url,

                description:
                    descriptionElement
                        ?.textContent
                        .trim() || ""
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
// HEX A RGBA
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
        1 -
        (validTransparency / 100);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


// =========================================
// PANEL DE CONFIGURACIÓN
// =========================================

const settingsButton =
    document.getElementById(
        "settings-button"
    );

const settingsPanel =
    document.getElementById(
        "settings-panel"
    );

const closeSettingsButton =
    document.getElementById(
        "close-settings-button"
    );

const settingsOverlay =
    document.getElementById(
        "settings-overlay"
    );

settingsButton.addEventListener(
    "click",
    () => {

        settingsPanel.style.transform =
            "translateX(0)";

        openOverlay(
            settingsOverlay
        );
    }
);

function closeSettings() {

    settingsPanel.style.transform =
        "translateX(100%)";

    closeOverlay(
        settingsOverlay
    );
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
// BUSCAR SITIOS
// =========================================

const sitesSearch =
    document.getElementById(
        "sites-search"
    );

function normalizeSearchText(text) {

    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );
}

function filterSiteCards() {

    const searchText =
        normalizeSearchText(
            sitesSearch.value.trim()
        );

    const groups =
        document.querySelectorAll(
            ".site-group"
        );

    groups.forEach((group) => {

        const sites =
            group.querySelectorAll(
                ".site-card"
            );

        let visibleSites = 0;

        sites.forEach((site) => {

            const name =
                getSiteName(site)?.textContent ||
                "";

            const description =
                getSiteDescription(site)?.textContent ||
                "";

            const url =
                site.dataset.url || "";

            const searchableText =
                normalizeSearchText(
                    `${name} ${description} ${url}`
                );

            const matches =
                searchText === "" ||
                searchableText.includes(
                    searchText
                );

            if (matches) {

                site.style.display =
                    "";

                visibleSites++;

            } else {

                site.style.display =
                    "none";
            }
        });

        if (
            searchText !== "" &&
            visibleSites === 0
        ) {

            group.style.display =
                "none";

        } else {

            group.style.display =
                "";
        }
    });
}

sitesSearch.addEventListener(
    "input",
    filterSiteCards
);


// =========================================
// BUSCAR EN LA WEB
// =========================================

const webSearch =
    document.getElementById(
        "web-search"
    );

webSearch.value = "";

window.addEventListener(
    "pageshow",
    () => {
        webSearch.value = "";
    }
);

webSearch.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !== "Enter"
        ) {
            return;
        }

        const searchText =
            webSearch.value.trim();

        if (searchText === "") {
            return;
        }

        chrome.runtime.sendMessage({
            action: "searchWeb",
            text: searchText
        });
    }
);


// =========================================
// MENÚ DE LOS GRUPOS
// =========================================

function setupGroupMenu(group) {

    const menuButton =
        group.querySelector(
            ".group-menu-button"
        );

    const menu =
        group.querySelector(
            ".group-menu"
        );

    if (!menuButton || !menu) {
        return;
    }

    if (
        menuButton.dataset.menuConfigured ===
        "true"
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
// ARRASTRE DE GRUPOS
// =========================================

let draggedGroup = null;
let hoveredGroup = null;


// =========================================
// AUTO-SCROLL AL ARRASTRAR GRUPOS
// =========================================

const GROUP_DRAG_SCROLL_ZONE = 120;
const GROUP_DRAG_SCROLL_SPEED = 15;

let groupDragScrollAnimation = null;
let groupDragMouseY = 0;


// =========================================
// OBTENER CONTENEDOR CON SCROLL
// =========================================

function getScrollContainer() {

    const main =
        document.querySelector("main");

    if (main) {

        const mainStyle =
            window.getComputedStyle(main);

        const mainCanScroll =
            (
                mainStyle.overflowY === "auto" ||
                mainStyle.overflowY === "scroll"
            ) &&
            main.scrollHeight >
            main.clientHeight;

        if (mainCanScroll) {
            return main;
        }
    }

    if (draggedGroup) {

        let element =
            draggedGroup;

        while (
            element &&
            element !== document.body &&
            element !== document.documentElement
        ) {

            const style =
                window.getComputedStyle(
                    element
                );

            const canScroll =
                (
                    style.overflowY === "auto" ||
                    style.overflowY === "scroll"
                ) &&
                element.scrollHeight >
                element.clientHeight;

            if (canScroll) {
                return element;
            }

            element =
                element.parentElement;
        }
    }

    return document.scrollingElement ||
        document.documentElement;
}


// =========================================
// HACER SCROLL
// =========================================

function scrollGroupContainer(amount) {

    const container =
        getScrollContainer();

    if (!container) {
        return;
    }

    if (
        container ===
        document.documentElement ||
        container === document.body
    ) {

        window.scrollBy(
            0,
            amount
        );

    } else {

        container.scrollTop +=
            amount;
    }
}


// =========================================
// BUSCAR GRUPO DEBAJO DEL MOUSE
// =========================================

function updateDraggedGroupTarget() {

    if (!draggedGroup) {
        return;
    }

    const element =
        document.elementFromPoint(
            window.innerWidth / 2,
            groupDragMouseY
        );

    if (!element) {
        return;
    }

    const targetGroup =
        element.closest(
            ".site-group"
        );

    if (!targetGroup) {
        return;
    }

    if (
        targetGroup ===
        draggedGroup
    ) {
        return;
    }

    if (
        targetGroup ===
        hoveredGroup
    ) {
        return;
    }

    hoveredGroup =
        targetGroup;

    swapGroups(
        draggedGroup,
        targetGroup
    );

    document
        .querySelectorAll(
            ".site-group"
        )
        .forEach(
            (otherGroup) => {

                otherGroup.classList.remove(
                    "group-drag-over"
                );
            }
        );

    targetGroup.classList.add(
        "group-drag-over"
    );
}


// =========================================
// ANIMACIÓN CONTINUA DEL AUTO-SCROLL
// =========================================

function runGroupDragAutoScroll() {

    if (!draggedGroup) {

        groupDragScrollAnimation =
            null;

        return;
    }

    const windowHeight =
        window.innerHeight;

    let speed = 0;

    if (
        groupDragMouseY <
        GROUP_DRAG_SCROLL_ZONE
    ) {

        const distance =
            GROUP_DRAG_SCROLL_ZONE -
            groupDragMouseY;

        speed =
            -Math.min(
                GROUP_DRAG_SCROLL_SPEED,
                Math.max(
                    2,
                    distance / 5
                )
            );

    } else if (
        groupDragMouseY >
        windowHeight -
        GROUP_DRAG_SCROLL_ZONE
    ) {

        const distance =
            groupDragMouseY -
            (
                windowHeight -
                GROUP_DRAG_SCROLL_ZONE
            );

        speed =
            Math.min(
                GROUP_DRAG_SCROLL_SPEED,
                Math.max(
                    2,
                    distance / 5
                )
            );
    }

    if (speed !== 0) {

        scrollGroupContainer(
            speed
        );

        updateDraggedGroupTarget();
    }

    groupDragScrollAnimation =
        requestAnimationFrame(
            runGroupDragAutoScroll
        );
}


// =========================================
// INICIAR AUTO-SCROLL
// =========================================

function startGroupDragAutoScroll() {

    if (groupDragScrollAnimation) {
        return;
    }

    groupDragScrollAnimation =
        requestAnimationFrame(
            runGroupDragAutoScroll
        );
}


// =========================================
// DETENER AUTO-SCROLL
// =========================================

function stopGroupDragAutoScroll() {

    if (groupDragScrollAnimation) {

        cancelAnimationFrame(
            groupDragScrollAnimation
        );
    }

    groupDragScrollAnimation =
        null;
}


// =========================================
// ACTUALIZAR POSICIÓN DEL MOUSE
// =========================================

function autoScrollWhileDragging(event) {

    if (!draggedGroup) {
        return;
    }

    groupDragMouseY =
        event.clientY;

    startGroupDragAutoScroll();
}


// =========================================
// INTERCAMBIAR DOS GRUPOS
// =========================================

function swapGroups(
    groupA,
    groupB
) {

    if (
        !groupA ||
        !groupB ||
        groupA === groupB
    ) {
        return;
    }

    const parent =
        groupA.parentNode;

    if (
        !parent ||
        parent !== groupB.parentNode
    ) {
        return;
    }

    const placeholderA =
        document.createElement(
            "div"
        );

    const placeholderB =
        document.createElement(
            "div"
        );

    placeholderA.style.display =
        "none";

    placeholderB.style.display =
        "none";

    parent.insertBefore(
        placeholderA,
        groupA
    );

    parent.insertBefore(
        placeholderB,
        groupB
    );

    parent.insertBefore(
        groupB,
        placeholderA
    );

    parent.insertBefore(
        groupA,
        placeholderB
    );

    placeholderA.remove();
    placeholderB.remove();
}


// =========================================
// OBTENER GRUPO DEBAJO DEL MOUSE
// =========================================

function getGroupUnderMouse(event) {

    const element =
        document.elementFromPoint(
            event.clientX,
            event.clientY
        );

    if (!element) {
        return null;
    }

    return element.closest(
        ".site-group"
    );
}


// =========================================
// CONFIGURAR ARRASTRE DE UN GRUPO
// =========================================

function setupGroupDrag(group) {

    if (
        group.dataset.dragConfigured ===
        "true"
    ) {
        return;
    }

    const groupHeader =
        group.querySelector(
            ".group-header"
        );

    if (!groupHeader) {
        return;
    }

    group.dataset.dragConfigured =
        "true";

    groupHeader.draggable = true;

    groupHeader.addEventListener(
        "dragstart",
        (event) => {

            const target =
                event.target;

            if (
                target.closest &&
                target.closest(
                    ".group-menu-button, .group-menu"
                )
            ) {

                event.preventDefault();

                return;
            }

            draggedGroup =
                group;

            hoveredGroup =
                null;

            groupDragMouseY =
                event.clientY;

            group.classList.add(
                "group-dragging"
            );

            event.dataTransfer.effectAllowed =
                "move";

            event.dataTransfer.setData(
                "text/plain",
                "group"
            );

            startGroupDragAutoScroll();
        }
    );

    groupHeader.addEventListener(
        "dragend",
        async () => {

            stopGroupDragAutoScroll();

            if (draggedGroup) {

                draggedGroup.classList.remove(
                    "group-dragging"
                );
            }

            document
                .querySelectorAll(
                    ".site-group"
                )
                .forEach(
                    (otherGroup) => {

                        otherGroup.classList.remove(
                            "group-drag-over"
                        );
                    }
                );

            await saveCurrentData();

            draggedGroup =
                null;

            hoveredGroup =
                null;
        }
    );
}


// =========================================
// ZONA GENERAL DE ARRASTRE DE GRUPOS
// =========================================

function setupGroupDragArea() {

    const main =
        document.querySelector("main");

    if (!main) {
        return;
    }

    if (
        main.dataset.groupDragAreaConfigured ===
        "true"
    ) {
        return;
    }

    main.dataset.groupDragAreaConfigured =
        "true";

    main.addEventListener(
        "dragover",
        (event) => {

            if (!draggedGroup) {
                return;
            }

            event.preventDefault();

            event.dataTransfer.dropEffect =
                "move";

            autoScrollWhileDragging(
                event
            );

            const targetGroup =
                getGroupUnderMouse(event);

            if (!targetGroup) {

                hoveredGroup =
                    null;

                return;
            }

            if (
                targetGroup ===
                draggedGroup
            ) {

                hoveredGroup =
                    null;

                document
                    .querySelectorAll(
                        ".site-group"
                    )
                    .forEach(
                        (otherGroup) => {

                            otherGroup.classList.remove(
                                "group-drag-over"
                            );
                        }
                    );

                return;
            }

            if (
                targetGroup ===
                hoveredGroup
            ) {
                return;
            }

            hoveredGroup =
                targetGroup;

            swapGroups(
                draggedGroup,
                targetGroup
            );

            document
                .querySelectorAll(
                    ".site-group"
                )
                .forEach(
                    (otherGroup) => {

                        otherGroup.classList.remove(
                            "group-drag-over"
                        );
                    }
                );

            targetGroup.classList.add(
                "group-drag-over"
            );
        }
    );

    main.addEventListener(
        "drop",
        (event) => {

            if (!draggedGroup) {
                return;
            }

            event.preventDefault();
        }
    );
}


// =========================================
// ARRASTRE DE TARJETAS
// =========================================

let draggedSite = null;
let hoveredSite = null;
let draggedSiteMoved = false;


// =========================================
// OBTENER TARJETA DEBAJO DEL MOUSE
// =========================================

function getSiteUnderMouse(event) {

    const element =
        document.elementFromPoint(
            event.clientX,
            event.clientY
        );

    if (!element) {
        return null;
    }

    return element.closest(
        ".site-card"
    );
}


// =========================================
// MOVER TARJETA
// =========================================

function moveSiteBefore(
    site,
    targetSite
) {

    if (
        !site ||
        !targetSite ||
        site === targetSite
    ) {
        return;
    }

    const targetContainer =
        targetSite.parentNode;

    if (!targetContainer) {
        return;
    }

    targetContainer.insertBefore(
        site,
        targetSite
    );
}


// =========================================
// MOVER TARJETA AL FINAL DEL GRUPO
// =========================================

function moveSiteToGroup(
    site,
    group
) {

    if (!site || !group) {
        return;
    }

    const sitesContainer =
        group.querySelector(
            ".sites-container"
        );

    if (!sitesContainer) {
        return;
    }

    const addSiteCard =
        sitesContainer.querySelector(
            ".add-site-card"
        );

    if (addSiteCard) {

        sitesContainer.insertBefore(
            site,
            addSiteCard
        );

    } else {

        sitesContainer.appendChild(
            site
        );
    }
}


// =========================================
// MOVER TARJETA SEGÚN POSICIÓN DEL MOUSE
// =========================================

function moveSiteAccordingToMouse(
    site,
    targetSite,
    event
) {

    if (
        !site ||
        !targetSite ||
        site === targetSite
    ) {
        return;
    }

    const targetRect =
        targetSite.getBoundingClientRect();

    const middleX =
        targetRect.left +
        targetRect.width / 2;

    const middleY =
        targetRect.top +
        targetRect.height / 2;

    let insertBefore = false;

    if (
        event.clientY < middleY
    ) {

        insertBefore = true;

    } else if (
        event.clientY > middleY
    ) {

        insertBefore = false;

    } else {

        insertBefore =
            event.clientX < middleX;
    }

    if (insertBefore) {

        if (
            targetSite.previousElementSibling !==
            site
        ) {

            moveSiteBefore(
                site,
                targetSite
            );
        }

    } else {

        const nextElement =
            targetSite.nextElementSibling;

        if (
            nextElement !== site
        ) {

            if (nextElement) {

                moveSiteBefore(
                    site,
                    nextElement
                );

            } else {

                const group =
                    targetSite.closest(
                        ".site-group"
                    );

                moveSiteToGroup(
                    site,
                    group
                );
            }
        }
    }
}


// =========================================
// CONFIGURAR ARRASTRE DE UNA TARJETA
// =========================================

function setupSiteDrag(site) {

    if (
        site.dataset.siteDragConfigured ===
        "true"
    ) {
        return;
    }

    site.dataset.siteDragConfigured =
        "true";

    site.draggable = true;

    site.addEventListener(
        "dragstart",
        (event) => {

            const target =
                event.target;

            if (
                target.closest &&
                target.closest(
                    ".site-menu-button, .site-menu"
                )
            ) {

                event.preventDefault();

                return;
            }

            draggedSite =
                site;

            hoveredSite =
                null;

            draggedSiteMoved =
                false;

            site.classList.add(
                "site-dragging"
            );

            event.dataTransfer.effectAllowed =
                "move";

            event.dataTransfer.setData(
                "text/plain",
                "site"
            );
        }
    );

    site.addEventListener(
        "dragend",
        async () => {

            if (draggedSite) {

                draggedSite.classList.remove(
                    "site-dragging"
                );
            }

            document
                .querySelectorAll(
                    ".site-card"
                )
                .forEach(
                    (otherSite) => {

                        otherSite.classList.remove(
                            "site-drag-over"
                        );
                    }
                );

            if (draggedSiteMoved) {
                await saveCurrentData();
            }

            draggedSite =
                null;

            hoveredSite =
                null;

            setTimeout(
                () => {
                    draggedSiteMoved =
                        false;
                },
                0
            );
        }
    );
}


// =========================================
// ZONA GENERAL DE ARRASTRE DE TARJETAS
// =========================================

function setupSiteDragArea() {

    const main =
        document.querySelector("main");

    if (!main) {
        return;
    }

    if (
        main.dataset.siteDragAreaConfigured ===
        "true"
    ) {
        return;
    }

    main.dataset.siteDragAreaConfigured =
        "true";

    main.addEventListener(
        "dragover",
        (event) => {

            if (!draggedSite) {
                return;
            }

            event.preventDefault();

            event.dataTransfer.dropEffect =
                "move";

            const targetSite =
                getSiteUnderMouse(event);

            if (targetSite) {

                if (
                    targetSite ===
                    draggedSite
                ) {
                    return;
                }

                const targetGroup =
                    targetSite.closest(
                        ".site-group"
                    );

                const draggedGroupElement =
                    draggedSite.closest(
                        ".site-group"
                    );

                if (
                    !targetGroup ||
                    !draggedGroupElement
                ) {
                    return;
                }

                moveSiteAccordingToMouse(
                    draggedSite,
                    targetSite,
                    event
                );

                draggedSiteMoved =
                    true;

                hoveredSite =
                    targetSite;

                document
                    .querySelectorAll(
                        ".site-card"
                    )
                    .forEach(
                        (otherSite) => {

                            otherSite.classList.remove(
                                "site-drag-over"
                            );
                        }
                    );

                targetSite.classList.add(
                    "site-drag-over"
                );

                return;
            }


            // ---------------------------------
            // SI NO HAY TARJETA DEBAJO,
            // BUSCAMOS EL GRUPO
            // ---------------------------------

            const element =
                document.elementFromPoint(
                    event.clientX,
                    event.clientY
                );

            if (!element) {
                return;
            }

            const targetGroup =
                element.closest(
                    ".site-group"
                );

            if (!targetGroup) {
                return;
            }

            const sitesContainer =
                targetGroup.querySelector(
                    ".sites-container"
                );

            if (!sitesContainer) {
                return;
            }

            const addSiteCard =
                sitesContainer.querySelector(
                    ".add-site-card"
                );

            if (
                element.closest(
                    ".group-header"
                ) ||
                element ===
                sitesContainer
            ) {

                moveSiteToGroup(
                    draggedSite,
                    targetGroup
                );

                draggedSiteMoved =
                    true;

                document
                    .querySelectorAll(
                        ".site-card"
                    )
                    .forEach(
                        (otherSite) => {

                            otherSite.classList.remove(
                                "site-drag-over"
                            );
                        }
                    );

                return;
            }

            if (
                addSiteCard &&
                element.closest(
                    ".add-site-card"
                )
            ) {

                moveSiteToGroup(
                    draggedSite,
                    targetGroup
                );

                draggedSiteMoved =
                    true;

                document
                    .querySelectorAll(
                        ".site-card"
                    )
                    .forEach(
                        (otherSite) => {

                            otherSite.classList.remove(
                                "site-drag-over"
                            );
                        }
                    );
            }
        }
    );

    main.addEventListener(
        "drop",
        (event) => {

            if (!draggedSite) {
                return;
            }

            event.preventDefault();

            document
                .querySelectorAll(
                    ".site-card"
                )
                .forEach(
                    (otherSite) => {

                        otherSite.classList.remove(
                            "site-drag-over"
                        );
                    }
                );
        }
    );
}


// =========================================
// MENÚ DE SITIOS
// =========================================

function setupSiteCard(site) {

    const menuButton =
        site.querySelector(
            ".site-menu-button"
        );

    const menu =
        site.querySelector(
            ".site-menu"
        );

    if (
        site.dataset.cardConfigured !==
        "true"
    ) {

        site.dataset.cardConfigured =
            "true";

        site.addEventListener(
            "click",
            () => {

                if (draggedSiteMoved) {
                    return;
                }

                openSite(site);
            }
        );
    }

    if (!menuButton || !menu) {
        return;
    }

    if (
        menuButton.dataset.menuConfigured ===
        "true"
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
// CERRAR MENÚS AL HACER CLICK AFUERA
// =========================================

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
    document.getElementById(
        "add-site-overlay"
    );

const addSiteName =
    document.getElementById(
        "add-site-name"
    );

const addSiteUrl =
    document.getElementById(
        "add-site-url"
    );

const addSiteDescription =
    document.getElementById(
        "add-site-description"
    );

const addSiteGroup =
    document.getElementById(
        "add-site-group"
    );

const addSiteNameError =
    document.getElementById(
        "add-site-name-error"
    );

const addSiteUrlError =
    document.getElementById(
        "add-site-url-error"
    );

const closeAddSiteButton =
    document.getElementById(
        "close-add-site-button"
    );

const cancelAddSiteButton =
    document.getElementById(
        "cancel-add-site-button"
    );

const saveAddSiteButton =
    document.getElementById(
        "save-add-site-button"
    );

let groupBeingAddedTo = null;


// =========================================
// LIMPIAR FORMULARIO
// =========================================

function clearAddSiteErrors() {

    addSiteNameError.textContent =
        "";

    addSiteUrlError.textContent =
        "";
}

function resetAddSiteForm() {

    addSiteName.value = "";
    addSiteUrl.value = "";
    addSiteDescription.value = "";

    clearAddSiteErrors();
}

function resetAddSiteState() {

    groupBeingAddedTo = null;

    resetAddSiteForm();
}


// =========================================
// CARGAR GRUPOS
// =========================================

function loadSiteGroups() {

    addSiteGroup.innerHTML = "";

    const groups =
        document.querySelectorAll(
            ".site-group"
        );

    groups.forEach((group) => {

        const groupTitle =
            getGroupTitle(group);

        const groupName =
            groupTitle.textContent.trim();

        const option =
            document.createElement(
                "option"
            );

        option.value =
            groupName;

        option.textContent =
            groupName;

        addSiteGroup.appendChild(
            option
        );
    });
}


// =========================================
// ABRIR AGREGAR SITIO
// =========================================

function openAddSite() {

    const groups =
        document.querySelectorAll(
            ".site-group"
        );

    if (groups.length === 0) {

        alert(
            "Debes crear un grupo antes de agregar un sitio."
        );

        return;
    }

    resetAddSiteForm();

    openOverlay(
        addSiteOverlay
    );

    addSiteName.focus();
}


// =========================================
// CERRAR AGREGAR SITIO
// =========================================

function closeAddSite() {

    closeOverlay(
        addSiteOverlay
    );

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

        if (
            event.target ===
            addSiteOverlay
        ) {

            closeAddSite();
        }
    }
);


// =========================================
// BUSCAR GRUPO
// =========================================

function findGroupByName(groupName) {

    const groups =
        document.querySelectorAll(
            ".site-group"
        );

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
// ICONO DEL SITIO (v2)
// =========================================
//
// Orden de búsqueda:
//
// 1. Favicon de una pestaña abierta (URL exacta o mismo host)
// 2. Caché (verificado: si ya no carga, se descarta)
// 3. API de favicons de Chrome  (necesita permiso "favicon")
// 4. /favicon.ico del dominio principal
// 5. /favicon.ico del host completo
// 6. 🌐

const FAVICON_CACHE_PREFIX = "favicon_v2_";

let defaultChromeFaviconSignature = null;


// -----------------------------------------
// Cargar una imagen con timeout
// Devuelve el <img> si cargó, o null
// -----------------------------------------

function loadFaviconImage(src, timeoutMs = 4000) {

    return new Promise((resolve) => {

        const img = new Image();

        let finished = false;

        const timer = setTimeout(
            () => finish(null),
            timeoutMs
        );

        function finish(result) {

            if (finished) {
                return;
            }

            finished = true;

            clearTimeout(timer);

            img.onload = null;
            img.onerror = null;

            resolve(result);
        }

        img.alt = "";

        img.onload = () =>
            finish(
                img.naturalWidth > 0
                    ? img
                    : null
            );

        img.onerror = () => finish(null);

        img.src = src;
    });
}


// -----------------------------------------
// URL de la API de favicons de Chrome
// -----------------------------------------

function getChromeFaviconUrl(pageUrl, size = 64) {

    const u = new URL(
        chrome.runtime.getURL("/_favicon/")
    );

    u.searchParams.set("pageUrl", pageUrl);
    u.searchParams.set("size", String(size));

    return u.toString();
}


// -----------------------------------------
// "Huella" de una imagen (para detectar
// el globo genérico que Chrome devuelve
// cuando no conoce el sitio)
// -----------------------------------------

function getImageSignature(img) {

    try {

        const canvas =
            document.createElement("canvas");

        canvas.width = 16;
        canvas.height = 16;

        const ctx = canvas.getContext(
            "2d",
            { willReadFrequently: true }
        );

        ctx.drawImage(img, 0, 0, 16, 16);

        return Array
            .from(
                ctx.getImageData(0, 0, 16, 16).data
            )
            .join(",");

    } catch {

        return null;
    }
}


async function getDefaultChromeFaviconSignature() {

    if (defaultChromeFaviconSignature === null) {

        defaultChromeFaviconSignature =
            (async () => {

                const img = await loadFaviconImage(
                    getChromeFaviconUrl(
                        "https://sitio-inexistente.invalid/"
                    )
                );

                return img
                    ? getImageSignature(img)
                    : "";

            })();
    }

    return defaultChromeFaviconSignature;
}


// -----------------------------------------
// Favicon desde Chrome (ignora el genérico)
// -----------------------------------------

async function loadChromeFavicon(pageUrl) {

    if (
        typeof chrome === "undefined" ||
        !chrome.runtime ||
        !chrome.runtime.getURL
    ) {
        return null;
    }

    const img = await loadFaviconImage(
        getChromeFaviconUrl(pageUrl)
    );

    if (!img) {
        return null;
    }

    const signature = getImageSignature(img);

    const defaultSignature =
        await getDefaultChromeFaviconSignature();

    if (
        signature &&
        defaultSignature &&
        signature === defaultSignature
    ) {
        return null;
    }

    return img;
}


// -----------------------------------------
// Dominio principal (soporta .com.co, etc.)
// -----------------------------------------

function getMainDomain(hostname) {

    const parts = hostname.split(".");

    if (parts.length <= 2) {
        return hostname;
    }

    const lastTwo =
        parts.slice(-2).join(".");

    const specialTlds = [
        "com.co", "org.co", "net.co",
        "gov.co", "edu.co", "mil.co",
        "co.uk", "org.uk", "ac.uk",
        "com.au", "net.au", "org.au",
        "co.nz",
        "com.br", "com.mx", "com.ar"
    ];

    if (specialTlds.includes(lastTwo)) {
        return parts.slice(-3).join(".");
    }

    return parts.slice(-2).join(".");
}


// -----------------------------------------
// Favicons de pestañas abiertas
// (primero URL exacta, luego mismo host)
// -----------------------------------------

async function getOpenTabFavicons(normalizedUrl, hostname) {

    const exact = [];
    const sameHost = [];

    try {

        if (
            !chrome.tabs ||
            typeof chrome.tabs.query !== "function"
        ) {
            return [];
        }

        const tabs = await chrome.tabs.query({});

        for (const tab of tabs) {

            if (!tab.url || !tab.favIconUrl) {
                continue;
            }

            try {

                const tabUrl = new URL(tab.url);

                const tabNormalized =
                    tabUrl.href.replace(/\/$/, "");

                if (tabNormalized === normalizedUrl) {

                    exact.push(tab.favIconUrl);

                } else if (
                    tabUrl.hostname.toLowerCase() === hostname
                ) {

                    sameHost.push(tab.favIconUrl);
                }

            } catch {
                // URL inválida: ignorar
            }
        }

    } catch {
        return [];
    }

    return [...exact, ...sameHost];
}


// >>> INICIO ICONO DEL SITIO >>>
// =========================================
// ICONO DEL SITIO (v4)
// =========================================
//
// Orden de búsqueda:
//
// 1. Favicon de una pestaña abierta (URL exacta o mismo host)
// 2. Caché (verificado: si ya no carga, se descarta)
// 3. Icono que la propia página declara en su HTML
//    (<link rel="icon">) = el mismo que muestra la pestaña
// 4. API de favicons de Chrome (necesita permiso "favicon")
// 5. /favicon.ico directo
// 6. 🌐

// Todo el código auxiliar vive dentro de una función anónima,
// así que no puede chocar con otros nombres de newtab.js.

var faviconTools = (function () {

    const FAVICON_CACHE_PREFIX = "favicon_v4_";

    let defaultChromeFaviconSignature = null;


    // -----------------------------------------
    // Cargar un <img> con timeout
    // Devuelve el <img> si cargó, o null
    // -----------------------------------------

    function loadImageElement(src, timeoutMs) {

        return new Promise((resolve) => {

            const img = new Image();

            let finished = false;

            const timer = setTimeout(
                () => finish(null),
                timeoutMs
            );

            function finish(result) {

                if (finished) {
                    return;
                }

                finished = true;

                clearTimeout(timer);

                img.onload = null;
                img.onerror = null;

                resolve(result);
            }

            img.alt = "";

            img.onload = () =>
                finish(
                    img.naturalWidth > 0
                        ? img
                        : null
                );

            img.onerror = () => finish(null);

            img.src = src;
        });
    }


    // -----------------------------------------
    // ¿La imagen está vacía? (transparente o
    // toda blanca). Algunos sitios devuelven un
    // favicon.ico "en blanco" que carga sin error.
    // -----------------------------------------

    function isBlankImage(img) {

        try {

            const canvas =
                document.createElement("canvas");

            canvas.width = 32;
            canvas.height = 32;

            const ctx = canvas.getContext(
                "2d",
                { willReadFrequently: true }
            );

            ctx.drawImage(img, 0, 0, 32, 32);

            const data =
                ctx.getImageData(0, 0, 32, 32).data;

            for (let i = 0; i < data.length; i += 4) {

                const alpha = data[i + 3];

                const isWhite =
                    data[i] >= 245 &&
                    data[i + 1] >= 245 &&
                    data[i + 2] >= 245;

                if (alpha > 24 && !isWhite) {
                    return false;
                }
            }

            return true;

        } catch {

            // Canvas bloqueado: no podemos saberlo
            return false;
        }
    }


    // -----------------------------------------
    // Descargar la imagen como blob.
    // Devuelve:
    //   "blob:..."  si es una imagen válida
    //   false       si NO es una imagen (404, HTML...)
    //   null        si la descarga falló y conviene
    //               probar con un <img> normal
    // -----------------------------------------

    async function fetchImageAsBlobUrl(src, timeoutMs) {

        const controller = new AbortController();

        const timer = setTimeout(
            () => controller.abort(),
            timeoutMs
        );

        try {

            const response = await fetch(src, {
                credentials: "include",
                signal: controller.signal
            });

            if (!response.ok) {
                return false;
            }

            let blob = await response.blob();

            if (!blob.size) {
                return false;
            }

            const type =
                (blob.type || "").toLowerCase();

            const isTextLike =
                (
                    type.startsWith("text/") ||
                    type.includes("json") ||
                    type.includes("html")
                ) &&
                !type.includes("svg");

            if (isTextLike) {
                return false;
            }

            // Algunos servidores envían los .ico sin tipo
            if (
                !type.startsWith("image/") &&
                /\.ico(\?|$)/i.test(src)
            ) {
                blob = new Blob(
                    [blob],
                    { type: "image/x-icon" }
                );
            }

            return URL.createObjectURL(blob);

        } catch {

            return null;

        } finally {

            clearTimeout(timer);
        }
    }


    // -----------------------------------------
    // Cargar un favicon:
    // - descarta errores, HTML y timeouts
    // - descarta imágenes en blanco
    // Devuelve el <img> o null
    // -----------------------------------------

    async function loadFaviconImage(src, timeoutMs = 4000) {

        const isLocal =
            src.startsWith("data:") ||
            src.startsWith("blob:") ||
            src.startsWith("chrome-extension:");

        if (!isLocal) {

            const blobUrl =
                await fetchImageAsBlobUrl(src, timeoutMs);

            if (blobUrl === false) {
                return null;
            }

            if (blobUrl) {

                const img =
                    await loadImageElement(blobUrl, timeoutMs);

                if (!img || isBlankImage(img)) {
                    URL.revokeObjectURL(blobUrl);
                    return null;
                }

                return img;
            }
        }

        // Datos locales, o la descarga falló:
        // probamos con un <img> normal
        const img =
            await loadImageElement(src, timeoutMs);

        if (!img || isBlankImage(img)) {
            return null;
        }

        return img;
    }


    // -----------------------------------------
    // Extraer los iconos declarados en un HTML
    // Devuelve URLs ordenadas de mejor a peor
    // -----------------------------------------

    function parseIconsFromHtml(html, baseUrl) {

        const doc = new DOMParser()
            .parseFromString(html, "text/html");

        // Si la página define <base href>, se respeta
        let base = baseUrl;

        const baseTag = doc.querySelector("base[href]");

        if (baseTag) {

            try {
                base = new URL(
                    baseTag.getAttribute("href"),
                    baseUrl
                ).href;
            } catch {
                // se queda baseUrl
            }
        }

        const icons = [];
        const touchIcons = [];

        doc.querySelectorAll("link[rel][href]")
            .forEach((link, index) => {

                const rel = link
                    .getAttribute("rel")
                    .toLowerCase()
                    .split(/\s+/);

                const isIcon =
                    rel.includes("icon") ||
                    rel.includes("shortcut");

                const isTouch =
                    rel.includes("apple-touch-icon") ||
                    rel.includes("apple-touch-icon-precomposed");

                if (!isIcon && !isTouch) {
                    return;
                }

                let href;

                try {

                    href = new URL(
                        link.getAttribute("href").trim(),
                        base
                    ).href;

                } catch {
                    return;
                }

                // Tamaño más cercano a 32px
                // (más pequeño penaliza más que más grande)
                const type =
                    (link.getAttribute("type") || "")
                        .toLowerCase();

                const sizesAttr =
                    (link.getAttribute("sizes") || "")
                        .toLowerCase();

                let size = 32;

                if (
                    sizesAttr === "any" ||
                    type.includes("svg") ||
                    href.toLowerCase().endsWith(".svg")
                ) {

                    size = 32;

                } else {

                    const sizes = [
                        ...sizesAttr.matchAll(/(\d+)x\d+/g)
                    ].map((m) => Number(m[1]));

                    if (sizes.length) {

                        size = sizes.reduce(
                            (best, s) =>
                                score(s) < score(best) ? s : best
                        );
                    }
                }

                function score(s) {
                    return s >= 32
                        ? s - 32
                        : (32 - s) * 2;
                }

                (isIcon ? icons : touchIcons).push({
                    href,
                    score: score(size),
                    index
                });
            });

        const sort = (a, b) =>
            a.score - b.score || a.index - b.index;

        return [
            ...icons.sort(sort),
            ...touchIcons.sort(sort)
        ].map((item) => item.href);
    }


    // -----------------------------------------
    // Descargar la página y leer sus iconos
    // -----------------------------------------

    async function fetchDeclaredIcons(pageUrl, timeoutMs = 6000) {

        const controller = new AbortController();

        const timer = setTimeout(
            () => controller.abort(),
            timeoutMs
        );

        try {

            const response = await fetch(pageUrl, {
                credentials: "include",
                redirect: "follow",
                signal: controller.signal
            });

            if (!response.ok) {
                return [];
            }

            const contentType =
                response.headers.get("content-type") || "";

            if (!/html/i.test(contentType)) {
                return [];
            }

            // El <head> está al principio: no hace falta más
            const html =
                (await response.text()).slice(0, 300000);

            return parseIconsFromHtml(
                html,
                response.url || pageUrl
            );

        } catch {

            return [];

        } finally {

            clearTimeout(timer);
        }
    }


    // -----------------------------------------
    // URL de la API de favicons de Chrome
    // -----------------------------------------

    function getChromeFaviconUrl(pageUrl, size = 64) {

        const u = new URL(
            chrome.runtime.getURL("/_favicon/")
        );

        u.searchParams.set("pageUrl", pageUrl);
        u.searchParams.set("size", String(size));

        return u.toString();
    }


    // -----------------------------------------
    // "Huella" de una imagen (para detectar
    // el globo genérico que Chrome devuelve
    // cuando no conoce el sitio)
    // -----------------------------------------

    function getImageSignature(img) {

        try {

            const canvas =
                document.createElement("canvas");

            canvas.width = 16;
            canvas.height = 16;

            const ctx = canvas.getContext(
                "2d",
                { willReadFrequently: true }
            );

            ctx.drawImage(img, 0, 0, 16, 16);

            return Array
                .from(
                    ctx.getImageData(0, 0, 16, 16).data
                )
                .join(",");

        } catch {

            return null;
        }
    }


    async function getDefaultChromeFaviconSignature() {

        if (defaultChromeFaviconSignature === null) {

            defaultChromeFaviconSignature =
                (async () => {

                    const img = await loadFaviconImage(
                        getChromeFaviconUrl(
                            "https://sitio-inexistente.invalid/"
                        )
                    );

                    return img
                        ? getImageSignature(img)
                        : "";

                })();
        }

        return defaultChromeFaviconSignature;
    }


    // -----------------------------------------
    // Favicon desde Chrome (ignora el genérico)
    // -----------------------------------------

    async function loadChromeFavicon(pageUrl) {

        if (
            typeof chrome === "undefined" ||
            !chrome.runtime ||
            !chrome.runtime.getURL
        ) {
            return null;
        }

        const img = await loadFaviconImage(
            getChromeFaviconUrl(pageUrl)
        );

        if (!img) {
            return null;
        }

        const signature = getImageSignature(img);

        const defaultSignature =
            await getDefaultChromeFaviconSignature();

        if (
            signature &&
            defaultSignature &&
            signature === defaultSignature
        ) {
            return null;
        }

        return img;
    }


    // -----------------------------------------
    // Dominio principal (soporta .com.co, etc.)
    // -----------------------------------------

    function getMainDomain(hostname) {

        const parts = hostname.split(".");

        if (parts.length <= 2) {
            return hostname;
        }

        const lastTwo =
            parts.slice(-2).join(".");

        const specialTlds = [
            "com.co", "org.co", "net.co",
            "gov.co", "edu.co", "mil.co",
            "co.uk", "org.uk", "ac.uk",
            "com.au", "net.au", "org.au",
            "co.nz",
            "com.br", "com.mx", "com.ar"
        ];

        if (specialTlds.includes(lastTwo)) {
            return parts.slice(-3).join(".");
        }

        return parts.slice(-2).join(".");
    }


    // -----------------------------------------
    // Favicons de pestañas abiertas
    // (primero URL exacta, luego mismo host)
    // -----------------------------------------

    async function getOpenTabFavicons(normalizedUrl, hostname) {

        const exact = [];
        const sameHost = [];

        try {

            if (
                !chrome.tabs ||
                typeof chrome.tabs.query !== "function"
            ) {
                return [];
            }

            const tabs = await chrome.tabs.query({});

            for (const tab of tabs) {

                if (!tab.url || !tab.favIconUrl) {
                    continue;
                }

                try {

                    const tabUrl = new URL(tab.url);

                    tabUrl.hash = "";

                    const tabNormalized =
                        tabUrl.href.replace(/\/$/, "");

                    if (tabNormalized === normalizedUrl) {

                        exact.push(tab.favIconUrl);

                    } else if (
                        tabUrl.hostname.toLowerCase() === hostname
                    ) {

                        sameHost.push(tab.favIconUrl);
                    }

                } catch {
                    // URL inválida: ignorar
                }
            }

        } catch {
            return [];
        }

        return [...exact, ...sameHost];
    }


    // =========================================
    // CONFIGURAR ICONO DEL SITIO
    // =========================================

    function setup(siteIcon, url) {

        // Fallback inicial
        siteIcon.textContent = "🌐";


        // Validar URL
        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch {
            return;
        }

        if (!/^https?:$/.test(parsedUrl.protocol)) {
            return;
        }


        // Evita que una búsqueda antigua pise a una nueva
        // (por ejemplo, al editar la URL de la tarjeta)
        const token =
            `${Date.now()}_${Math.random()}`;

        siteIcon.dataset.iconToken = token;

        const isStale = () =>
            siteIcon.dataset.iconToken !== token;


        const hostname =
            parsedUrl.hostname.toLowerCase();

        // La parte #/ruta (apps tipo Angular/React) no
        // se envía al servidor: la quitamos para buscar.
        const pageUrlObject = new URL(parsedUrl.href);

        pageUrlObject.hash = "";

        const pageUrl = pageUrlObject.href;

        const normalizedUrl =
            pageUrl.replace(/\/$/, "");

        const mainDomain =
            getMainDomain(hostname);

        const cacheKey =
            FAVICON_CACHE_PREFIX + normalizedUrl;


        function show(img) {
            siteIcon.replaceChildren(img);
        }

        function saveCache(faviconUrl) {

            // No guardamos data: (muy pesados)
            if (
                !faviconUrl ||
                faviconUrl.startsWith("data:")
            ) {
                return;
            }

            chrome.storage.local
                .set({ [cacheKey]: faviconUrl })
                .catch(() => { });
        }


        // Prueba una lista de URLs de imagen en orden.
        // Devuelve true si ya terminó (se mostró o quedó obsoleto).
        async function tryImageList(list) {

            for (const src of list) {

                const img = await loadFaviconImage(src);

                if (isStale()) return true;

                if (img) {
                    show(img);
                    saveCache(src);
                    return true;
                }
            }

            return false;
        }


        async function resolveFavicon() {

            // 1. Pestañas abiertas
            const tabFavicons =
                await getOpenTabFavicons(
                    normalizedUrl,
                    hostname
                );

            if (await tryImageList(tabFavicons)) {
                return;
            }


            // 2. Caché (verificado)
            try {

                const stored =
                    await chrome.storage.local.get(cacheKey);

                const cached = stored[cacheKey];

                if (cached) {

                    const img =
                        await loadFaviconImage(cached);

                    if (isStale()) return;

                    if (img) {
                        show(img);
                        return;
                    }

                    // El icono guardado ya no sirve
                    chrome.storage.local
                        .remove(cacheKey)
                        .catch(() => { });
                }

            } catch {
                // Sin caché: seguimos
            }


            // 3. Icono declarado por la página
            //    (el mismo que muestra la pestaña)
            const declared =
                await fetchDeclaredIcons(pageUrl);

            if (isStale()) return;

            if (await tryImageList(declared)) {
                return;
            }


            // 4. API de favicons de Chrome
            const chromePages = [
                ...new Set([
                    parsedUrl.href,
                    pageUrl,
                    `https://${hostname}/`,
                    `https://${mainDomain}/`
                ])
            ];

            for (const chromePage of chromePages) {

                const img =
                    await loadChromeFavicon(chromePage);

                if (isStale()) return;

                if (img) {
                    show(img);
                    return;
                }
            }


            // 5. /favicon.ico directo
            const direct = [
                `https://${hostname}/favicon.ico`
            ];

            if (mainDomain !== hostname) {
                direct.push(
                    `https://${mainDomain}/favicon.ico`
                );
            }

            await tryImageList(direct);

            // 6. Se queda el 🌐
        }

        resolveFavicon();
    }

    return { setup };

})();


// =========================================
// FUNCIÓN QUE USA EL RESTO DEL PROGRAMA
// =========================================

function setupSiteIcon(siteIcon, url) {

    faviconTools.setup(siteIcon, url);
}
// <<< FIN ICONO DEL SITIO <

// =========================================
// CREAR TARJETA DE SITIO
// =========================================

function createSiteCard(
    name,
    url,
    description
) {

    const site =
        document.createElement(
            "div"
        );

    site.className =
        "site-card";

    site.dataset.url =
        url;


    // -----------------------------------------
    // ICONO
    // -----------------------------------------

    const siteIcon =
        document.createElement(
            "div"
        );

    siteIcon.className =
        "site-icon";

    setupSiteIcon(
        siteIcon,
        url
    );


    // -----------------------------------------
    // NOMBRE
    // -----------------------------------------

    const siteName =
        document.createElement(
            "span"
        );

    siteName.className =
        "site-name";

    siteName.textContent =
        name;


    // -----------------------------------------
    // DESCRIPCIÓN
    // -----------------------------------------
    //
    // IMPORTANTE:
    //
    // Solo creamos .site-description
    // si realmente existe texto.
    //
    // Si está vacía, NO se crea.
    //

    let siteDescription = null;

    if (
        description &&
        description.trim() !== ""
    ) {

        siteDescription =
            document.createElement(
                "div"
            );

        siteDescription.className =
            "site-description";

        siteDescription.textContent =
            description.trim();
    }


    // -----------------------------------------
    // BOTÓN DEL MENÚ
    // -----------------------------------------

    const siteMenuButton =
        document.createElement(
            "button"
        );

    siteMenuButton.type =
        "button";

    siteMenuButton.className =
        "site-menu-button";

    siteMenuButton.textContent =
        "⋮";


    // -----------------------------------------
    // MENÚ
    // -----------------------------------------

    const siteMenu =
        document.createElement(
            "div"
        );

    siteMenu.className =
        "site-menu";


    const editSiteButton =
        document.createElement(
            "button"
        );

    editSiteButton.type =
        "button";

    editSiteButton.className =
        "edit-site-button";

    editSiteButton.innerHTML = `
        <span class="menu-icon">✏️</span>
        Editar sitio
    `;


    const deleteSiteButton =
        document.createElement(
            "button"
        );

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


    // -----------------------------------------
    // CONSTRUIR TARJETA
    // -----------------------------------------

    site.appendChild(
        siteIcon
    );

    site.appendChild(
        siteName
    );

    // Solo se agrega si existe.
    if (siteDescription) {

        site.appendChild(
            siteDescription
        );
    }

    site.appendChild(
        siteMenuButton
    );

    site.appendChild(
        siteMenu
    );


    // -----------------------------------------
    // CONFIGURAR FUNCIONALIDADES
    // -----------------------------------------

    setupSiteCard(site);
    setupSiteDrag(site);


    // -----------------------------------------
    // EDITAR SITIO
    // -----------------------------------------

    editSiteButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();
            event.stopPropagation();

            openEditSite(site);

            closeMenu(
                siteMenu
            );
        }
    );


    // -----------------------------------------
    // ELIMINAR SITIO
    // -----------------------------------------

    deleteSiteButton.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();
            event.stopPropagation();

            site.remove();

            await saveCurrentData();

            filterSiteCards();

            closeMenu(
                siteMenu
            );
        }
    );

    return site;
}


// =========================================
// TARJETA AGREGAR SITIO
// =========================================

function setupAddSiteCard(
    addSiteCard
) {

    if (
        addSiteCard.dataset.addConfigured ===
        "true"
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
                addSiteCard.closest(
                    ".site-group"
                );

            groupBeingAddedTo =
                group;

            addSiteGroup.style.display =
                "none";

            openAddSite();
        }
    );
}


// =========================================
// BOTÓN GLOBAL AGREGAR SITIO
// =========================================

const addSiteButton =
    document.getElementById(
        "add-site-button"
    );

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
                "https://" +
                newUrl;
        }


        try {

            const url =
                new URL(newUrl);

            if (
                !url.hostname.includes(".")
            ) {

                addSiteUrlError.textContent =
                    "Introduce una URL válida.";

                return;
            }

        } catch {

            addSiteUrlError.textContent =
                "Introduce una URL válida.";

            return;
        }


        if (
            groupBeingAddedTo ===
            null
        ) {

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


        applyTextColors(
            cardTextColorInput.value,
            addSiteTextColorInput.value
        );


        await saveCurrentData();

        filterSiteCards();

        closeAddSite();
    }
);


// =========================================
// AGREGAR GRUPO
// =========================================

const addGroupButton =
    document.getElementById(
        "add-group-button"
    );

const addGroupOverlay =
    document.getElementById(
        "add-group-overlay"
    );

const addGroupName =
    document.getElementById(
        "add-group-name"
    );

const addGroupNameError =
    document.getElementById(
        "add-group-name-error"
    );

const closeAddGroupButton =
    document.getElementById(
        "close-add-group-button"
    );

const cancelAddGroupButton =
    document.getElementById(
        "cancel-add-group-button"
    );

const saveAddGroupButton =
    document.getElementById(
        "save-add-group-button"
    );


function clearAddGroupErrors() {
    addGroupNameError.textContent =
        "";
}

function resetAddGroupForm() {

    addGroupName.value =
        "";

    clearAddGroupErrors();
}

function openAddGroup() {

    resetAddGroupForm();

    openOverlay(
        addGroupOverlay
    );

    addGroupName.focus();
}

function closeAddGroup() {

    closeOverlay(
        addGroupOverlay
    );

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

        if (
            event.target ===
            addGroupOverlay
        ) {

            closeAddGroup();
        }
    }
);


// =========================================
// CREAR GRUPO
// =========================================

function createGroup(name) {

    const group =
        document.createElement(
            "section"
        );

    group.className =
        "site-group";


    const groupHeader =
        document.createElement(
            "div"
        );

    groupHeader.className =
        "group-header";


    const groupTitleContainer =
        document.createElement(
            "div"
        );

    groupTitleContainer.className =
        "group-title-container";


    const groupTitle =
        document.createElement(
            "h2"
        );

    groupTitle.textContent =
        name;


    const groupMenuButton =
        document.createElement(
            "button"
        );

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
        document.createElement(
            "div"
        );

    groupMenu.className =
        "group-menu";


    const editGroupButton =
        document.createElement(
            "button"
        );

    editGroupButton.type =
        "button";

    editGroupButton.className =
        "edit-group-button";

    editGroupButton.innerHTML = `
        <span class="menu-icon">✏️</span>
        Editar grupo
    `;


    const deleteGroupButton =
        document.createElement(
            "button"
        );

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
        document.createElement(
            "div"
        );

    sitesContainer.className =
        "sites-container";


    const addSiteCard =
        document.createElement(
            "div"
        );

    addSiteCard.className =
        "add-site-card";


    const addSiteIcon =
        document.createElement(
            "div"
        );

    addSiteIcon.className =
        "add-site-icon";

    addSiteIcon.textContent =
        "+";


    const addSiteNameLabel =
        document.createElement(
            "span"
        );

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


    setupGroupMenu(group);
    setupGroupDrag(group);
    setupAddSiteCard(addSiteCard);


    editGroupButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();
            event.stopPropagation();

            openEditGroup(group);

            closeMenu(
                groupMenu
            );
        }
    );


    deleteGroupButton.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();
            event.stopPropagation();

            group.remove();

            await saveCurrentData();

            closeMenu(
                groupMenu
            );
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
            createGroup(
                newName
            );


        const main =
            document.querySelector(
                "main"
            );

        main.appendChild(
            newGroup
        );


        applyGroupAppearance(
            groupColorInput.value,
            groupTransparencyInput.value
        );


        applyTextColors(
            cardTextColorInput.value,
            addSiteTextColorInput.value
        );


        await saveCurrentData();

        filterSiteCards();

        closeAddGroup();
    }
);


// =========================================
// EDITAR SITIO
// =========================================

const editSiteOverlay =
    document.getElementById(
        "edit-site-overlay"
    );

const editSiteName =
    document.getElementById(
        "edit-site-name"
    );

const editSiteUrl =
    document.getElementById(
        "edit-site-url"
    );

const editSiteDescription =
    document.getElementById(
        "edit-site-description"
    );

const editSiteUrlError =
    document.getElementById(
        "edit-site-url-error"
    );

const editSiteNameError =
    document.getElementById(
        "edit-site-name-error"
    );

const closeEditSiteButton =
    document.getElementById(
        "close-edit-site-button"
    );

const cancelEditSiteButton =
    document.getElementById(
        "cancel-edit-site-button"
    );

const saveEditSiteButton =
    document.getElementById(
        "save-edit-site-button"
    );

let siteBeingEdited = null;


function clearEditSiteErrors() {

    editSiteNameError.textContent =
        "";

    editSiteUrlError.textContent =
        "";
}


function resetEditSiteForm() {

    editSiteName.value =
        "";

    editSiteUrl.value =
        "";

    editSiteDescription.value =
        "";

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


    // IMPORTANTE:
    //
    // Si la tarjeta no tiene descripción,
    // simplemente dejamos el campo vacío.
    //
    editSiteDescription.value =
        siteDescription
            ?.textContent
            .trim() || "";


    openOverlay(
        editSiteOverlay
    );


    editSiteName.focus();
    editSiteName.select();
}


function closeEditSite() {

    closeOverlay(
        editSiteOverlay
    );

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

        if (
            event.target ===
            editSiteOverlay
        ) {

            closeEditSite();
        }
    }
);


// =========================================
// BOTONES EDITAR SITIOS EXISTENTES
// =========================================

function setupExistingSiteEditButtons() {

    document
        .querySelectorAll(
            ".edit-site-button"
        )
        .forEach((button) => {

            if (
                button.dataset.editConfigured ===
                "true"
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
                        button.closest(
                            ".site-card"
                        );

                    openEditSite(
                        site
                    );

                    closeMenu(
                        site.querySelector(
                            ".site-menu"
                        )
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
                "https://" +
                newUrl;
        }


        try {

            const url =
                new URL(newUrl);

            if (
                !url.hostname.includes(".")
            ) {

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
            getSiteName(
                siteBeingEdited
            );


        siteName.textContent =
            newName;


        siteBeingEdited.dataset.url =
            newUrl;


        // -----------------------------------------
        // ACTUALIZAR DESCRIPCIÓN
        // -----------------------------------------
        //
        // Aquí está una de las correcciones
        // principales.
        //
        // La función:
        //
        // - crea la descripción si no existía
        // - cambia el texto si existía
        // - la elimina si queda vacía
        //

        updateSiteDescription(
            siteBeingEdited,
            newDescription
        );


        const siteIcon =
            siteBeingEdited.querySelector(
                ".site-icon"
            );


        if (siteIcon) {

            setupSiteIcon(
                siteIcon,
                newUrl
            );
        }


        await saveCurrentData();

        filterSiteCards();

        closeEditSite();
    }
);


// =========================================
// EDITAR GRUPO
// =========================================

const editGroupOverlay =
    document.getElementById(
        "edit-group-overlay"
    );

const editGroupName =
    document.getElementById(
        "edit-group-name"
    );

const editGroupNameError =
    document.getElementById(
        "edit-group-name-error"
    );

const closeEditGroupButton =
    document.getElementById(
        "close-edit-group-button"
    );

const cancelEditGroupButton =
    document.getElementById(
        "cancel-edit-group-button"
    );

const saveEditGroupButton =
    document.getElementById(
        "save-edit-group-button"
    );

let groupBeingEdited = null;


function clearEditGroupErrors() {

    editGroupNameError.textContent =
        "";
}


function resetEditGroupForm() {

    editGroupName.value =
        "";

    clearEditGroupErrors();
}


function openEditGroup(group) {

    groupBeingEdited =
        group;

    const groupTitle =
        getGroupTitle(
            group
        );

    resetEditGroupForm();

    editGroupName.value =
        groupTitle.textContent.trim();

    openOverlay(
        editGroupOverlay
    );

    closeMenu(
        group.querySelector(
            ".group-menu"
        )
    );

    editGroupName.focus();
    editGroupName.select();
}


function closeEditGroup() {

    closeOverlay(
        editGroupOverlay
    );

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

        if (
            event.target ===
            editGroupOverlay
        ) {

            closeEditGroup();
        }
    }
);


// =========================================
// BOTONES EDITAR GRUPOS
// =========================================

function setupExistingGroupEditButtons() {

    document
        .querySelectorAll(
            ".edit-group-button"
        )
        .forEach((button) => {

            if (
                button.dataset.editConfigured ===
                "true"
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
                        button.closest(
                            ".site-group"
                        );

                    openEditGroup(
                        group
                    );
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
            getGroupTitle(
                groupBeingEdited
            );


        groupTitle.textContent =
            newName;


        await saveCurrentData();

        closeEditGroup();
    }
);


// =========================================
// MOSTRAR GRUPOS
// =========================================

function renderGroups(groups) {

    const main =
        document.querySelector(
            "main"
        );

    groups.forEach(
        (groupData) => {

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


            (
                groupData.sites || []
            ).forEach(
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
        }
    );
}


// =========================================
// TAMAÑO DEL CONTENEDOR
// =========================================

const containerWidthInput =
    document.getElementById(
        "container-width"
    );


function applyContainerWidth(
    width
) {

    let preferredWidth =
        Number(width);

    if (isNaN(preferredWidth)) {

        preferredWidth =
            defaultSettings.containerWidth;
    }


    if (preferredWidth < 475) {
        preferredWidth = 475;
    }


    const maxWidth =
        Math.floor(
            window.innerWidth * 0.92
        );


    const appliedWidth =
        Math.min(
            preferredWidth,
            maxWidth
        );


    document.documentElement.style.setProperty(
        "--container-width",
        `${appliedWidth}px`
    );


    containerWidthInput.value =
        preferredWidth;
}


// =========================================
// GUARDAR CAMBIO DE ANCHO
// =========================================

containerWidthInput.addEventListener(
    "change",
    async () => {

        let preferredWidth =
            Number(
                containerWidthInput.value
            );


        if (isNaN(preferredWidth)) {

            preferredWidth =
                defaultSettings.containerWidth;
        }


        if (preferredWidth < 475) {
            preferredWidth = 475;
        }


        const maxWidth =
            Math.floor(
                window.innerWidth * 0.92
            );


        if (
            preferredWidth >
            maxWidth
        ) {

            preferredWidth =
                maxWidth;
        }


        applyContainerWidth(
            preferredWidth
        );


        const data =
            await loadData();


        await saveData({
            settings: {
                ...defaultSettings,
                ...data.settings,
                containerWidth:
                    preferredWidth
            }
        });
    }
);


// =========================================
// ACTUALIZAR ANCHO AL REDIMENSIONAR
// =========================================

window.addEventListener(
    "resize",
    () => {

        applyContainerWidth(
            containerWidthInput.value
        );
    }
);


// =========================================
// TAMAÑO DE TARJETAS
// =========================================

const cardSizeInput =
    document.getElementById(
        "card-size"
    );


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
        .forEach(
            (card) => {

                card.style.width =
                    `${validSize}px`;

                card.style.height =
                    `${validSize}px`;
            }
        );


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
// APARIENCIA DE GRUPOS
// =========================================

const groupColorInput =
    document.getElementById(
        "group-color"
    );

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
        .querySelectorAll(
            ".site-group"
        )
        .forEach(
            (group) => {

                group.style.backgroundColor =
                    rgba;
            }
        );


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
// APARIENCIA DE TARJETAS
// =========================================

const cardColorInput =
    document.getElementById(
        "card-color"
    );

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
        .forEach(
            (card) => {

                card.style.backgroundColor =
                    rgba;
            }
        );


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
// COLOR DEL TEXTO
// =========================================

const cardTextColorInput =
    document.getElementById(
        "card-text-color"
    );

const addSiteTextColorInput =
    document.getElementById(
        "add-site-text-color"
    );


function applyTextColors(
    cardTextColor,
    addSiteTextColor
) {

    document
        .querySelectorAll(
            ".site-name"
        )
        .forEach(
            (siteName) => {

                siteName.style.color =
                    cardTextColor;
            }
        );


    document
        .querySelectorAll(
            ".add-site-name"
        )
        .forEach(
            (addSiteName) => {

                addSiteName.style.color =
                    addSiteTextColor;
            }
        );


    cardTextColorInput.value =
        cardTextColor;

    addSiteTextColorInput.value =
        addSiteTextColor;
}


cardTextColorInput.addEventListener(
    "input",
    async () => {

        const cardTextColor =
            cardTextColorInput.value;

        const addSiteTextColor =
            addSiteTextColorInput.value;


        applyTextColors(
            cardTextColor,
            addSiteTextColor
        );


        const data =
            await loadData();


        await saveData({
            settings: {
                ...defaultSettings,
                ...data.settings,
                cardTextColor:
                    cardTextColor,
                addSiteTextColor:
                    addSiteTextColor
            }
        });
    }
);


addSiteTextColorInput.addEventListener(
    "input",
    async () => {

        const cardTextColor =
            cardTextColorInput.value;

        const addSiteTextColor =
            addSiteTextColorInput.value;


        applyTextColors(
            cardTextColor,
            addSiteTextColor
        );


        const data =
            await loadData();


        await saveData({
            settings: {
                ...defaultSettings,
                ...data.settings,
                cardTextColor:
                    cardTextColor,
                addSiteTextColor:
                    addSiteTextColor
            }
        });
    }
);


// =========================================
// FONDO
// =========================================

const backgroundColorInput =
    document.getElementById(
        "background-color"
    );


function applyBackgroundColor(
    color
) {

    document.documentElement.classList.remove(
        "initial-background-image"
    );

    document.documentElement.style.removeProperty(
        "--initial-background-image"
    );


    document.body.style.backgroundColor =
        color;

    document.body.style.backgroundImage =
        "none";


    localStorage.setItem(
        "newtabBackgroundType",
        "solid"
    );

    localStorage.removeItem(
        "newtabBackgroundImage"
    );
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

let pendingBackgroundImage = null;


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


function applyBackgroundImage(
    imageData
) {

    return new Promise(
        (resolve) => {

            const image =
                new Image();


            image.onload = () => {

                document.documentElement.classList.add(
                    "initial-background-image"
                );


                document.documentElement.style.setProperty(
                    "--initial-background-image",
                    `url("${imageData}")`
                );


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


                localStorage.setItem(
                    "newtabBackgroundType",
                    "image"
                );

                localStorage.setItem(
                    "newtabBackgroundImage",
                    imageData
                );


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
            await imageToDataURL(
                file
            );


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


    return Array.from(
        colorInputs
    ).map(
        (input) =>
            input.value
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


    document.documentElement.classList.remove(
        "initial-background-image"
    );


    document.documentElement.style.removeProperty(
        "--initial-background-image"
    );


    document.body.style.backgroundColor =
        "transparent";


    document.body.style.backgroundImage =
        createGradientCSS(
            direction,
            colors
        );


    document.body.style.backgroundSize =
        "cover";


    localStorage.setItem(
        "newtabBackgroundType",
        "gradient"
    );


    localStorage.removeItem(
        "newtabBackgroundImage"
    );
}


function createGradientColor(
    color,
    number
) {

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "gradient-color";


    const label =
        document.createElement(
            "span"
        );

    label.className =
        "gradient-color-label";

    label.textContent =
        `Color ${number}`;


    const input =
        document.createElement(
            "input"
        );

    input.type =
        "color";

    input.value =
        color;


    const removeButton =
        document.createElement(
            "button"
        );

    removeButton.type =
        "button";

    removeButton.className =
        "remove-gradient-color-button";

    removeButton.textContent =
        "×";


    removeButton.addEventListener(
        "click",
        async () => {

            const colors =
                getGradientColors();


            if (colors.length <= 2) {
                return;
            }


            wrapper.remove();

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


    input.addEventListener(
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


    wrapper.appendChild(
        label
    );

    wrapper.appendChild(
        input
    );

    wrapper.appendChild(
        removeButton
    );


    return wrapper;
}


function updateGradientColorLabels() {

    const colors =
        gradientColorsContainer.querySelectorAll(
            ".gradient-color"
        );


    colors.forEach(
        (colorElement, index) => {

            const label =
                colorElement.querySelector(
                    ".gradient-color-label"
                );


            if (label) {

                label.textContent =
                    `Color ${index + 1}`;
            }
        }
    );
}


addGradientColorButton.addEventListener(
    "click",
    async () => {

        const colors =
            getGradientColors();


        const newColor =
            colors[
            colors.length - 1
            ] ||
            defaultSettings
                .gradientColors[1];


        const gradientColor =
            createGradientColor(
                newColor,
                colors.length + 1
            );


        gradientColorsContainer.appendChild(
            gradientColor
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
            gradientDirection:
                direction,
            gradientColors:
                colors
        }
    });
}


function loadGradientColors(
    colors
) {

    gradientColorsContainer.innerHTML =
        "";


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


gradientDirectionInput.addEventListener(
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

                if (
                    radio.value ===
                    "solid"
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


                if (
                    radio.value ===
                    "image"
                ) {

                    const data =
                        await loadData();


                    const backgroundImage =
                        pendingBackgroundImage ??
                        data.settings?.backgroundImage;


                    if (backgroundImage) {

                        applyBackgroundImage(
                            backgroundImage
                        )
                            .then(
                                async (
                                    imageLoaded
                                ) => {

                                    if (
                                        imageLoaded
                                    ) {

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
                                }
                            );
                    }
                }


                if (
                    radio.value ===
                    "gradient"
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
// REINICIAR
// =========================================

const resetBackgroundButton =
    document.getElementById(
        "reset-background-button"
    );

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


function openResetConfirmation() {

    openOverlay(
        resetConfirmationOverlay
    );
}


function closeResetConfirmation() {

    closeOverlay(
        resetConfirmationOverlay
    );
}


async function resetExtension() {

    closeAllMenus();


    closeOverlay(
        addSiteOverlay
    );

    closeOverlay(
        addGroupOverlay
    );

    closeOverlay(
        editSiteOverlay
    );

    closeOverlay(
        editGroupOverlay
    );

    closeOverlay(
        resetConfirmationOverlay
    );


    groupBeingAddedTo =
        null;

    siteBeingEdited =
        null;

    groupBeingEdited =
        null;

    pendingBackgroundImage =
        null;


    localStorage.removeItem(
        "newtabBackgroundType"
    );

    localStorage.removeItem(
        "newtabBackgroundImage"
    );


    document.documentElement.classList.remove(
        "initial-background-image"
    );

    document.documentElement.style.removeProperty(
        "--initial-background-image"
    );


    await chrome.storage.local.clear();


    const resetData = {
        groups: [
            {
                name: "Mis sitios",
                sites: [
                    {
                        name: "Google",
                        url: "https://www.google.com",
                        description:
                            "Motor de búsqueda"
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


    await saveData(
        resetData
    );


    const main =
        document.querySelector(
            "main"
        );


    main.innerHTML =
        "";


    renderGroups(
        resetData.groups
    );


    setupExistingElements();


    applyContainerWidth(
        defaultSettings.containerWidth
    );


    applyCardSize(
        defaultSettings.cardSize
    );


    applyGroupAppearance(
        defaultSettings.groupColor,
        defaultSettings.groupTransparency
    );


    applyCardAppearance(
        defaultSettings.cardColor,
        defaultSettings.cardTransparency
    );


    applyTextColors(
        defaultSettings.cardTextColor,
        defaultSettings.addSiteTextColor
    );


    backgroundColorInput.value =
        defaultSettings.backgroundColor;


    applyBackgroundColor(
        defaultSettings.backgroundColor
    );


    document.getElementById(
        "background-solid"
    ).checked = true;


    document.getElementById(
        "background-image"
    ).checked = false;


    document.getElementById(
        "background-gradient"
    ).checked = false;


    gradientDirectionInput.value =
        defaultSettings.gradientDirection;


    loadGradientColors(
        defaultSettings.gradientColors
    );


    backgroundImageInput.value =
        "";


    filterSiteCards();

    closeSettings();
}


resetBackgroundButton.addEventListener(
    "click",
    openResetConfirmation
);

closeResetConfirmationButton.addEventListener(
    "click",
    closeResetConfirmation
);

cancelResetButton.addEventListener(
    "click",
    closeResetConfirmation
);

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


confirmResetButton.addEventListener(
    "click",
    async () => {

        closeResetConfirmation();

        await resetExtension();
    }
);


// =========================================
// IMPORTAR / EXPORTAR DATOS
// =========================================

const importDataButton =
    document.getElementById(
        "import-data-button"
    );

const exportDataButton =
    document.getElementById(
        "export-data-button"
    );

const importDataFile =
    document.getElementById(
        "import-data-file"
    );


// =========================================
// EXPORTAR DATOS
// =========================================

exportDataButton.addEventListener(
    "click",
    async () => {

        try {

            const data =
                await chrome.storage.local.get(
                    null
                );


            const json =
                JSON.stringify(
                    data,
                    null,
                    4
                );


            const blob =
                new Blob(
                    [json],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            link.download =
                "respaldo-nueva-pestana.json";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            URL.revokeObjectURL(
                url
            );

        } catch (error) {

            console.error(
                "Error al exportar los datos:",
                error
            );


            alert(
                "No se pudieron exportar los datos."
            );
        }
    }
);


// =========================================
// IMPORTAR DATOS
// =========================================

importDataButton.addEventListener(
    "click",
    () => {

        importDataFile.click();
    }
);


importDataFile.addEventListener(
    "change",
    async () => {

        const file =
            importDataFile.files[0];


        if (!file) {
            return;
        }


        try {

            const text =
                await file.text();


            const importedData =
                JSON.parse(
                    text
                );


            if (
                !importedData ||
                typeof importedData !== "object" ||
                Array.isArray(importedData)
            ) {

                alert(
                    "El archivo no contiene datos válidos."
                );


                importDataFile.value =
                    "";

                return;
            }


            if (
                !Array.isArray(
                    importedData.groups
                ) ||
                !importedData.settings ||
                typeof importedData.settings !==
                "object"
            ) {

                alert(
                    "El archivo no tiene el formato de una copia de seguridad de ReCodeVerse."
                );


                importDataFile.value =
                    "";

                return;
            }


            const confirmed =
                confirm(
                    "Importar estos datos reemplazará la configuración y los sitios actuales. ¿Quieres continuar?"
                );


            if (!confirmed) {

                importDataFile.value =
                    "";

                return;
            }


            await chrome.storage.local.clear();


            await chrome.storage.local.set(
                importedData
            );


            location.reload();

        } catch (error) {

            console.error(
                "Error al importar los datos:",
                error
            );


            alert(
                "No se pudo importar el archivo. Verifica que sea un archivo JSON válido."
            );


            importDataFile.value =
                "";
        }
    }
);


// =========================================
// CONFIGURAR ELEMENTOS EXISTENTES
// =========================================

function setupExistingElements() {

    document
        .querySelectorAll(
            ".site-group"
        )
        .forEach(
            (group) => {

                setupGroupMenu(
                    group
                );

                setupGroupDrag(
                    group
                );
            }
        );


    document
        .querySelectorAll(
            ".add-site-card"
        )
        .forEach(
            (card) => {

                setupAddSiteCard(
                    card
                );
            }
        );


    document
        .querySelectorAll(
            ".site-card"
        )
        .forEach(
            (site) => {

                setupSiteCard(
                    site
                );

                setupSiteDrag(
                    site
                );
            }
        );


    setupExistingSiteEditButtons();
    setupExistingGroupEditButtons();


    // =====================================
    // ELIMINAR GRUPOS
    // =====================================

    document
        .querySelectorAll(
            ".delete-group-button"
        )
        .forEach(
            (button) => {

                if (
                    button.dataset.deleteConfigured ===
                    "true"
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
                            button.closest(
                                ".site-group"
                            );


                        group.remove();


                        await saveCurrentData();
                    }
                );
            }
        );


    // =====================================
    // ELIMINAR SITIOS
    // =====================================

    document
        .querySelectorAll(
            ".delete-site-button"
        )
        .forEach(
            (button) => {

                if (
                    button.dataset.deleteConfigured ===
                    "true"
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
                            button.closest(
                                ".site-card"
                            );


                        site.remove();


                        await saveCurrentData();


                        filterSiteCards();
                    }
                );
            }
        );
}


// =========================================
// INICIAR
// =========================================

async function init() {

    let data =
        await loadData();


    if (!data.groups) {

        const initialGroups =
            defaultData.groups;


        const initialSettings = {
            ...defaultSettings,
            ...data.settings,
            gradientColors: [
                ...(
                    data.settings
                        ?.gradientColors ??
                    defaultSettings.gradientColors
                )
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

    /*
    console.log(
        "Datos cargados:",
        data
    );
    */

    const main =
        document.querySelector(
            "main"
        );


    main.innerHTML =
        "";


    renderGroups(
        data.groups || []
    );


    setupExistingElements();

    setupGroupDragArea();

    setupSiteDragArea();


    // =====================================
    // ANCHO DEL CONTENEDOR
    // =====================================

    const containerWidth =
        data.settings?.containerWidth ??
        defaultSettings.containerWidth;


    applyContainerWidth(
        containerWidth
    );


    // =====================================
    // TAMAÑO DE TARJETAS
    // =====================================

    const cardSize =
        data.settings?.cardSize ??
        defaultSettings.cardSize;


    applyCardSize(
        cardSize
    );


    // =====================================
    // APARIENCIA DE GRUPOS
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
    // APARIENCIA DE TARJETAS
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
    // COLORES DEL TEXTO
    // =====================================

    const cardTextColor =
        data.settings?.cardTextColor ??
        defaultSettings.cardTextColor;


    const addSiteTextColor =
        data.settings?.addSiteTextColor ??
        defaultSettings.addSiteTextColor;


    applyTextColors(
        cardTextColor,
        addSiteTextColor
    );


    // =====================================
    // COLOR DE FONDO
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
    // FONDO DE IMAGEN
    // =====================================

    if (
        backgroundType === "image" &&
        data.settings?.backgroundImage
    ) {

        document.getElementById(
            "background-image"
        ).checked = true;


        document.getElementById(
            "background-solid"
        ).checked = false;


        document.getElementById(
            "background-gradient"
        ).checked = false;


        applyBackgroundImage(
            data.settings.backgroundImage
        )
            .then(
                async (
                    imageLoaded
                ) => {

                    if (imageLoaded) {
                        return;
                    }


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
            );


        // =====================================
        // FONDO DEGRADADO
        // =====================================

    } else if (
        backgroundType ===
        "gradient"
    ) {

        const gradientDirection =
            data.settings
                ?.gradientDirection ??
            defaultSettings
                .gradientDirection;


        const gradientColors =
            data.settings
                ?.gradientColors ??
            defaultSettings
                .gradientColors;


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


        // =====================================
        // FONDO SÓLIDO
        // =====================================

    } else {

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


    filterSiteCards();
}


// =========================================
// EJECUTAR
// =========================================

init();

// =========================================
// INICIAR EXTENSIÓN
// =========================================

init();

// =========================================
// MARCADORES DE CHROME
// =========================================


// =========================================
// VARIABLES GLOBALES
// =========================================

let bookmarkContextMenu = null;

let selectedBookmarkNode = null;

let selectedBookmarkType = null;


// Nodo real de la Barra de marcadores de Chrome.
// Normalmente su ID es "1".
let bookmarksBarNode = null;


// =========================================
// ARRASTRE DE MARCADORES
// =========================================

let draggedBookmarkId = null;

let draggedBookmarkType = null; // "bookmark" | "folder"

let draggedBookmarkElement = null;

let bookmarkFileIntoFolderId = null;


// =========================================
// INFORMACIÓN DEL MOVIMIENTO ACTUAL
// =========================================
//
// Guardamos la posición ORIGINAL del elemento.
// Esto es importante para calcular correctamente
// el índice que debemos enviar a chrome.bookmarks.move()
// cuando movemos un elemento dentro del mismo padre.
//

let draggedBookmarkOriginalParentId = null;

let draggedBookmarkOriginalIndex = -1;


// =========================================
// CONTROL DE MOVIMIENTO INTERNO
// =========================================
//
// Mientras nosotros estamos realizando un movimiento,
// no queremos que los eventos de Chrome reconstruyan
// toda la interfaz.
//

let bookmarkInternalMoveInProgress = false;

let bookmarkInternalMoveReleaseTimer = null;


// =========================================
// IGNORAR "CLICKS FANTASMA"
// =========================================

let bookmarkDragJustEnded = false;

let bookmarkDragEndTime = 0;


function markBookmarkDragJustEnded() {

    bookmarkDragJustEnded =
        true;

    bookmarkDragEndTime =
        Date.now();


    setTimeout(
        function () {

            bookmarkDragJustEnded =
                false;

        },
        600
    );

}


// =========================================
// COMPROBAR CLICK RECIENTE DESPUÉS
// DE UN ARRASTRE
// =========================================

function wasBookmarkDragRecentlyEnded() {

    return (
        bookmarkDragJustEnded ||
        (
            Date.now() -
            bookmarkDragEndTime
        ) < 600
    );

}


// =========================================
// COMENZAR MOVIMIENTO INTERNO
// =========================================

function beginInternalBookmarkMove() {

    bookmarkInternalMoveInProgress =
        true;


    if (
        bookmarkInternalMoveReleaseTimer
    ) {

        clearTimeout(
            bookmarkInternalMoveReleaseTimer
        );

        bookmarkInternalMoveReleaseTimer =
            null;

    }

}


// =========================================
// TERMINAR MOVIMIENTO INTERNO
// =========================================
//
// Dejamos una pequeña ventana de seguridad para
// que los eventos de Chrome relacionados con el
// movimiento no reconstruyan la interfaz.
//

function finishInternalBookmarkMove() {

    if (
        bookmarkInternalMoveReleaseTimer
    ) {

        clearTimeout(
            bookmarkInternalMoveReleaseTimer
        );

    }


    bookmarkInternalMoveReleaseTimer =
        setTimeout(
            function () {

                bookmarkInternalMoveInProgress =
                    false;

                bookmarkInternalMoveReleaseTimer =
                    null;

            },
            800
        );

}


// =========================================
// CREAR MENÚ CONTEXTUAL
// =========================================

function createBookmarkContextMenu() {

    // Si ya existe, no crear otro.
    if (
        bookmarkContextMenu
    ) {

        // Asegurarnos de que esté directamente
        // dentro del BODY.
        if (
            bookmarkContextMenu.parentElement !==
            document.body
        ) {

            document.body.appendChild(
                bookmarkContextMenu
            );

        }

        return;

    }


    // Crear elemento.
    bookmarkContextMenu =
        document.createElement("div");


    // Clase CSS.
    bookmarkContextMenu.className =
        "bookmark-context-menu";


    // Oculto inicialmente.
    bookmarkContextMenu.style.display =
        "none";


    // El menú contextual siempre pertenece
    // al BODY.
    document.body.appendChild(
        bookmarkContextMenu
    );


    // =====================================
    // EVITAR CERRAR AL HACER CLICK DENTRO
    // =====================================

    bookmarkContextMenu.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );

}


// =========================================
// ABRIR MENÚ CONTEXTUAL
// =========================================

function openBookmarkContextMenu(
    event,
    node,
    type
) {

    event.preventDefault();

    event.stopPropagation();


    createBookmarkContextMenu();


    // =====================================
    // CERRAR MENÚS DE CARPETAS
    // =====================================

    closeBookmarkMenus();


    // =====================================
    // GUARDAR ELEMENTO SELECCIONADO
    // =====================================

    selectedBookmarkNode =
        node;

    selectedBookmarkType =
        type;


    // =====================================
    // LIMPIAR MENÚ
    // =====================================

    bookmarkContextMenu.innerHTML =
        "";


    // =====================================
    // MARCADOR
    // =====================================

    if (
        type === "bookmark"
    ) {

        const editButton =
            document.createElement("button");

        editButton.textContent =
            "✏️ Editar";


        editButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                const nodeToEdit =
                    selectedBookmarkNode;


                closeBookmarkContextMenu();


                if (!nodeToEdit) {
                    return;
                }


                openEditBookmarkModal(
                    nodeToEdit
                );

            }
        );


        bookmarkContextMenu.appendChild(
            editButton
        );


        const deleteButton =
            document.createElement("button");

        deleteButton.textContent =
            "🗑️ Eliminar";

        deleteButton.className =
            "bookmark-context-delete";


        deleteButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                const nodeToDelete =
                    selectedBookmarkNode;


                closeBookmarkContextMenu();


                if (!nodeToDelete) {
                    return;
                }


                openDeleteBookmarkModal(
                    nodeToDelete
                );

            }
        );


        bookmarkContextMenu.appendChild(
            deleteButton
        );

    }


    // =====================================
    // CARPETA
    // =====================================

    else if (
        type === "folder"
    ) {

        const editButton =
            document.createElement("button");

        editButton.textContent =
            "✏️ Renombrar";


        editButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                const nodeToEdit =
                    selectedBookmarkNode;


                closeBookmarkContextMenu();


                if (!nodeToEdit) {
                    return;
                }


                openRenameBookmarkFolderModal(
                    nodeToEdit
                );

            }
        );


        bookmarkContextMenu.appendChild(
            editButton
        );


        const newFolderButton =
            document.createElement("button");

        newFolderButton.textContent =
            "📁 Nueva carpeta";


        newFolderButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                const parentFolder =
                    selectedBookmarkNode;


                closeBookmarkContextMenu();


                if (!parentFolder) {
                    return;
                }


                openNewBookmarkFolderModal(
                    parentFolder
                );

            }
        );


        bookmarkContextMenu.appendChild(
            newFolderButton
        );


        const deleteButton =
            document.createElement("button");

        deleteButton.textContent =
            "🗑️ Eliminar";

        deleteButton.className =
            "bookmark-context-delete";


        deleteButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                const nodeToDelete =
                    selectedBookmarkNode;


                closeBookmarkContextMenu();


                if (!nodeToDelete) {
                    return;
                }


                openDeleteBookmarkFolderModal(
                    nodeToDelete
                );

            }
        );


        bookmarkContextMenu.appendChild(
            deleteButton
        );

    }


    // =====================================
    // ESPACIO VACÍO DE LA BARRA
    // =====================================

    else if (
        type === "bar"
    ) {

        const newFolderButton =
            document.createElement("button");

        newFolderButton.textContent =
            "📁 Nueva carpeta";


        newFolderButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();


                const parentNode =
                    selectedBookmarkNode;


                closeBookmarkContextMenu();


                if (!parentNode) {
                    return;
                }


                openNewBookmarkFolderModal(
                    parentNode
                );

            }
        );


        bookmarkContextMenu.appendChild(
            newFolderButton
        );

    }


    // =====================================
    // MOSTRAR MENÚ
    // =====================================

    bookmarkContextMenu.style.display =
        "block";


    const menuRect =
        bookmarkContextMenu.getBoundingClientRect();


    let left =
        event.clientX;

    let top =
        event.clientY;


    if (
        left + menuRect.width >
        window.innerWidth - 8
    ) {

        left =
            window.innerWidth -
            menuRect.width -
            8;

    }


    if (
        top + menuRect.height >
        window.innerHeight - 8
    ) {

        top =
            window.innerHeight -
            menuRect.height -
            8;

    }


    bookmarkContextMenu.style.left =
        Math.max(
            8,
            left
        ) + "px";


    bookmarkContextMenu.style.top =
        Math.max(
            8,
            top
        ) + "px";

}


// =========================================
// CERRAR MENÚS DE CARPETAS
// =========================================

function closeBookmarkMenus() {

    document
        .querySelectorAll(
            ".bookmark-menu"
        )
        .forEach(
            function (menu) {

                menu.style.display =
                    "none";

            }
        );

}


// =========================================
// CERRAR MENÚ CONTEXTUAL
// =========================================

function closeBookmarkContextMenu() {

    if (
        bookmarkContextMenu
    ) {

        bookmarkContextMenu.style.display =
            "none";

    }

}


// =========================================
// CARGAR MARCADORES
// =========================================

function loadBookmarks() {

    chrome.bookmarks.getTree(
        function (bookmarkTree) {

            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    "Error al cargar marcadores:",
                    chrome.runtime.lastError.message
                );

                return;

            }


            const bookmarksBar =
                findBookmarksBar(
                    bookmarkTree
                );


            if (
                !bookmarksBar
            ) {

                console.log(
                    "No se encontró la Barra de marcadores."
                );

                return;

            }


            bookmarksBarNode =
                bookmarksBar;


            renderBookmarksBar(
                bookmarksBar.children || []
            );

        }
    );

}


// =========================================
// BUSCAR BARRA DE MARCADORES
// =========================================

function findBookmarksBar(nodes) {

    for (
        const node of nodes
    ) {

        if (
            node.id === "1"
        ) {

            return node;

        }


        if (
            node.children
        ) {

            const result =
                findBookmarksBar(
                    node.children
                );


            if (
                result
            ) {

                return result;

            }

        }

    }


    return null;

}


// =========================================
// MOSTRAR BARRA DE MARCADORES
// =========================================

function renderBookmarksBar(nodes) {

    const bookmarksBar =
        document.getElementById(
            "bookmarks-bar"
        );


    if (
        !bookmarksBar
    ) {

        console.log(
            "No existe #bookmarks-bar."
        );

        return;

    }


    bookmarksBar.innerHTML =
        "";


    nodes.forEach(
        function (node) {

            if (
                node.url
            ) {

                createBookmarkItem(
                    node,
                    bookmarksBar
                );

            } else {

                createBookmarkFolder(
                    node,
                    bookmarksBar
                );

            }

        }
    );


    requestAnimationFrame(
        function () {

            updateBookmarkScrollButtons();

        }
    );

}


// =========================================
// CREAR MARCADOR
// =========================================

function createBookmarkItem(
    bookmark,
    container
) {

    const button =
        document.createElement("button");

    button.className =
        "bookmark-item";

    button.title =
        bookmark.title ||
        bookmark.url;


    const icon =
        document.createElement("img");

    icon.className =
        "bookmark-icon";

    icon.alt =
        "";

    icon.src =
        getBookmarkFavicon(
            bookmark.url
        );


    icon.onerror =
        function () {

            icon.onerror =
                null;

            icon.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='20' font-size='20'%3E🔖%3C/text%3E%3C/svg%3E";

        };


    const title =
        document.createElement("span");

    title.className =
        "bookmark-title";

    title.textContent =
        bookmark.title ||
        bookmark.url;


    button.appendChild(
        icon
    );

    button.appendChild(
        title
    );


    // =====================================
    // CLICK NORMAL
    // =====================================

    button.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            if (
                draggedBookmarkId ||
                wasBookmarkDragRecentlyEnded()
            ) {

                return;

            }


            closeBookmarkMenus();

            closeBookmarkContextMenu();


            window.location.href =
                bookmark.url;

        }
    );


    // =====================================
    // CLICK DERECHO
    // =====================================

    button.addEventListener(
        "contextmenu",
        function (event) {

            openBookmarkContextMenu(
                event,
                bookmark,
                "bookmark"
            );

        }
    );


    setupBookmarkItemDrag(
        button,
        bookmark
    );


    container.appendChild(
        button
    );

}


// =========================================
// OBTENER FAVICON
// =========================================

function getBookmarkFavicon(url) {

    try {

        const urlObject =
            new URL(url);

        const domain =
            urlObject.hostname;


        return (
            "https://www.google.com/s2/favicons" +
            "?domain=" +
            encodeURIComponent(domain) +
            "&sz=32"
        );

    } catch (error) {

        return "";

    }

}


// =========================================
// MOVER MARCADOR A UN ÍNDICE
// =========================================
//
// IMPORTANTE:
//
// Chrome tiene un comportamiento especial al mover
// un elemento dentro del MISMO padre.
//
// Si el elemento estaba antes del índice destino,
// debemos sumar 1 al índice enviado a Chrome.
//
// Además, si una CARPETA cambia de padre,
// reconstruimos inmediatamente la interfaz.
//
// Esto hace que:
//
// .bookmark-subfolder
//
// pase inmediatamente a:
//
// .bookmark-folder
//
// cuando sale de una carpeta.
//

function moveBookmarkNodeToIndex(
    id,
    parentId,
    index,
    originalParentId,
    originalIndex,
    movedType
) {

    let chromeIndex =
        index;


    // =====================================
    // MISMO PADRE
    // =====================================

    if (
        originalParentId === parentId &&
        originalIndex !== -1 &&
        originalIndex < index
    ) {

        chromeIndex =
            index + 1;

    }


    // =====================================
    // ASEGURAR ÍNDICE VÁLIDO
    // =====================================

    if (
        chromeIndex < 0
    ) {

        chromeIndex =
            0;

    }


    // =====================================
    // COMPROBAR SI CAMBIÓ DE PADRE
    // =====================================

    const parentChanged =
        originalParentId !== parentId;


    beginInternalBookmarkMove();


    chrome.bookmarks.move(
        id,
        {
            parentId:
                parentId,

            index:
                chromeIndex
        },
        function () {

            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    "Error al mover marcador:",
                    chrome.runtime.lastError.message
                );


                bookmarkInternalMoveInProgress =
                    false;


                loadBookmarks();

                return;

            }


            // =====================================
            // CARPETA CAMBIÓ DE PADRE
            // =====================================
            //
            // IMPORTANTE:
            //
            // No intentamos convertir manualmente
            // el elemento HTML.
            //
            // Dejamos que Chrome sea la fuente
            // de verdad y reconstruimos el árbol.
            //
            // Así una subcarpeta que salió de otra
            // carpeta se convierte inmediatamente
            // en carpeta principal.
            //

            if (
                movedType === "folder" &&
                parentChanged
            ) {

                loadBookmarks();

            }


            finishInternalBookmarkMove();

        }
    );

}


// =========================================
// MOVER MARCADOR AL FINAL DE UNA CARPETA
// =========================================
//
// Este método se usa cuando soltamos un elemento
// dentro de una carpeta.
//

function moveBookmarkNodeIntoFolder(
    id,
    parentId,
    movedType
) {

    // Guardamos el padre original antes de
    // ejecutar el movimiento.
    const originalParentId =
        draggedBookmarkOriginalParentId;


    const parentChanged =
        originalParentId !== parentId;


    beginInternalBookmarkMove();


    chrome.bookmarks.move(
        id,
        {
            parentId:
                parentId
        },
        function () {

            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    "Error al mover marcador a la carpeta:",
                    chrome.runtime.lastError.message
                );


                bookmarkInternalMoveInProgress =
                    false;


                loadBookmarks();

                return;

            }


            // =====================================
            // SI ES UNA CARPETA
            // =====================================
            //
            // Al entrar a otra carpeta debe pasar de:
            //
            // .bookmark-folder
            //
            // a:
            //
            // .bookmark-subfolder
            //
            // Por eso reconstruimos el árbol.
            //

            if (
                movedType === "folder" &&
                parentChanged
            ) {

                loadBookmarks();

            }


            finishInternalBookmarkMove();

        }
    );

}


// =========================================
// LIMPIAR RESALTADOS
// =========================================

function clearBookmarkDragHighlights() {

    document
        .querySelectorAll(
            ".bookmark-drop-inside"
        )
        .forEach(
            function (element) {

                element.classList.remove(
                    "bookmark-drop-inside"
                );

            }
        );


    bookmarkFileIntoFolderId =
        null;

}


// =========================================
// MOVER ELEMENTO ANTES DE OTRO
// =========================================

function moveBookmarkElementBefore(
    element,
    targetElement
) {

    if (
        !element ||
        !targetElement ||
        element === targetElement
    ) {

        return;

    }


    const parent =
        targetElement.parentNode;


    if (!parent) {
        return;
    }


    if (
        targetElement.previousElementSibling !==
        element
    ) {

        parent.insertBefore(
            element,
            targetElement
        );

    }

}


// =========================================
// MOVER ELEMENTO AL FINAL
// =========================================

function moveBookmarkElementToEnd(
    element,
    container
) {

    if (
        !element ||
        !container
    ) {

        return;

    }


    if (
        container.lastElementChild !==
        element
    ) {

        container.appendChild(
            element
        );

    }

}


// =========================================
// REORDENAR BARRA
// =========================================

function moveBookmarkBarElementAccordingToMouse(
    element,
    targetElement,
    event
) {

    if (
        !element ||
        !targetElement ||
        element === targetElement
    ) {

        return;

    }


    const targetRect =
        targetElement.getBoundingClientRect();


    const middleX =
        targetRect.left +
        targetRect.width / 2;


    if (
        event.clientX < middleX
    ) {

        moveBookmarkElementBefore(
            element,
            targetElement
        );

    } else {

        const nextElement =
            targetElement.nextElementSibling;


        if (
            nextElement &&
            nextElement !== element
        ) {

            moveBookmarkElementBefore(
                element,
                nextElement
            );

        } else if (
            !nextElement
        ) {

            moveBookmarkElementToEnd(
                element,
                targetElement.parentNode
            );

        }

    }

}


// =========================================
// REORDENAR MENÚ
// =========================================

function moveBookmarkMenuElementAccordingToMouse(
    element,
    targetElement,
    event
) {

    if (
        !element ||
        !targetElement ||
        element === targetElement
    ) {

        return;

    }


    const targetRect =
        targetElement.getBoundingClientRect();


    const middleY =
        targetRect.top +
        targetRect.height / 2;


    if (
        event.clientY < middleY
    ) {

        moveBookmarkElementBefore(
            element,
            targetElement
        );

    } else {

        const nextElement =
            targetElement.nextElementSibling;


        if (
            nextElement &&
            nextElement !== element
        ) {

            moveBookmarkElementBefore(
                element,
                nextElement
            );

        } else if (
            !nextElement
        ) {

            moveBookmarkElementToEnd(
                element,
                targetElement.parentNode
            );

        }

    }

}


// =========================================
// ¿MOUSE EN EL CENTRO DE CARPETA?
// =========================================

function isMouseOverFolderCenter(
    button,
    event,
    axis
) {

    const rect =
        button.getBoundingClientRect();


    if (
        axis === "horizontal"
    ) {

        const relativeX =
            event.clientX -
            rect.left;


        return (
            relativeX >
            rect.width * 0.25 &&
            relativeX <
            rect.width * 0.75
        );

    }


    const relativeY =
        event.clientY -
        rect.top;


    return (
        relativeY >
        rect.height * 0.25 &&
        relativeY <
        rect.height * 0.75
    );

}


// =========================================
// CONFIGURAR ARRASTRE - MARCADOR
// =========================================

function setupBookmarkItemDrag(
    button,
    bookmark
) {

    button.dataset.bookmarkId =
        bookmark.id;

    button.draggable =
        true;


    button.addEventListener(
        "dragstart",
        function (event) {

            event.stopPropagation();


            draggedBookmarkId =
                bookmark.id;

            draggedBookmarkType =
                "bookmark";

            draggedBookmarkElement =
                button;


            // =================================
            // GUARDAR POSICIÓN ORIGINAL
            // =================================

            const parent =
                button.parentElement;


            if (
                parent
            ) {

                if (
                    parent.id ===
                    "bookmarks-bar"
                ) {

                    draggedBookmarkOriginalParentId =
                        bookmarksBarNode
                            ? bookmarksBarNode.id
                            : null;

                } else if (
                    parent.classList.contains(
                        "bookmark-menu"
                    )
                ) {

                    draggedBookmarkOriginalParentId =
                        parent.dataset.parentId;

                } else {

                    draggedBookmarkOriginalParentId =
                        null;

                }


                draggedBookmarkOriginalIndex =
                    Array.from(
                        parent.children
                    ).indexOf(
                        button
                    );

            } else {

                draggedBookmarkOriginalParentId =
                    null;

                draggedBookmarkOriginalIndex =
                    -1;

            }


            button.classList.add(
                "bookmark-dragging"
            );


            event.dataTransfer.effectAllowed =
                "move";


            event.dataTransfer.setData(
                "text/plain",
                bookmark.id
            );

        }
    );


    button.addEventListener(
        "dragend",
        function () {

            button.classList.remove(
                "bookmark-dragging"
            );


            clearBookmarkDragHighlights();


            draggedBookmarkId =
                null;

            draggedBookmarkType =
                null;

            draggedBookmarkElement =
                null;


            draggedBookmarkOriginalParentId =
                null;

            draggedBookmarkOriginalIndex =
                -1;


            markBookmarkDragJustEnded();

        }
    );

}


// =========================================
// CONFIGURAR ARRASTRE - CARPETA
// =========================================

function setupBookmarkFolderDrag(
    folderContainer,
    button,
    folder
) {

    folderContainer.dataset.bookmarkId =
        folder.id;

    folderContainer.draggable =
        true;


    folderContainer.addEventListener(
        "dragstart",
        function (event) {

            // =================================
            // EVITAR QUE UN ELEMENTO INTERNO
            // INICIE EL DRAG DE LA CARPETA PADRE
            // =================================

            if (
                event.target.closest &&
                event.target.closest(".bookmark-menu")
            ) {

                event.preventDefault();

                return;

            }


            event.stopPropagation();


            draggedBookmarkId =
                folder.id;

            draggedBookmarkType =
                "folder";

            draggedBookmarkElement =
                folderContainer;


            // =================================
            // POSICIÓN ORIGINAL
            // =================================

            const parent =
                folderContainer.parentElement;


            if (
                parent
            ) {

                if (
                    parent.id ===
                    "bookmarks-bar"
                ) {

                    draggedBookmarkOriginalParentId =
                        bookmarksBarNode
                            ? bookmarksBarNode.id
                            : null;

                } else if (
                    parent.classList.contains(
                        "bookmark-menu"
                    )
                ) {

                    draggedBookmarkOriginalParentId =
                        parent.dataset.parentId;

                } else {

                    draggedBookmarkOriginalParentId =
                        null;

                }


                draggedBookmarkOriginalIndex =
                    Array.from(
                        parent.children
                    ).indexOf(
                        folderContainer
                    );

            } else {

                draggedBookmarkOriginalParentId =
                    null;

                draggedBookmarkOriginalIndex =
                    -1;

            }


            folderContainer.classList.add(
                "bookmark-dragging"
            );


            event.dataTransfer.effectAllowed =
                "move";


            event.dataTransfer.setData(
                "text/plain",
                folder.id
            );

        }
    );


    folderContainer.addEventListener(
        "dragend",
        function () {

            folderContainer.classList.remove(
                "bookmark-dragging"
            );


            clearBookmarkDragHighlights();


            draggedBookmarkId =
                null;

            draggedBookmarkType =
                null;

            draggedBookmarkElement =
                null;


            draggedBookmarkOriginalParentId =
                null;

            draggedBookmarkOriginalIndex =
                -1;


            markBookmarkDragJustEnded();

        }
    );

}


// =========================================
// CONFIGURAR ARRASTRE - MARCADOR EN MENÚ
// =========================================

function setupBookmarkMenuItemDrag(
    item,
    bookmark
) {

    item.dataset.bookmarkId =
        bookmark.id;

    item.draggable =
        true;


    item.addEventListener(
        "dragstart",
        function (event) {

            event.stopPropagation();


            draggedBookmarkId =
                bookmark.id;

            draggedBookmarkType =
                "bookmark";

            draggedBookmarkElement =
                item;


            const parent =
                item.parentElement;


            if (
                parent
            ) {

                draggedBookmarkOriginalParentId =
                    parent.dataset.parentId ||
                    null;


                draggedBookmarkOriginalIndex =
                    Array.from(
                        parent.children
                    ).indexOf(
                        item
                    );

            } else {

                draggedBookmarkOriginalParentId =
                    null;

                draggedBookmarkOriginalIndex =
                    -1;

            }


            item.classList.add(
                "bookmark-dragging"
            );


            event.dataTransfer.effectAllowed =
                "move";


            event.dataTransfer.setData(
                "text/plain",
                bookmark.id
            );

        }
    );


    item.addEventListener(
        "dragend",
        function () {

            item.classList.remove(
                "bookmark-dragging"
            );


            clearBookmarkDragHighlights();


            draggedBookmarkId =
                null;

            draggedBookmarkType =
                null;

            draggedBookmarkElement =
                null;


            draggedBookmarkOriginalParentId =
                null;

            draggedBookmarkOriginalIndex =
                -1;


            markBookmarkDragJustEnded();

        }
    );

}


// =========================================
// CONFIGURAR ARRASTRE - SUBCARPETA
// =========================================
//
// IMPORTANTE:
//
// Una subcarpeta está dentro de un .bookmark-menu.
//
// Por eso NO debemos hacer:
//
// event.target.closest(".bookmark-menu")
//
// para cancelar el drag.
//
// Si lo hacemos, cualquier subcarpeta que esté
// dentro de una carpeta quedará bloqueada.
//

function setupBookmarkSubfolderDrag(
    subfolder,
    button,
    folder
) {

    subfolder.dataset.bookmarkId =
        folder.id;

    subfolder.draggable =
        true;


    subfolder.addEventListener(
        "dragstart",
        function (event) {

            // =================================
            // NO BLOQUEAR POR .bookmark-menu
            // =================================

            event.stopPropagation();


            draggedBookmarkId =
                folder.id;

            draggedBookmarkType =
                "folder";

            draggedBookmarkElement =
                subfolder;


            // =================================
            // GUARDAR PADRE ORIGINAL
            // =================================

            const parent =
                subfolder.parentElement;


            if (
                parent
            ) {

                // El padre directo es el .bookmark-menu
                // de la carpeta que contiene esta subcarpeta.
                draggedBookmarkOriginalParentId =
                    parent.dataset.parentId ||
                    null;


                draggedBookmarkOriginalIndex =
                    Array.from(
                        parent.children
                    ).indexOf(
                        subfolder
                    );

            } else {

                draggedBookmarkOriginalParentId =
                    null;

                draggedBookmarkOriginalIndex =
                    -1;

            }


            subfolder.classList.add(
                "bookmark-dragging"
            );


            event.dataTransfer.effectAllowed =
                "move";


            event.dataTransfer.setData(
                "text/plain",
                folder.id
            );

        }
    );


    subfolder.addEventListener(
        "dragend",
        function () {

            subfolder.classList.remove(
                "bookmark-dragging"
            );


            clearBookmarkDragHighlights();


            draggedBookmarkId =
                null;

            draggedBookmarkType =
                null;

            draggedBookmarkElement =
                null;


            draggedBookmarkOriginalParentId =
                null;

            draggedBookmarkOriginalIndex =
                -1;


            markBookmarkDragJustEnded();

        }
    );

}


// =========================================
// CREAR CARPETA
// =========================================

function createBookmarkFolder(
    folder,
    container
) {

    const folderContainer =
        document.createElement("div");

    folderContainer.className =
        "bookmark-folder";

    folderContainer.dataset.bookmarkId =
        folder.id;


    const button =
        document.createElement("button");

    button.className =
        "bookmark-folder-button";


    const icon =
        document.createElement("span");

    icon.className =
        "bookmark-folder-icon";

    icon.textContent =
        "📁";


    const title =
        document.createElement("span");

    title.className =
        "bookmark-title";

    title.textContent =
        folder.title ||
        "Carpeta";


    button.appendChild(
        icon
    );

    button.appendChild(
        title
    );


    const menu =
        document.createElement("div");

    menu.className =
        "bookmark-menu";

    menu.style.display =
        "none";

    menu.dataset.parentId =
        folder.id;


    renderBookmarkMenu(
        folder.children || [],
        menu
    );


    // =====================================
    // CLICK IZQUIERDO
    // =====================================

    button.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            if (
                draggedBookmarkId ||
                wasBookmarkDragRecentlyEnded()
            ) {

                return;

            }


            const wasOpen =
                menu.style.display === "block";


            closeBookmarkMenus();

            closeBookmarkContextMenu();


            if (
                wasOpen
            ) {

                return;

            }


            menu.style.display =
                "block";


            menu.style.position =
                "fixed";


            const buttonRect =
                button.getBoundingClientRect();


            const menuRect =
                menu.getBoundingClientRect();


            let left =
                buttonRect.left;


            let top =
                buttonRect.bottom + 4;


            if (
                left + menuRect.width >
                window.innerWidth - 8
            ) {

                left =
                    window.innerWidth -
                    menuRect.width -
                    8;

            }


            if (
                top + menuRect.height >
                window.innerHeight - 8
            ) {

                top =
                    buttonRect.top -
                    menuRect.height -
                    4;

            }


            if (
                top < 8
            ) {

                top =
                    8;

            }


            menu.style.left =
                Math.max(
                    8,
                    left
                ) + "px";


            menu.style.top =
                Math.max(
                    8,
                    top
                ) + "px";

        }
    );


    // =====================================
    // CLICK DERECHO
    // =====================================

    button.addEventListener(
        "contextmenu",
        function (event) {

            openBookmarkContextMenu(
                event,
                folder,
                "folder"
            );

        }
    );


    setupBookmarkFolderDrag(
        folderContainer,
        button,
        folder
    );


    folderContainer.appendChild(
        button
    );

    folderContainer.appendChild(
        menu
    );

    container.appendChild(
        folderContainer
    );

}


// =========================================
// MOSTRAR CONTENIDO DE CARPETA
// =========================================

function renderBookmarkMenu(
    nodes,
    menu
) {

    menu.innerHTML =
        "";


    nodes.forEach(
        function (node) {

            if (
                node.url
            ) {

                createBookmarkMenuItem(
                    node,
                    menu
                );

            } else {

                createBookmarkSubfolder(
                    node,
                    menu
                );

            }

        }
    );

}


// =========================================
// CREAR MARCADOR DENTRO DE CARPETA
// =========================================

function createBookmarkMenuItem(
    bookmark,
    menu
) {

    const item =
        document.createElement("button");

    item.className =
        "bookmark-menu-item";

    item.title =
        bookmark.title ||
        bookmark.url;


    const icon =
        document.createElement("img");

    icon.className =
        "bookmark-icon";

    icon.alt =
        "";

    icon.src =
        getBookmarkFavicon(
            bookmark.url
        );


    icon.onerror =
        function () {

            icon.onerror =
                null;

            icon.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext y='20' font-size='20'%3E🔖%3C/text%3E%3C/svg%3E";

        };


    const title =
        document.createElement("span");

    title.className =
        "bookmark-title";

    title.textContent =
        bookmark.title ||
        bookmark.url;


    item.appendChild(
        icon
    );

    item.appendChild(
        title
    );


    item.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            if (
                draggedBookmarkId ||
                wasBookmarkDragRecentlyEnded()
            ) {

                return;

            }


            closeBookmarkMenus();

            closeBookmarkContextMenu();


            window.location.href =
                bookmark.url;

        }
    );


    item.addEventListener(
        "contextmenu",
        function (event) {

            openBookmarkContextMenu(
                event,
                bookmark,
                "bookmark"
            );

        }
    );


    setupBookmarkMenuItemDrag(
        item,
        bookmark
    );


    menu.appendChild(
        item
    );

}


// =========================================
// CREAR SUBCARPETA
// =========================================

function createBookmarkSubfolder(
    folder,
    menu
) {

    const subfolder =
        document.createElement("div");

    subfolder.className =
        "bookmark-subfolder";

    subfolder.dataset.bookmarkId =
        folder.id;


    const button =
        document.createElement("button");

    button.className =
        "bookmark-subfolder-button";


    const icon =
        document.createElement("span");

    icon.className =
        "bookmark-folder-icon";

    icon.textContent =
        "📁";


    const title =
        document.createElement("span");

    title.className =
        "bookmark-title";

    title.textContent =
        folder.title ||
        "Carpeta";


    const arrow =
        document.createElement("span");

    arrow.className =
        "bookmark-subfolder-arrow";

    arrow.textContent =
        "▶";


    button.appendChild(
        icon
    );

    button.appendChild(
        title
    );

    button.appendChild(
        arrow
    );


    const subMenu =
        document.createElement("div");

    subMenu.className =
        "bookmark-menu";

    subMenu.style.display =
        "none";

    subMenu.dataset.parentId =
        folder.id;


    renderBookmarkMenu(
        folder.children || [],
        subMenu
    );


    // =====================================
    // ABRIR SUBMENÚ
    // =====================================

    subfolder.addEventListener(
        "mouseenter",
        function () {

            const parentMenu =
                subfolder.closest(
                    ".bookmark-menu"
                );


            if (
                parentMenu
            ) {

                parentMenu
                    .querySelectorAll(
                        ":scope > .bookmark-subfolder > .bookmark-menu"
                    )
                    .forEach(
                        function (otherMenu) {

                            if (
                                otherMenu !==
                                subMenu
                            ) {

                                otherMenu.style.display =
                                    "none";

                            }

                        }
                    );

            }


            subMenu.style.display =
                "block";


            const rect =
                button.getBoundingClientRect();


            let left =
                rect.right + 4;

            let top =
                rect.top - 6;


            const menuRect =
                subMenu.getBoundingClientRect();


            if (
                left + menuRect.width >
                window.innerWidth - 8
            ) {

                left =
                    rect.left -
                    menuRect.width -
                    4;

            }


            if (
                top + menuRect.height >
                window.innerHeight - 8
            ) {

                top =
                    window.innerHeight -
                    menuRect.height -
                    8;

            }


            if (
                top < 8
            ) {

                top =
                    8;

            }


            subMenu.style.left =
                left + "px";


            subMenu.style.top =
                top + "px";

        }
    );


    // =====================================
    // CLICK DERECHO
    // =====================================

    button.addEventListener(
        "contextmenu",
        function (event) {

            openBookmarkContextMenu(
                event,
                folder,
                "folder"
            );

        }
    );


    setupBookmarkSubfolderDrag(
        subfolder,
        button,
        folder
    );


    subfolder.appendChild(
        button
    );

    subfolder.appendChild(
        subMenu
    );

    menu.appendChild(
        subfolder
    );

}


// =========================================
// FUNCIONES DE MODALES
// =========================================

function openBookmarkOverlay(
    overlay
) {

    if (!overlay) {
        return;
    }


    overlay.classList.add(
        "show"
    );

}


function closeBookmarkOverlay(
    overlay
) {

    if (!overlay) {
        return;
    }


    overlay.classList.remove(
        "show"
    );

}


function closeAllBookmarkModals() {

    closeBookmarkOverlay(
        document.getElementById(
            "edit-bookmark-overlay"
        )
    );

    closeBookmarkOverlay(
        document.getElementById(
            "delete-bookmark-overlay"
        )
    );

    closeBookmarkOverlay(
        document.getElementById(
            "rename-bookmark-folder-overlay"
        )
    );

    closeBookmarkOverlay(
        document.getElementById(
            "new-bookmark-folder-overlay"
        )
    );

    closeBookmarkOverlay(
        document.getElementById(
            "delete-bookmark-folder-overlay"
        )
    );

}


// =========================================
// EDITAR MARCADOR
// =========================================

function openEditBookmarkModal(
    bookmark
) {

    if (!bookmark) {
        return;
    }


    selectedBookmarkNode =
        bookmark;

    selectedBookmarkType =
        "bookmark";


    const overlay =
        document.getElementById(
            "edit-bookmark-overlay"
        );

    const nameInput =
        document.getElementById(
            "edit-bookmark-name"
        );

    const urlInput =
        document.getElementById(
            "edit-bookmark-url"
        );

    const nameError =
        document.getElementById(
            "edit-bookmark-name-error"
        );

    const urlError =
        document.getElementById(
            "edit-bookmark-url-error"
        );


    if (!overlay) {
        return;
    }


    if (nameError) {
        nameError.textContent = "";
    }

    if (urlError) {
        urlError.textContent = "";
    }


    if (nameInput) {

        nameInput.value =
            bookmark.title ||
            "";

    }


    if (urlInput) {

        urlInput.value =
            bookmark.url ||
            "";

    }


    openBookmarkOverlay(
        overlay
    );


    if (nameInput) {

        setTimeout(
            function () {

                nameInput.focus();

                nameInput.select();

            },
            50
        );

    }

}


// =========================================
// GUARDAR MARCADOR
// =========================================

function saveEditedBookmark() {

    if (!selectedBookmarkNode) {
        return;
    }


    const nameInput =
        document.getElementById(
            "edit-bookmark-name"
        );

    const urlInput =
        document.getElementById(
            "edit-bookmark-url"
        );

    const nameError =
        document.getElementById(
            "edit-bookmark-name-error"
        );

    const urlError =
        document.getElementById(
            "edit-bookmark-url-error"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const url =
        urlInput
            ? urlInput.value.trim()
            : "";


    if (
        name === ""
    ) {

        if (nameError) {
            nameError.textContent =
                "Escribe un nombre.";
        }

        if (nameInput) {
            nameInput.focus();
        }

        return;

    }


    if (
        url === ""
    ) {

        if (urlError) {
            urlError.textContent =
                "Escribe una URL.";
        }

        if (urlInput) {
            urlInput.focus();
        }

        return;

    }


    let validUrl;


    try {

        validUrl =
            new URL(url);

    } catch (error) {

        if (urlError) {
            urlError.textContent =
                "La URL no es válida.";
        }

        if (urlInput) {
            urlInput.focus();
        }

        return;

    }


    if (
        validUrl.protocol !== "http:" &&
        validUrl.protocol !== "https:"
    ) {

        if (urlError) {
            urlError.textContent =
                "La URL debe comenzar con http:// o https://.";
        }

        if (urlInput) {
            urlInput.focus();
        }

        return;

    }


    chrome.bookmarks.update(
        selectedBookmarkNode.id,
        {
            title:
                name,

            url:
                url
        },
        function () {

            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    "Error al editar marcador:",
                    chrome.runtime.lastError.message
                );

                if (urlError) {
                    urlError.textContent =
                        "No se pudo guardar el marcador.";
                }

                return;

            }


            closeBookmarkOverlay(
                document.getElementById(
                    "edit-bookmark-overlay"
                )
            );


            selectedBookmarkNode =
                null;

            selectedBookmarkType =
                null;


            loadBookmarks();

        }
    );

}


// =========================================
// ELIMINAR MARCADOR
// =========================================

function openDeleteBookmarkModal(
    bookmark
) {

    if (!bookmark) {
        return;
    }


    selectedBookmarkNode =
        bookmark;

    selectedBookmarkType =
        "bookmark";


    const overlay =
        document.getElementById(
            "delete-bookmark-overlay"
        );

    const message =
        document.getElementById(
            "delete-bookmark-message"
        );


    if (!overlay) {
        return;
    }


    if (message) {

        const title =
            bookmark.title ||
            bookmark.url ||
            "este marcador";


        message.textContent =
            '¿Estás seguro de que deseas eliminar "' +
            title +
            '"?';

    }


    openBookmarkOverlay(
        overlay
    );

}


// =========================================
// CONFIRMAR ELIMINACIÓN
// =========================================

function confirmDeleteBookmark() {

    if (!selectedBookmarkNode) {
        return;
    }


    const bookmarkId =
        selectedBookmarkNode.id;


    chrome.bookmarks.remove(
        bookmarkId,
        function () {

            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    "Error al eliminar marcador:",
                    chrome.runtime.lastError.message
                );

                return;

            }


            closeBookmarkOverlay(
                document.getElementById(
                    "delete-bookmark-overlay"
                )
            );


            selectedBookmarkNode =
                null;

            selectedBookmarkType =
                null;


            loadBookmarks();

        }
    );

}


// =========================================
// RENOMBRAR CARPETA
// =========================================

function openRenameBookmarkFolderModal(
    folder
) {

    if (!folder) {
        return;
    }


    selectedBookmarkNode =
        folder;

    selectedBookmarkType =
        "folder";


    const overlay =
        document.getElementById(
            "rename-bookmark-folder-overlay"
        );

    const nameInput =
        document.getElementById(
            "rename-bookmark-folder-name"
        );

    const nameError =
        document.getElementById(
            "rename-bookmark-folder-name-error"
        );


    if (!overlay) {
        return;
    }


    if (nameInput) {
        nameInput.value =
            folder.title ||
            "";
    }


    if (nameError) {
        nameError.textContent =
            "";
    }


    openBookmarkOverlay(
        overlay
    );


    if (nameInput) {

        setTimeout(
            function () {

                nameInput.focus();

                nameInput.select();

            },
            50
        );

    }

}


// =========================================
// GUARDAR NOMBRE DE CARPETA
// =========================================

function saveRenamedBookmarkFolder() {

    if (!selectedBookmarkNode) {
        return;
    }


    const nameInput =
        document.getElementById(
            "rename-bookmark-folder-name"
        );

    const nameError =
        document.getElementById(
            "rename-bookmark-folder-name-error"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    if (
        name === ""
    ) {

        if (nameError) {
            nameError.textContent =
                "Escribe un nombre.";
        }

        if (nameInput) {
            nameInput.focus();
        }

        return;

    }


    chrome.bookmarks.update(
        selectedBookmarkNode.id,
        {
            title:
                name
        },
        function () {

            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    "Error al renombrar carpeta:",
                    chrome.runtime.lastError.message
                );

                if (nameError) {
                    nameError.textContent =
                        "No se pudo cambiar el nombre.";
                }

                return;

            }


            closeBookmarkOverlay(
                document.getElementById(
                    "rename-bookmark-folder-overlay"
                )
            );


            selectedBookmarkNode =
                null;

            selectedBookmarkType =
                null;


            loadBookmarks();

        }
    );

}


// =========================================
// NUEVA CARPETA
// =========================================

function openNewBookmarkFolderModal(
    parentFolder
) {

    if (!parentFolder) {
        return;
    }


    selectedBookmarkNode =
        parentFolder;

    selectedBookmarkType =
        "folder";


    const overlay =
        document.getElementById(
            "new-bookmark-folder-overlay"
        );

    const nameInput =
        document.getElementById(
            "new-bookmark-folder-name"
        );

    const nameError =
        document.getElementById(
            "new-bookmark-folder-name-error"
        );


    if (!overlay) {
        return;
    }


    if (nameInput) {
        nameInput.value =
            "";
    }


    if (nameError) {
        nameError.textContent =
            "";
    }


    openBookmarkOverlay(
        overlay
    );


    if (nameInput) {

        setTimeout(
            function () {

                nameInput.focus();

            },
            50
        );

    }

}


// =========================================
// CREAR NUEVA CARPETA
// =========================================

function saveNewBookmarkFolder() {

    if (!selectedBookmarkNode) {
        return;
    }


    const nameInput =
        document.getElementById(
            "new-bookmark-folder-name"
        );

    const nameError =
        document.getElementById(
            "new-bookmark-folder-name-error"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    if (
        name === ""
    ) {

        if (nameError) {
            nameError.textContent =
                "Escribe un nombre.";
        }

        if (nameInput) {
            nameInput.focus();
        }

        return;

    }


    chrome.bookmarks.create(
        {
            parentId:
                selectedBookmarkNode.id,

            title:
                name
        },
        function () {

            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    "Error al crear carpeta:",
                    chrome.runtime.lastError.message
                );

                if (nameError) {
                    nameError.textContent =
                        "No se pudo crear la carpeta.";
                }

                return;

            }


            closeBookmarkOverlay(
                document.getElementById(
                    "new-bookmark-folder-overlay"
                )
            );


            selectedBookmarkNode =
                null;

            selectedBookmarkType =
                null;


            loadBookmarks();

        }
    );

}


// =========================================
// ELIMINAR CARPETA
// =========================================

function openDeleteBookmarkFolderModal(
    folder
) {

    if (!folder) {
        return;
    }


    selectedBookmarkNode =
        folder;

    selectedBookmarkType =
        "folder";


    const overlay =
        document.getElementById(
            "delete-bookmark-folder-overlay"
        );

    const message =
        document.getElementById(
            "delete-bookmark-folder-message"
        );


    if (!overlay) {
        return;
    }


    if (message) {

        const title =
            folder.title ||
            "esta carpeta";


        message.textContent =
            '¿Estás seguro de que deseas eliminar "' +
            title +
            '"? También se eliminarán los marcadores y subcarpetas que contiene.';

    }


    openBookmarkOverlay(
        overlay
    );

}


// =========================================
// CONFIRMAR ELIMINACIÓN DE CARPETA
// =========================================

function confirmDeleteBookmarkFolder() {

    if (!selectedBookmarkNode) {
        return;
    }


    const folderId =
        selectedBookmarkNode.id;


    chrome.bookmarks.removeTree(
        folderId,
        function () {

            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    "Error al eliminar carpeta:",
                    chrome.runtime.lastError.message
                );

                return;

            }


            closeBookmarkOverlay(
                document.getElementById(
                    "delete-bookmark-folder-overlay"
                )
            );


            selectedBookmarkNode =
                null;

            selectedBookmarkType =
                null;


            loadBookmarks();

        }
    );

}


// =========================================
// CONFIGURAR EVENTOS DE MODALES
// =========================================

function setupBookmarkModalEvents() {

    const closeEditButton =
        document.getElementById(
            "close-edit-bookmark-button"
        );

    const cancelEditButton =
        document.getElementById(
            "cancel-edit-bookmark-button"
        );

    const saveEditButton =
        document.getElementById(
            "save-edit-bookmark-button"
        );


    if (closeEditButton) {

        closeEditButton.addEventListener(
            "click",
            function () {

                closeBookmarkOverlay(
                    document.getElementById(
                        "edit-bookmark-overlay"
                    )
                );

            }
        );

    }


    if (cancelEditButton) {

        cancelEditButton.addEventListener(
            "click",
            function () {

                closeBookmarkOverlay(
                    document.getElementById(
                        "edit-bookmark-overlay"
                    )
                );

            }
        );

    }


    if (saveEditButton) {

        saveEditButton.addEventListener(
            "click",
            saveEditedBookmark
        );

    }


    const closeDeleteButton =
        document.getElementById(
            "close-delete-bookmark-button"
        );

    const cancelDeleteButton =
        document.getElementById(
            "cancel-delete-bookmark-button"
        );

    const confirmDeleteButton =
        document.getElementById(
            "confirm-delete-bookmark-button"
        );


    if (closeDeleteButton) {

        closeDeleteButton.addEventListener(
            "click",
            function () {

                closeBookmarkOverlay(
                    document.getElementById(
                        "delete-bookmark-overlay"
                    )
                );

            }
        );

    }


    if (cancelDeleteButton) {

        cancelDeleteButton.addEventListener(
            "click",
            function () {

                closeBookmarkOverlay(
                    document.getElementById(
                        "delete-bookmark-overlay"
                    )
                );

            }
        );

    }


    if (confirmDeleteButton) {

        confirmDeleteButton.addEventListener(
            "click",
            confirmDeleteBookmark
        );

    }


    const closeRenameButton =
        document.getElementById(
            "close-rename-bookmark-folder-button"
        );

    const cancelRenameButton =
        document.getElementById(
            "cancel-rename-bookmark-folder-button"
        );

    const saveRenameButton =
        document.getElementById(
            "save-rename-bookmark-folder-button"
        );


    if (closeRenameButton) {

        closeRenameButton.addEventListener(
            "click",
            function () {

                closeBookmarkOverlay(
                    document.getElementById(
                        "rename-bookmark-folder-overlay"
                    )
                );

            }
        );

    }


    if (cancelRenameButton) {

        cancelRenameButton.addEventListener(
            "click",
            function () {

                closeBookmarkOverlay(
                    document.getElementById(
                        "rename-bookmark-folder-overlay"
                    )
                );

            }
        );

    }


    if (saveRenameButton) {

        saveRenameButton.addEventListener(
            "click",
            saveRenamedBookmarkFolder
        );

    }


    const closeNewFolderButton =
        document.getElementById(
            "close-new-bookmark-folder-button"
        );

    const cancelNewFolderButton =
        document.getElementById(
            "cancel-new-bookmark-folder-button"
        );

    const saveNewFolderButton =
        document.getElementById(
            "save-new-bookmark-folder-button"
        );


    if (closeNewFolderButton) {

        closeNewFolderButton.addEventListener(
            "click",
            function () {

                closeBookmarkOverlay(
                    document.getElementById(
                        "new-bookmark-folder-overlay"
                    )
                );

            }
        );

    }


    if (cancelNewFolderButton) {

        cancelNewFolderButton.addEventListener(
            "click",
            function () {

                closeBookmarkOverlay(
                    document.getElementById(
                        "new-bookmark-folder-overlay"
                    )
                );

            }
        );

    }


    if (saveNewFolderButton) {

        saveNewFolderButton.addEventListener(
            "click",
            saveNewBookmarkFolder
        );

    }


    const closeDeleteFolderButton =
        document.getElementById(
            "close-delete-bookmark-folder-button"
        );

    const cancelDeleteFolderButton =
        document.getElementById(
            "cancel-delete-bookmark-folder-button"
        );

    const confirmDeleteFolderButton =
        document.getElementById(
            "confirm-delete-bookmark-folder-button"
        );


    if (closeDeleteFolderButton) {

        closeDeleteFolderButton.addEventListener(
            "click",
            function () {

                closeBookmarkOverlay(
                    document.getElementById(
                        "delete-bookmark-folder-overlay"
                    )
                );

            }
        );

    }


    if (cancelDeleteFolderButton) {

        cancelDeleteFolderButton.addEventListener(
            "click",
            function () {

                closeBookmarkOverlay(
                    document.getElementById(
                        "delete-bookmark-folder-overlay"
                    )
                );

            }
        );

    }


    if (confirmDeleteFolderButton) {

        confirmDeleteFolderButton.addEventListener(
            "click",
            confirmDeleteBookmarkFolder
        );

    }


    // =====================================
    // CLICK EN FONDO
    // =====================================

    const overlayIds = [

        "edit-bookmark-overlay",

        "delete-bookmark-overlay",

        "rename-bookmark-folder-overlay",

        "new-bookmark-folder-overlay",

        "delete-bookmark-folder-overlay"

    ];


    overlayIds.forEach(
        function (overlayId) {

            const overlay =
                document.getElementById(
                    overlayId
                );


            if (!overlay) {
                return;
            }


            overlay.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        overlay
                    ) {

                        closeBookmarkOverlay(
                            overlay
                        );

                    }

                }
            );

        }
    );


    // =====================================
    // ESC
    // =====================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !== "Escape"
            ) {

                return;

            }


            closeAllBookmarkModals();

            closeBookmarkContextMenu();

        }
    );


    // =====================================
    // ENTER - EDITAR
    // =====================================

    const editNameInput =
        document.getElementById(
            "edit-bookmark-name"
        );

    const editUrlInput =
        document.getElementById(
            "edit-bookmark-url"
        );


    if (editNameInput) {

        editNameInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    saveEditedBookmark();

                }

            }
        );

    }


    if (editUrlInput) {

        editUrlInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    saveEditedBookmark();

                }

            }
        );

    }


    // =====================================
    // ENTER - RENOMBRAR
    // =====================================

    const renameInput =
        document.getElementById(
            "rename-bookmark-folder-name"
        );


    if (renameInput) {

        renameInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    saveRenamedBookmarkFolder();

                }

            }
        );

    }


    // =====================================
    // ENTER - NUEVA CARPETA
    // =====================================

    const newFolderInput =
        document.getElementById(
            "new-bookmark-folder-name"
        );


    if (newFolderInput) {

        newFolderInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    saveNewBookmarkFolder();

                }

            }
        );

    }

}


// =========================================
// CLICK FUERA
// =========================================
//
// IMPORTANTE:
//
// Ahora el menú NO se cierra simplemente porque
// hicimos click dentro de él.
//
// Solo se cierra si hacemos click fuera.
//

document.addEventListener(
    "click",
    function (event) {

        if (
            draggedBookmarkId ||
            wasBookmarkDragRecentlyEnded()
        ) {

            return;

        }


        const clickedInsideBookmarkMenu =
            event.target.closest &&
            event.target.closest(
                ".bookmark-menu"
            );


        const clickedBookmarkFolder =
            event.target.closest &&
            event.target.closest(
                ".bookmark-folder-button, .bookmark-subfolder-button"
            );


        const clickedContextMenu =
            event.target.closest &&
            event.target.closest(
                ".bookmark-context-menu"
            );


        if (
            clickedInsideBookmarkMenu ||
            clickedBookmarkFolder ||
            clickedContextMenu
        ) {

            return;

        }


        closeBookmarkMenus();

        closeBookmarkContextMenu();

    }
);


// =========================================
// CLIC DERECHO EN LA BARRA
// =========================================

document.addEventListener(
    "contextmenu",
    function (event) {

        const bookmarkElement =
            event.target.closest(
                ".bookmark-item, " +
                ".bookmark-folder-button, " +
                ".bookmark-menu-item, " +
                ".bookmark-subfolder-button, " +
                ".bookmark-context-menu"
            );


        if (
            bookmarkElement
        ) {

            return;

        }


        const bookmarksBar =
            document.getElementById(
                "bookmarks-bar"
            );


        if (
            !bookmarksBar
        ) {

            return;

        }


        if (
            !bookmarksBar.contains(
                event.target
            )
        ) {

            return;

        }


        event.preventDefault();

        event.stopPropagation();


        if (
            !bookmarksBarNode
        ) {

            console.warn(
                "No se encontró el nodo de la Barra de marcadores."
            );

            return;

        }


        openBookmarkContextMenu(
            event,
            bookmarksBarNode,
            "bar"
        );

    }
);


// =========================================
// ACTUALIZAR MARCADORES
// =========================================

chrome.bookmarks.onCreated.addListener(
    function () {

        loadBookmarks();

    }
);


chrome.bookmarks.onRemoved.addListener(
    function () {

        loadBookmarks();

    }
);


chrome.bookmarks.onChanged.addListener(
    function () {

        loadBookmarks();

    }
);


// =========================================
// MOVIMIENTO DE MARCADORES
// =========================================
//
// Durante un movimiento iniciado desde nuestra
// interfaz NO reconstruimos todo el DOM.
//
// Esto es importante porque si hacemos loadBookmarks()
// aquí, la ventana de la carpeta abierta desaparece.
//
// En los movimientos internos normales simplemente
// esperamos.
//
// Cuando una CARPETA cambia de padre, la función
// moveBookmarkNodeToIndex() o
// moveBookmarkNodeIntoFolder() hará el loadBookmarks()
// explícitamente.
//

chrome.bookmarks.onMoved.addListener(
    function () {

        if (
            bookmarkInternalMoveInProgress
        ) {

            return;

        }


        loadBookmarks();

    }
);


chrome.bookmarks.onChildrenReordered.addListener(
    function () {

        if (
            bookmarkInternalMoveInProgress
        ) {

            return;

        }


        loadBookmarks();

    }
);


// =========================================
// DESPLAZAMIENTO DE MARCADORES
// =========================================

function updateBookmarkScrollButtons() {

    const bookmarksBar =
        document.getElementById(
            "bookmarks-bar"
        );

    const leftButton =
        document.getElementById(
            "bookmarks-scroll-left"
        );

    const rightButton =
        document.getElementById(
            "bookmarks-scroll-right"
        );


    if (
        !bookmarksBar ||
        !leftButton ||
        !rightButton
    ) {

        return;

    }


    const maxScroll =
        bookmarksBar.scrollWidth -
        bookmarksBar.clientWidth;


    if (
        maxScroll <= 1
    ) {

        leftButton.classList.add(
            "hidden"
        );

        rightButton.classList.add(
            "hidden"
        );

        leftButton.disabled =
            true;

        rightButton.disabled =
            true;

        return;

    }


    leftButton.classList.remove(
        "hidden"
    );

    rightButton.classList.remove(
        "hidden"
    );


    if (
        bookmarksBar.scrollLeft <= 1
    ) {

        leftButton.disabled =
            true;

    } else {

        leftButton.disabled =
            false;

    }


    if (
        bookmarksBar.scrollLeft >=
        maxScroll - 1
    ) {

        rightButton.disabled =
            true;

    } else {

        rightButton.disabled =
            false;

    }

}


// =========================================
// CONFIGURAR DESPLAZAMIENTO
// =========================================

function setupBookmarkScroll() {

    const bookmarksBar =
        document.getElementById(
            "bookmarks-bar"
        );

    const leftButton =
        document.getElementById(
            "bookmarks-scroll-left"
        );

    const rightButton =
        document.getElementById(
            "bookmarks-scroll-right"
        );


    if (
        !bookmarksBar ||
        !leftButton ||
        !rightButton
    ) {

        return;

    }


    leftButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            bookmarksBar.scrollBy(
                {
                    left:
                        -250,

                    behavior:
                        "smooth"
                }
            );

        }
    );


    rightButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            bookmarksBar.scrollBy(
                {
                    left:
                        250,

                    behavior:
                        "smooth"
                }
            );

        }
    );


    bookmarksBar.addEventListener(
        "scroll",
        function () {

            updateBookmarkScrollButtons();

        }
    );


    window.addEventListener(
        "resize",
        function () {

            updateBookmarkScrollButtons();

        }
    );


    updateBookmarkScrollButtons();

}


// =========================================
// ZONA GENERAL DE ARRASTRE
// =========================================

function setupBookmarkDragArea() {

    // =====================================
    // DRAGOVER
    // =====================================

    document.addEventListener(
        "dragover",
        function (event) {

            if (
                !draggedBookmarkId
            ) {

                return;

            }


            event.preventDefault();


            event.dataTransfer.dropEffect =
                "move";


            const element =
                document.elementFromPoint(
                    event.clientX,
                    event.clientY
                );


            if (!element) {
                return;
            }


            // =================================
            // CARPETA
            // =================================

            const folderButton =
                element.closest(
                    ".bookmark-folder-button, .bookmark-subfolder-button"
                );


            if (
                folderButton
            ) {

                const folderElement =
                    folderButton.closest(
                        ".bookmark-folder, .bookmark-subfolder"
                    );


                const folderId =
                    folderElement
                        ? folderElement.dataset.bookmarkId
                        : null;


                // =================================
                // NO MOVER UNA CARPETA DENTRO
                // DE SÍ MISMA
                // =================================

                if (
                    !folderId ||
                    folderId === draggedBookmarkId
                ) {

                    clearBookmarkDragHighlights();

                    return;

                }


                // =================================
                // NO MOVER UNA CARPETA DENTRO
                // DE UNO DE SUS DESCENDIENTES
                // =================================

                if (
                    draggedBookmarkType ===
                    "folder" &&
                    draggedBookmarkElement &&
                    draggedBookmarkElement.contains(
                        folderElement
                    )
                ) {

                    clearBookmarkDragHighlights();

                    return;

                }


                const isSubfolder =
                    folderButton.classList.contains(
                        "bookmark-subfolder-button"
                    );


                const axis =
                    isSubfolder
                        ? "vertical"
                        : "horizontal";


                if (
                    isMouseOverFolderCenter(
                        folderButton,
                        event,
                        axis
                    )
                ) {

                    // =================================
                    // METER DENTRO
                    // =================================

                    clearBookmarkDragHighlights();


                    folderButton.classList.add(
                        "bookmark-drop-inside"
                    );


                    bookmarkFileIntoFolderId =
                        folderId;

                } else {

                    // =================================
                    // REORDENAR JUNTO A LA CARPETA
                    // =================================

                    clearBookmarkDragHighlights();


                    if (
                        draggedBookmarkElement
                    ) {

                        if (
                            axis ===
                            "horizontal"
                        ) {

                            moveBookmarkBarElementAccordingToMouse(
                                draggedBookmarkElement,
                                folderElement,
                                event
                            );

                        } else {

                            moveBookmarkMenuElementAccordingToMouse(
                                draggedBookmarkElement,
                                folderElement,
                                event
                            );

                        }

                    }

                }

                return;

            }


            // =================================
            // MARCADOR
            // =================================

            const bookmarkTarget =
                element.closest(
                    ".bookmark-item, .bookmark-menu-item"
                );


            if (
                bookmarkTarget
            ) {

                if (
                    bookmarkTarget.dataset.bookmarkId ===
                    draggedBookmarkId
                ) {

                    return;

                }


                clearBookmarkDragHighlights();


                if (
                    !draggedBookmarkElement
                ) {

                    return;

                }


                const isInMenu =
                    !!bookmarkTarget.closest(
                        ".bookmark-menu"
                    );


                if (
                    isInMenu
                ) {

                    moveBookmarkMenuElementAccordingToMouse(
                        draggedBookmarkElement,
                        bookmarkTarget,
                        event
                    );

                } else {

                    moveBookmarkBarElementAccordingToMouse(
                        draggedBookmarkElement,
                        bookmarkTarget,
                        event
                    );

                }


                return;

            }


            // =================================
            // ESPACIO VACÍO
            // =================================

            clearBookmarkDragHighlights();


            if (
                !draggedBookmarkElement
            ) {

                return;

            }


            const emptyBar =
                element.closest(
                    "#bookmarks-bar"
                );


            if (
                emptyBar
            ) {

                moveBookmarkElementToEnd(
                    draggedBookmarkElement,
                    emptyBar
                );

                return;

            }


            const emptyMenu =
                element.closest(
                    ".bookmark-menu"
                );


            if (
                emptyMenu &&
                emptyMenu.style.display ===
                "block"
            ) {

                moveBookmarkElementToEnd(
                    draggedBookmarkElement,
                    emptyMenu
                );

            }

        }
    );


    // =====================================
    // DROP
    // =====================================

    document.addEventListener(
        "drop",
        function (event) {

            if (
                !draggedBookmarkId
            ) {

                return;

            }


            event.preventDefault();


            event.stopPropagation();


            // =================================
            // GUARDAR DATOS DEL DRAG
            // =================================
            //
            // Los guardamos antes de limpiar
            // las variables al terminar.
            //

            const movedId =
                draggedBookmarkId;

            const movedType =
                draggedBookmarkType;

            const originalParentId =
                draggedBookmarkOriginalParentId;

            const originalIndex =
                draggedBookmarkOriginalIndex;

            const movedElement =
                draggedBookmarkElement;

            const targetFolderId =
                bookmarkFileIntoFolderId;


            // =================================
            // CASO 1:
            // METER DENTRO DE CARPETA
            // =================================

            if (
                targetFolderId
            ) {

                // =================================
                // BUSCAR MENÚ DESTINO
                // =================================

                const targetMenus =
                    document.querySelectorAll(
                        ".bookmark-menu"
                    );


                let targetMenu =
                    null;


                targetMenus.forEach(
                    function (menu) {

                        if (
                            menu.dataset.parentId ===
                            String(
                                targetFolderId
                            )
                        ) {

                            targetMenu =
                                menu;

                        }

                    }
                );


                // =================================
                // MOVER VISUALMENTE
                // =================================

                if (
                    targetMenu &&
                    movedElement
                ) {

                    targetMenu.appendChild(
                        movedElement
                    );

                }


                // =================================
                // MOVER REALMENTE EN CHROME
                // =================================

                moveBookmarkNodeIntoFolder(
                    movedId,
                    targetFolderId,
                    movedType
                );


                clearBookmarkDragHighlights();


                return;

            }


            // =================================
            // CASO 2:
            // REORDENAR
            // =================================

            if (
                !movedElement
            ) {

                clearBookmarkDragHighlights();

                return;

            }


            const parent =
                movedElement.parentNode;


            if (
                !parent
            ) {

                clearBookmarkDragHighlights();

                return;

            }


            let parentId =
                null;


            if (
                parent.id ===
                "bookmarks-bar"
            ) {

                parentId =
                    bookmarksBarNode
                        ? bookmarksBarNode.id
                        : null;

            } else if (
                parent.classList.contains(
                    "bookmark-menu"
                )
            ) {

                parentId =
                    parent.dataset.parentId;

            }


            if (
                !parentId
            ) {

                clearBookmarkDragHighlights();

                return;

            }


            // =================================
            // ÍNDICE FINAL VISUAL
            // =================================

            const index =
                Array.from(
                    parent.children
                ).indexOf(
                    movedElement
                );


            if (
                index === -1
            ) {

                clearBookmarkDragHighlights();

                return;

            }


            // =================================
            // ENVIAR A CHROME
            // =================================

            moveBookmarkNodeToIndex(
                movedId,
                parentId,
                index,
                originalParentId,
                originalIndex,
                movedType
            );


            clearBookmarkDragHighlights();

        }
    );

}


// =========================================
// INICIALIZAR MARCADORES
// =========================================

closeAllBookmarkModals();

setupBookmarkModalEvents();

setupBookmarkScroll();

setupBookmarkDragArea();

loadBookmarks();