// =========================================
// CARGAR FONDO INMEDIATAMENTE
// =========================================

(function () {

    try {

        const backgroundType =
            localStorage.getItem(
                "newtabBackgroundType"
            );

        const backgroundImage =
            localStorage.getItem(
                "newtabBackgroundImage"
            );

        if (
            backgroundType === "image" &&
            backgroundImage
        ) {

            document.documentElement.classList.add(
                "initial-background-image"
            );

            document.documentElement.style.setProperty(
                "--initial-background-image",
                `url("${backgroundImage}")`
            );

        }

    } catch (error) {

        console.error(
            "No se pudo cargar el fondo inicial:",
            error
        );

    }

})();