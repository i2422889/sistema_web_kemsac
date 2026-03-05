document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-container');
    const menuButtons = document.querySelectorAll('.nav-link');

    // 1. Limpiamos el contenedor y creamos el IFRAME una sola vez
    mainContainer.innerHTML = `
        <iframe id="admin-frame" 
                style="width: 100%; height: 100%; border: none; background: transparent;" 
                src="admin/dashboard_view.html">
        </iframe>`;
    
    const adminFrame = document.getElementById('admin-frame');

    /**
     * FUNCIÓN PARA CAMBIAR LA PÁGINA DEL IFRAME
     */
    const cargarVistaAdmin = (nombreArchivo) => {
        // Cambiamos la fuente del iframe
        adminFrame.src = `admin/${nombreArchivo}`;

        // Callback cuando el archivo termine de cargar
        adminFrame.onload = () => {
            console.log(`Vista ${nombreArchivo} cargada en el frame.`);
        };
    };

    // 2. Configurar los clics de los botones
    menuButtons.forEach(boton => {
        boton.addEventListener('click', () => {
            const pagina = boton.getAttribute('data-page');
            
            // Estética de botones
            menuButtons.forEach(b => b.classList.remove('active'));
            boton.classList.add('active');

            cargarVistaAdmin(pagina);
        });
    });

    /* =====================================
       FUNCIÓN CERRAR SESIÓN
    ===================================== */

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

});