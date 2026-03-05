// =========================
// ELEMENTOS DEL DOM
// =========================
const btnRegistro = document.getElementById('btnRegistro');
const modalRegistro = document.getElementById('modalRegistro');
const cerrarModal = document.getElementById('cerrarModal');
const formRegistro = document.getElementById('formRegistro');
const formLogin = document.getElementById('formLogin');
const btnVolver = document.getElementById('btnVolver');

// =========================
// BOTÓN REGISTRARSE - ABRIR MODAL
// =========================
btnRegistro.addEventListener('click', () => {
    modalRegistro.style.display = 'flex';
});

// =========================
// CERRAR MODAL REGISTRO
// =========================
cerrarModal.addEventListener('click', () => {
    modalRegistro.style.display = 'none';
});

// Cerrar modal haciendo click fuera
window.addEventListener('click', (e) => {
    if(e.target === modalRegistro) {
        modalRegistro.style.display = 'none';
    }
});

// ===========================================
// MANEJADORES DE FORMULARIOS: REGISTRO Y LOGIN
// ===========================================

/// ---------------------------
// FORMULARIO DE REGISTRO
// ---------------------------
formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que el formulario se recargue automáticamente

    const nombre = formRegistro[0].value;
    const email = formRegistro[1].value;
    const pass = formRegistro[2].value;
    const passConfirm = formRegistro[3].value;

    if(pass !== passConfirm){
        alert("Las contraseñas no coinciden");
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/logincliente/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, pass })
        });

        const data = await res.json();
        console.log("Registro response:", data);
        alert(data.message);

        if(data.success){
            formRegistro.reset();
            modalRegistro.style.display = 'none';

            // 🔹 Redirigir a tipodecompra.html después del registro exitoso
            window.location.href = 'pedidostipo.html';
        }
    } catch(err){
        console.error("Error fetch registro:", err);
        alert("Error al registrar usuario");
    }
});

// ---------------------------
// FORMULARIO DE LOGIN
// ---------------------------
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = formLogin.querySelector('input[type="email"]').value;
    const pass = formLogin.querySelector('input[type="password"]').value;

    try {
        const res = await fetch('http://localhost:3000/api/logincliente/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, pass })
        });

        const data = await res.json();
        console.log("Login response:", data);
        alert(data.message);

       // Después del registro exitoso
if(data.success){
    formRegistro.reset();
    modalRegistro.style.display = 'none';

    // 🔹 Guardar el ID del cliente en localStorage
    localStorage.setItem('usuario', JSON.stringify({ id: data.user.id, nombre: data.user.nombre }));

    // 🔹 Redirigir a tipodecompra.html
    window.location.href = 'pedidostipo.html';
}
    } catch(err){
        console.error("Error fetch login:", err);
        alert("Error al iniciar sesión");
    }
});

// =========================
// BOTÓN GOOGLE (simulado)
// =========================
document.querySelector('.btn-google').addEventListener('click', function(){
    alert("Redirigir a login con Google");
});

// =========================
// BOTÓN VOLVER
// =========================
btnVolver.addEventListener('click', () => {
    window.history.back();
});