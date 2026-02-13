
document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/login-admin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuario, password })
    });

    const data = await response.json();

    if (data.success) {
        window.location.href = "panel.html";
    } else {
        alert("Usuario o contraseña incorrectos");
    }
});


// //
const form = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validación básica solo para que no esté vacío
    if (usuario === "" || password === "") {
        mensaje.style.color = "#ff4b5c";
        mensaje.textContent = "Completa todos los campos";
        return;
    }

    mensaje.style.color = "#00ffae";
    mensaje.textContent = "Ingresando...";

    setTimeout(() => {
        window.location.href = "panel_ventas.html";
    }, 800);
});

