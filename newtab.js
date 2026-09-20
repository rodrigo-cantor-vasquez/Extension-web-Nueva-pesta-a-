// =========================================
// ELEMENTOS DEL PANEL DE CONFIGURACIÓN
// =========================================

// Botón que abre el panel
const settingsButton = document.getElementById("settings-button");

// Panel de configuración
const settingsPanel = document.getElementById("settings-panel");

// Botón "X" para cerrar el panel
const closeSettingsButton = document.getElementById("close-settings-button");

// Capa transparente
const settingsOverlay = document.getElementById("settings-overlay");


// =========================================
// ABRIR PANEL
// =========================================

settingsButton.addEventListener("click", () => {

    settingsPanel.style.transform = "translateX(0)";

    settingsOverlay.style.opacity = "1";
    settingsOverlay.style.visibility = "visible";
    settingsOverlay.style.pointerEvents = "auto";

});


// =========================================
// CERRAR PANEL
// =========================================

closeSettingsButton.addEventListener("click", () => {

    settingsPanel.style.transform = "translateX(100%)";

    settingsOverlay.style.opacity = "0";
    settingsOverlay.style.visibility = "hidden";
    settingsOverlay.style.pointerEvents = "none";

});


// =========================================
// CERRAR AL HACER CLIC EN LA CAPA
// =========================================

settingsOverlay.addEventListener("click", () => {

    settingsPanel.style.transform = "translateX(100%)";

    settingsOverlay.style.opacity = "0";
    settingsOverlay.style.visibility = "hidden";
    settingsOverlay.style.pointerEvents = "none";

});