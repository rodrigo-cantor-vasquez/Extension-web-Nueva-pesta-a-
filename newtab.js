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
            groupElement.querySelectorAll(".site-card");

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
    const groups = getGroupsData();

    const data = await loadData();

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

function hexToRgba(hex, transparency) {
    const cleanHex = hex.replace("#", "");

    const r = parseInt(
        cleanHex.substring(0, 2),
        16
    );

    const g = parseInt(
        cleanHex.substring(2, 4),
        16
    );

    const b = parseInt(
        cleanHex.substring(4, 6),
        16
    );

    let validTransparency = Number(transparency);

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
    document.getElementById("settings-button");

const settingsPanel =
    document.getElementById("settings-panel");

const closeSettingsButton =
    document.getElementById("close-settings-button");

const settingsOverlay =
    document.getElementById("settings-overlay");

settingsButton.addEventListener(
    "click",
    () => {
        settingsPanel.style.transform =
            "translateX(0)";

        openOverlay(settingsOverlay);
    }
);

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
                getSiteName(site)?.textContent || "";

            const description =
                getSiteDescription(site)?.textContent || "";

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
        group.querySelector(".group-menu-button");

    const menu =
        group.querySelector(".group-menu");

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

    const main = document.querySelector("main");

    if (main) {
        const mainStyle =
            window.getComputedStyle(main);

        const mainCanScroll =
            (
                mainStyle.overflowY === "auto" ||
                mainStyle.overflowY === "scroll"
            ) &&
            main.scrollHeight > main.clientHeight;

        if (mainCanScroll) {
            return main;
        }
    }

    if (draggedGroup) {

        let element = draggedGroup;

        while (
            element &&
            element !== document.body &&
            element !== document.documentElement
        ) {
            const style =
                window.getComputedStyle(element);

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

            element = element.parentElement;
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
        container === document.documentElement ||
        container === document.body
    ) {
        window.scrollBy(0, amount);
    } else {
        container.scrollTop += amount;
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
        element.closest(".site-group");

    if (!targetGroup) {
        return;
    }

    if (targetGroup === draggedGroup) {
        return;
    }

    if (targetGroup === hoveredGroup) {
        return;
    }

    hoveredGroup = targetGroup;

    swapGroups(
        draggedGroup,
        targetGroup
    );

    document
        .querySelectorAll(".site-group")
        .forEach((otherGroup) => {
            otherGroup.classList.remove(
                "group-drag-over"
            );
        });

    targetGroup.classList.add(
        "group-drag-over"
    );
}


// =========================================
// ANIMACIÓN CONTINUA DEL AUTO-SCROLL
// =========================================

function runGroupDragAutoScroll() {

    if (!draggedGroup) {
        groupDragScrollAnimation = null;
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
    }

    else if (
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
        scrollGroupContainer(speed);

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

    groupDragScrollAnimation = null;
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
        document.createElement("div");

    const placeholderB =
        document.createElement("div");

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

    const group =
        element.closest(".site-group");

    return group;
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
        group.querySelector(".group-header");

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

            draggedGroup = group;
            hoveredGroup = null;

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

            draggedGroup = null;
            hoveredGroup = null;
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

            autoScrollWhileDragging(event);

            const targetGroup =
                getGroupUnderMouse(event);

            if (!targetGroup) {
                hoveredGroup = null;
                return;
            }

            if (
                targetGroup ===
                draggedGroup
            ) {

                hoveredGroup = null;

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

    const site =
        element.closest(".site-card");

    return site;
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

            draggedSite = site;
            hoveredSite = null;
            draggedSiteMoved = false;

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

            draggedSite = null;
            hoveredSite = null;

            setTimeout(
                () => {
                    draggedSiteMoved = false;
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

                draggedSiteMoved = true;
                hoveredSite = targetSite;

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

                draggedSiteMoved = true;

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

                draggedSiteMoved = true;

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
        site.querySelector(".site-menu-button");

    const menu =
        site.querySelector(".site-menu");

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

        option.value = groupName;
        option.textContent = groupName;

        addSiteGroup.appendChild(option);
    });
}


// =========================================
// ABRIR AGREGAR SITIO
// =========================================

function openAddSite() {

    resetAddSiteForm();

    openOverlay(addSiteOverlay);

    addSiteName.focus();
}


// =========================================
// CERRAR AGREGAR SITIO
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
// ICONO DEL SITIO
// =========================================

function setupSiteIcon(
    siteIcon,
    url
) {

    siteIcon.innerHTML = "";
    siteIcon.textContent = "🌐";

    const siteIconImage =
        document.createElement("img");

    siteIconImage.alt = "";

    siteIconImage.addEventListener(
        "load",
        () => {

            siteIcon.textContent = "";

            siteIcon.appendChild(
                siteIconImage
            );
        }
    );

    siteIconImage.addEventListener(
        "error",
        () => {
            siteIconImage.remove();
        }
    );

    siteIconImage.src =
        new URL(
            "/favicon.ico",
            url
        ).href;
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

    site.className = "site-card";
    site.dataset.url = url;

    const siteIcon =
        document.createElement("div");

    siteIcon.className = "site-icon";

    setupSiteIcon(
        siteIcon,
        url
    );

    const siteName =
        document.createElement("span");

    siteName.className = "site-name";
    siteName.textContent = name;

    const siteDescription =
        document.createElement("div");

    siteDescription.className =
        "site-description";

    siteDescription.textContent =
        description;

    const siteMenuButton =
        document.createElement("button");

    siteMenuButton.type = "button";
    siteMenuButton.className =
        "site-menu-button";

    siteMenuButton.textContent = "⋮";

    const siteMenu =
        document.createElement("div");

    siteMenu.className = "site-menu";

    const editSiteButton =
        document.createElement("button");

    editSiteButton.type = "button";
    editSiteButton.className =
        "edit-site-button";

    editSiteButton.innerHTML = `
        <span class="menu-icon">✏️</span>
        Editar sitio
    `;

    const deleteSiteButton =
        document.createElement("button");

    deleteSiteButton.type = "button";
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

    setupSiteCard(site);
    setupSiteDrag(site);

    editSiteButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();
            event.stopPropagation();

            openEditSite(site);

            closeMenu(siteMenu);
        }
    );

    deleteSiteButton.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();
            event.stopPropagation();

            site.remove();

            await saveCurrentData();

            filterSiteCards();

            closeMenu(siteMenu);
        }
    );

    return site;
}


