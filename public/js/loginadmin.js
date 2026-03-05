document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Capturamos los datos basándonos en tus campos de la tabla: usuario y password
    const usuario = document.getElementById('userInput').value.trim();
    const password = document.getElementById('passInput').value;
    const btn = document.getElementById('btnLogin');

    // Validación básica antes de enviar al servidor
    if (!usuario || !password) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    btn.innerText = "Verificando Credenciales...";
    btn.disabled = true;

    try {
        const response = await fetch('http://localhost:3000/api/loginadmin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Enviamos 'usuario' para que coincida con la columna UNIQUE de tu tabla
            body: JSON.stringify({ usuario, password })
        });

        const data = await response.json();

        if (data.success) {
            // Guardamos el token de sesión (JWT)
            localStorage.setItem('kemsac_token', data.token);
            
            // Guardamos el 'nombre' del admin (columna nombre VARCHAR(100))
            localStorage.setItem('admin_user', data.nombre);
            
            // Redirección al panel principal
            window.location.href = 'adminpanelgeneral.html';
        } else {
            // Si el usuario no existe o la contraseña no coincide con el hash
            alert(data.message || "Acceso denegado");
            btn.innerText = "Iniciar Sesión";
            btn.disabled = false;
        }
    } catch (error) {
        console.error("Error en el login:", error);
        alert("Hubo un problema al conectar con el servidor KEMSAC.");
        btn.innerText = "Iniciar Sesión";
        btn.disabled = false;
    }
});