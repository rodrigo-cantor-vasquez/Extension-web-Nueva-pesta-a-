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

    // Limpiamos cualquier icono anterior.
    siteIcon.innerHTML = "";

    // Fallback inicial.
    // Se mostrará mientras intentamos cargar
    // el favicon real.
    siteIcon.textContent = "🌐";

    let parsedUrl;

    try {

        parsedUrl =
            new URL(url);

    } catch {

        // Si la URL no es válida,
        // dejamos el planeta.
        return;
    }

    const hostname =
        parsedUrl.hostname;

    // -----------------------------------------
    // LISTA DE FUENTES DE ICONOS
    // -----------------------------------------

    const iconSources = [

        // 1. Favicon directamente desde el sitio.
        new URL(
            "/favicon.ico",
            url
        ).href,

        // 2. Servicio de favicon de Google.
        `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
            hostname
        )}&sz=64`,

        // 3. Servicio de favicon de DuckDuckGo.
        `https://icons.duckduckgo.com/ip3/${encodeURIComponent(
            hostname
        )}.ico`

    ];

    let currentSource = 0;

    // -----------------------------------------
    // INTENTAR CARGAR EL SIGUIENTE ICONO
    // -----------------------------------------

    function tryNextIcon() {

        // Si ya probamos todas las fuentes,
        // dejamos el planeta.
        if (
            currentSource >=
            iconSources.length
        ) {

            siteIcon.innerHTML = "";
            siteIcon.textContent = "🌐";

            return;
        }

        const siteIconImage =
            document.createElement("img");

        siteIconImage.alt = "";

        siteIconImage.addEventListener(
            "load",
            () => {

                // Si la imagen cargó correctamente,
                // reemplazamos el planeta por ella.
                siteIcon.innerHTML = "";

                siteIcon.appendChild(
                    siteIconImage
                );
            }
        );

        siteIconImage.addEventListener(
            "error",
            () => {

                // Esta fuente no funcionó.
                // Intentamos la siguiente.
                currentSource++;

                tryNextIcon();
            }
        );

        siteIconImage.src =
            iconSources[currentSource];
    }

    // Comenzamos con la primera fuente.
    tryNextIcon();
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

    // Este es el ancho que el usuario eligió.
    // No se modifica cuando la ventana cambia.
    let preferredWidth =
        Number(width);

    if (isNaN(preferredWidth)) {
        preferredWidth =
            defaultSettings.containerWidth;
    }

    // Ancho mínimo
    if (preferredWidth < 475) {
        preferredWidth = 475;
    }

    // Máximo disponible actualmente en la ventana.
    const maxWidth =
        Math.floor(
            window.innerWidth * 0.92
        );

    // El ancho visual se adapta a la ventana.
    const appliedWidth =
        Math.min(
            preferredWidth,
            maxWidth
        );

    document.documentElement.style.setProperty(
        "--container-width",
        `${appliedWidth}px`
    );

    // El input conserva el valor que eligió
    // el usuario.
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

        // Ancho mínimo
        if (preferredWidth < 475) {
            preferredWidth = 475;
        }

        // Máximo que permite actualmente
        // la ventana.
        const maxWidth =
            Math.floor(
                window.innerWidth * 0.92
            );

        // Si el usuario escribe un valor mayor
        // al espacio disponible, se limita.
        if (preferredWidth > maxWidth) {
            preferredWidth = maxWidth;
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

        // Aquí NO modificamos el valor elegido
        // por el usuario.
        //
        // Solamente recalculamos cuánto puede
        // mostrarse actualmente.
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
// CREAR MENÚ CONTEXTUAL
// =========================================

function createBookmarkContextMenu() {

    // Si ya existe, no crear otro.
    if (bookmarkContextMenu) {

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


    // =====================================
    // IMPORTANTE
    // =====================================
    // El menú contextual SIEMPRE pertenece
    // al BODY.
    //
    // De esta manera no queda limitado por:
    //
    // #bookmarks-wrapper
    // #bookmarks-bar
    //
    // ni por sus overflow.

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


    // Crear menú si todavía no existe.
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

        // =================================
        // EDITAR MARCADOR
        // =================================

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


        // =================================
        // ELIMINAR MARCADOR
        // =================================

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

        // =================================
        // RENOMBRAR
        // =================================

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


        // =================================
        // NUEVA CARPETA
        // =================================

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


        // =================================
        // ELIMINAR CARPETA
        // =================================

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

        // =================================
        // NUEVA CARPETA
        // =================================

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


    // =====================================
    // OBTENER TAMAÑO
    // =====================================

    const menuRect =
        bookmarkContextMenu.getBoundingClientRect();


    // =====================================
    // POSICIÓN INICIAL
    // =====================================

    let left =
        event.clientX;

    let top =
        event.clientY;


    // =====================================
    // EVITAR SALIR POR LA DERECHA
    // =====================================

    if (
        left + menuRect.width >
        window.innerWidth - 8
    ) {

        left =
            window.innerWidth -
            menuRect.width -
            8;

    }


    // =====================================
    // EVITAR SALIR POR ABAJO
    // =====================================

    if (
        top + menuRect.height >
        window.innerHeight - 8
    ) {

        top =
            window.innerHeight -
            menuRect.height -
            8;

    }


    // =====================================
    // APLICAR POSICIÓN
    // =====================================

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


            // =================================
            // GUARDAR NODO DE LA BARRA
            // =================================
            //
            // Este nodo será utilizado cuando
            // hagamos clic derecho en un espacio
            // vacío de la barra.
            //
            // Así podemos crear una carpeta
            // directamente dentro de la Barra
            // de marcadores.

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


    // =====================================
    // ACTUALIZAR DESPLAZAMIENTO
    // =====================================

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


    // =====================================
    // FAVICON
    // =====================================

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


    // =====================================
    // TÍTULO
    // =====================================

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


    // =====================================
    // BOTÓN
    // =====================================

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


    // =====================================
    // MENÚ DE LA CARPETA
    // =====================================

    const menu =
        document.createElement("div");

    menu.className =
        "bookmark-menu";

    menu.style.display =
        "none";


    renderBookmarkMenu(
        folder.children || [],
        menu
    );


    // =====================================
    // CLICK IZQUIERDO EN CARPETA
    // =====================================

    button.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            const wasOpen =
                menu.style.display === "block";


            // Cerrar otros menús.
            closeBookmarkMenus();

            // Cerrar menú contextual.
            closeBookmarkContextMenu();


            // Si ya estaba abierto,
            // simplemente dejarlo cerrado.
            if (wasOpen) {

                return;

            }


            // Mostrar menú.
            menu.style.display =
                "block";


            // =================================
            // USAR POSITION FIXED
            // =================================

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


            // =================================
            // EVITAR SALIR POR LA DERECHA
            // =================================

            if (
                left + menuRect.width >
                window.innerWidth - 8
            ) {

                left =
                    window.innerWidth -
                    menuRect.width -
                    8;

            }


            // =================================
            // EVITAR SALIR POR ABAJO
            // =================================

            if (
                top + menuRect.height >
                window.innerHeight - 8
            ) {

                top =
                    buttonRect.top -
                    menuRect.height -
                    4;

            }


            // =================================
            // EVITAR SALIR POR ARRIBA
            // =================================

            if (
                top < 8
            ) {

                top = 8;

            }


            // =================================
            // APLICAR POSICIÓN
            // =================================

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
    // CLICK DERECHO EN CARPETA
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


    // =====================================
    // FAVICON
    // =====================================

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


    // =====================================
    // TÍTULO
    // =====================================

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


    // =====================================
    // CLICK NORMAL
    // =====================================

    item.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            closeBookmarkMenus();

            closeBookmarkContextMenu();


            window.location.href =
                bookmark.url;

        }
    );


    // =====================================
    // CLICK DERECHO
    // =====================================

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


    // =====================================
    // BOTÓN
    // =====================================

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


    // =====================================
    // SUBMENÚ
    // =====================================

    const subMenu =
        document.createElement("div");

    subMenu.className =
        "bookmark-menu";

    subMenu.style.display =
        "none";


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


            // =================================
            // CERRAR OTROS SUBMENÚS
            // =================================

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


            // =================================
            // MOSTRAR SUBMENÚ
            // =================================

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


            // =================================
            // EVITAR SALIR POR LA DERECHA
            // =================================

            if (
                left + menuRect.width >
                window.innerWidth - 8
            ) {

                left =
                    rect.left -
                    menuRect.width -
                    4;

            }


            // =================================
            // EVITAR SALIR POR ABAJO
            // =================================

            if (
                top + menuRect.height >
                window.innerHeight - 8
            ) {

                top =
                    window.innerHeight -
                    menuRect.height -
                    8;

            }


            // =================================
            // EVITAR SALIR POR ARRIBA
            // =================================

            if (
                top < 8
            ) {

                top = 8;

            }


            // =================================
            // APLICAR POSICIÓN
            // =================================

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


// =========================================
// ABRIR MODAL
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


// =========================================
// CERRAR MODAL
// =========================================

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


// =========================================
// CERRAR TODOS LOS MODALES
// =========================================

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

        nameError.textContent =
            "";

    }


    if (urlError) {

        urlError.textContent =
            "";

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


    // =====================================
    // VALIDAR NOMBRE
    // =====================================

    if (name === "") {

        if (nameError) {

            nameError.textContent =
                "Escribe un nombre.";

        }

        if (nameInput) {

            nameInput.focus();

        }

        return;

    }


    // =====================================
    // VALIDAR URL VACÍA
    // =====================================

    if (url === "") {

        if (urlError) {

            urlError.textContent =
                "Escribe una URL.";

        }

        if (urlInput) {

            urlInput.focus();

        }

        return;

    }


    // =====================================
    // VALIDAR URL
    // =====================================

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


    // =====================================
    // HTTP / HTTPS
    // =====================================

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


    // =====================================
    // ACTUALIZAR MARCADOR
    // =====================================

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


    if (name === "") {

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


    // =====================================
    // VALIDAR NOMBRE
    // =====================================

    if (name === "") {

        if (nameError) {

            nameError.textContent =
                "Escribe un nombre.";

        }

        if (nameInput) {

            nameInput.focus();

        }

        return;

    }


    // =====================================
    // CREAR CARPETA
    // =====================================

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
// CONFIGURAR EVENTOS DE LOS MODALES
// =========================================

function setupBookmarkModalEvents() {


    // =====================================
    // EDITAR MARCADOR
    // =====================================

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


    // =====================================
    // ELIMINAR MARCADOR
    // =====================================

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


    // =====================================
    // RENOMBRAR CARPETA
    // =====================================

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


    // =====================================
    // NUEVA CARPETA
    // =====================================

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


    // =====================================
    // ELIMINAR CARPETA
    // =====================================

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
    // CERRAR AL HACER CLICK EN EL FONDO
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

document.addEventListener(
    "click",
    function () {

        closeBookmarkMenus();

        closeBookmarkContextMenu();

    }
);


// =========================================
// CLIC DERECHO EN LA BARRA DE MARCADORES
// =========================================

document.addEventListener(
    "contextmenu",
    function (event) {

        // =====================================
        // COMPROBAR SI EL CLICK FUE SOBRE
        // UN ELEMENTO DE MARCADORES
        // =====================================

        const bookmarkElement =
            event.target.closest(
                ".bookmark-item, " +
                ".bookmark-folder-button, " +
                ".bookmark-menu-item, " +
                ".bookmark-subfolder-button, " +
                ".bookmark-context-menu"
            );


        // =====================================
        // SI FUE SOBRE UN MARCADOR, CARPETA
        // O MENÚ CONTEXTUAL
        //
        // El evento ya será manejado por
        // su propio listener.
        // =====================================

        if (bookmarkElement) {

            return;

        }


        // =====================================
        // OBTENER BARRA
        // =====================================

        const bookmarksBar =
            document.getElementById(
                "bookmarks-bar"
            );


        if (
            !bookmarksBar
        ) {

            return;

        }


        // =====================================
        // COMPROBAR SI EL CLICK FUE DENTRO
        // DE LA BARRA
        // =====================================

        if (
            !bookmarksBar.contains(
                event.target
            )
        ) {

            return;

        }


        // =====================================
        // EVITAR MENÚ NATIVO
        // =====================================

        event.preventDefault();

        event.stopPropagation();


        // =====================================
        // ASEGURARNOS DE TENER EL NODO REAL
        // DE LA BARRA DE MARCADORES
        // =====================================

        if (
            !bookmarksBarNode
        ) {

            console.warn(
                "No se encontró el nodo de la Barra de marcadores."
            );

            return;

        }


        // =====================================
        // ABRIR MENÚ CONTEXTUAL DE LA BARRA
        // =====================================
        //
        // type = "bar"
        //
        // Esto hará que el menú muestre:
        //
        // 📁 Nueva carpeta
        //
        // y la carpeta será creada dentro
        // de la Barra de marcadores.

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


chrome.bookmarks.onMoved.addListener(
    function () {

        loadBookmarks();

    }
);


chrome.bookmarks.onChildrenReordered.addListener(
    function () {

        loadBookmarks();

    }
);


// =========================================
// DESPLAZAMIENTO DE MARCADORES
// =========================================


// =========================================
// ACTUALIZAR BOTONES
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


    // =====================================
    // NO HAY DESPLAZAMIENTO
    // =====================================

    if (maxScroll <= 1) {

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


    // =====================================
    // MOSTRAR BOTONES
    // =====================================

    leftButton.classList.remove(
        "hidden"
    );

    rightButton.classList.remove(
        "hidden"
    );


    // =====================================
    // BOTÓN IZQUIERDO
    // =====================================

    if (
        bookmarksBar.scrollLeft <= 1
    ) {

        leftButton.disabled =
            true;

    } else {

        leftButton.disabled =
            false;

    }


    // =====================================
    // BOTÓN DERECHO
    // =====================================

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


    // =====================================
    // BOTÓN IZQUIERDO
    // =====================================

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


    // =====================================
    // BOTÓN DERECHO
    // =====================================

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


    // =====================================
    // DETECTAR DESPLAZAMIENTO
    // =====================================

    bookmarksBar.addEventListener(
        "scroll",
        function () {

            updateBookmarkScrollButtons();

        }
    );


    // =====================================
    // DETECTAR CAMBIO DE TAMAÑO
    // =====================================

    window.addEventListener(
        "resize",
        function () {

            updateBookmarkScrollButtons();

        }
    );


    // =====================================
    // ESTADO INICIAL
    // =====================================

    updateBookmarkScrollButtons();

}


// =========================================
// INICIALIZAR MARCADORES
// =========================================


// Ocultar cualquier modal que pudiera
// aparecer al cargar la página.

closeAllBookmarkModals();


// Configurar botones de los modales.

setupBookmarkModalEvents();


// Configurar desplazamiento de marcadores.

setupBookmarkScroll();


// Cargar marcadores reales de Chrome.

loadBookmarks();