// =========================================
// TARJETA AGREGAR SITIO
// =========================================

function setupAddSiteCard(addSiteCard) {

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

            groupBeingAddedTo = group;

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

        groupBeingAddedTo = null;

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
            newUrl = "https://" + newUrl;
        }

        try {

            const url = new URL(newUrl);

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
        document.createElement("section");

    group.className = "site-group";

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

    groupTitle.textContent = name;

    const groupMenuButton =
        document.createElement("button");

    groupMenuButton.type = "button";
    groupMenuButton.className =
        "group-menu-button";

    groupMenuButton.textContent = "⋮";

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

    groupMenu.className = "group-menu";

    const editGroupButton =
        document.createElement("button");

    editGroupButton.type = "button";
    editGroupButton.className =
        "edit-group-button";

    editGroupButton.innerHTML = `
        <span class="menu-icon">✏️</span>
        Editar grupo
    `;

    const deleteGroupButton =
        document.createElement("button");

    deleteGroupButton.type = "button";
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

    addSiteIcon.textContent = "+";

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

    setupGroupMenu(group);
    setupGroupDrag(group);
    setupAddSiteCard(addSiteCard);

    editGroupButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();
            event.stopPropagation();

            openEditGroup(group);

            closeMenu(groupMenu);
        }
    );

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

        main.appendChild(newGroup);

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

    siteBeingEdited = site;

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

    siteBeingEdited = null;

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
        .querySelectorAll(".edit-site-button")
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

                    openEditSite(site);

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
            getSiteName(siteBeingEdited);

        const siteDescription =
            getSiteDescription(siteBeingEdited);

        siteName.textContent = newName;

        siteBeingEdited.dataset.url =
            newUrl;

        siteDescription.textContent =
            newDescription;

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
    editGroupNameError.textContent = "";
}

function resetEditGroupForm() {
    editGroupName.value = "";
    clearEditGroupErrors();
}

function openEditGroup(group) {

    groupBeingEdited = group;

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

    groupBeingEdited = null;

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
        .querySelectorAll(".edit-group-button")
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

        (
            groupData.sites || []
        ).forEach((siteData) => {

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
        });

        main.appendChild(group);
    });
}


// =========================================
// TAMAÑO DEL CONTENEDOR
// =========================================

const containerWidthInput =
    document.getElementById(
        "container-width"
    );

function applyContainerWidth(width) {

    let validWidth =
        Number(width);

    if (isNaN(validWidth)) {
        validWidth =
            defaultSettings.containerWidth;
    }

    if (validWidth < 475) {
        validWidth = 475;
    }

    if (validWidth > 2000) {
        validWidth = 2000;
    }

    document.documentElement.style.setProperty(
        "--container-width",
        `${validWidth}px`
    );

    containerWidthInput.value =
        validWidth;
}

