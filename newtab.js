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


// Cerrar menús al hacer clic fuera
document.addEventListener("click", () => {

    document.querySelectorAll(".group-menu").forEach((menu) => {

        menu.style.display = "none";

    });

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
// CANCELAR EDICIÓN
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
// CERRAR VENTANA DE EDICIÓN
// =========================================

function closeEditGroup() {

    editGroupOverlay.style.opacity = "0";
    editGroupOverlay.style.visibility = "hidden";
    editGroupOverlay.style.pointerEvents = "none";

    groupBeingEdited = null;

}