containerWidthInput.addEventListener(
    "change",
    async () => {

        applyContainerWidth(
            containerWidthInput.value
        );

        const data =
            await loadData();

        await saveData({
            settings: {
                ...defaultSettings,
                ...data.settings,
                containerWidth:
                    Number(
                        containerWidthInput.value
                    )
            }
        });
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
        .forEach((siteName) => {

            siteName.style.color =
                cardTextColor;
        });

    document
        .querySelectorAll(
            ".add-site-name"
        )
        .forEach((addSiteName) => {

            addSiteName.style.color =
                addSiteTextColor;
        });

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

function applyBackgroundColor(color) {

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

        applyBackgroundColor(color);

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

            reader.readAsDataURL(file);
        }
    );
}

function applyBackgroundImage(imageData) {

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

            image.src = imageData;
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

            pendingBackgroundImage = null;

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
                backgroundType: "image",
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
        document.createElement("div");

    wrapper.className =
        "gradient-color";

    const label =
        document.createElement("span");

    label.className =
        "gradient-color-label";

    label.textContent =
        `Color ${number}`;

    const input =
        document.createElement("input");

    input.type = "color";
    input.value = color;

    const removeButton =
        document.createElement("button");

    removeButton.type = "button";

    removeButton.className =
        "remove-gradient-color-button";

    removeButton.textContent = "×";

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

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(removeButton);

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

function loadGradientColors(colors) {

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

                    loadGradientColors(colors);

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

    closeOverlay(addSiteOverlay);
    closeOverlay(addGroupOverlay);
    closeOverlay(editSiteOverlay);
    closeOverlay(editGroupOverlay);
    closeOverlay(resetConfirmationOverlay);

    groupBeingAddedTo = null;
    siteBeingEdited = null;
    groupBeingEdited = null;
    pendingBackgroundImage = null;

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

    await saveData(resetData);

    const main =
        document.querySelector("main");

    main.innerHTML = "";

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

    backgroundImageInput.value = "";

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
                document.createElement("a");

            link.href = url;

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
                JSON.parse(text);

            if (
                !importedData ||
                typeof importedData !== "object" ||
                Array.isArray(importedData)
            ) {

                alert(
                    "El archivo no contiene datos válidos."
                );

                importDataFile.value = "";

                return;
            }

            if (
                !Array.isArray(
                    importedData.groups
                ) ||
                !importedData.settings ||
                typeof importedData.settings !== "object"
            ) {

                alert(
                    "El archivo no tiene el formato de una copia de seguridad de ReCodeVerse."
                );

                importDataFile.value = "";

                return;
            }

            const confirmed =
                confirm(
                    "Importar estos datos reemplazará la configuración y los sitios actuales. ¿Quieres continuar?"
                );

            if (!confirmed) {

                importDataFile.value = "";

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

            importDataFile.value = "";
        }
    }
);


// =========================================
// CONFIGURAR ELEMENTOS EXISTENTES
// =========================================

function setupExistingElements() {

    document
        .querySelectorAll(".site-group")
        .forEach((group) => {

            setupGroupMenu(group);
            setupGroupDrag(group);
        });

    document
        .querySelectorAll(".add-site-card")
        .forEach((card) => {

            setupAddSiteCard(card);
        });

    document
        .querySelectorAll(".site-card")
        .forEach((site) => {

            setupSiteCard(site);
            setupSiteDrag(site);
        });

    setupExistingSiteEditButtons();
    setupExistingGroupEditButtons();


    // =====================================
    // ELIMINAR GRUPOS
    // =====================================

    document
        .querySelectorAll(
            ".delete-group-button"
        )
        .forEach((button) => {

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
        });


    // =====================================
    // ELIMINAR SITIOS
    // =====================================

    document
        .querySelectorAll(
            ".delete-site-button"
        )
        .forEach((button) => {

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
        });
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
            groups: initialGroups,
            settings: initialSettings
        });

        data = {
            groups: initialGroups,
            settings: initialSettings
        };
    }

    console.log(
        "Datos cargados:",
        data
    );

    const main =
        document.querySelector("main");

    main.innerHTML = "";

    renderGroups(
        data.groups || []
    );

    setupExistingElements();

    setupGroupDragArea();

    setupSiteDragArea();


    const containerWidth =
        data.settings?.containerWidth ??
        defaultSettings.containerWidth;

    applyContainerWidth(
        containerWidth
    );


    const cardSize =
        data.settings?.cardSize ??
        defaultSettings.cardSize;

    applyCardSize(cardSize);


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
    // CARGAR COLORES DEL TEXTO
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


    const backgroundColor =
        data.settings?.backgroundColor ??
        defaultSettings.backgroundColor;

    backgroundColorInput.value =
        backgroundColor;


    const backgroundType =
        data.settings?.backgroundType ??
        "solid";


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
// INICIAR EXTENSIÓN
// =========================================

init();