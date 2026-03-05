// =========================
// ELEMENTOS DEL DOM
// =========================
const nombreUsuario = document.getElementById('nombreUsuario');
const btnDelivery = document.getElementById('btnDelivery');
const btnRecoger = document.getElementById('btnRecoger');
const modalDelivery = document.getElementById('modalDelivery');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const formDatosEntrega = document.getElementById('formDatosEntrega');
const btnVolver = document.getElementById('btnVolver');
const btnFinalizarTodo = document.getElementById('btnFinalizarTodo');

const resSubtotal = document.getElementById('resSubtotal');
const resEnvio = document.getElementById('resEnvio');
const resTotal = document.getElementById('resTotal');

let tipoSeleccionado = null;
let datosConfirmados = false;
let datosEntregaTemp = {};

// =========================
// VALIDAR USUARIO
// =========================
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!usuario || !usuario.id) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

// Mostrar nombre
if (usuario && usuario.nombre) {
    nombreUsuario.textContent = usuario.nombre;
} else {
    nombreUsuario.textContent = 'Cliente';
}

// =========================
// VOLVER ATRÁS
// =========================
btnVolver.addEventListener('click', () => {
    window.history.back();
});

// =========================
// CARGAR RESUMEN
// =========================
function cargarResumenCarrito() {

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let subtotal = 0;

    carrito.forEach(p => {
        subtotal += p.precio * p.cantidad;
    });

    let envio = 0;

    if (tipoSeleccionado === 'delivery') {
        envio = subtotal > 0 ? 10 : 0;
    }

    resSubtotal.innerText = `S/ ${subtotal.toFixed(2)}`;
    resEnvio.innerText = `S/ ${envio.toFixed(2)}`;
    resTotal.innerText = `S/ ${(subtotal + envio).toFixed(2)}`;
}

// =========================
// ELEGIR DELIVERY
// =========================
btnDelivery.addEventListener('click', () => {

    if (datosConfirmados && tipoSeleccionado !== 'delivery') {
        alert("Ya confirmaste otra opción.");
        return;
    }

    tipoSeleccionado = 'delivery';
    modalDelivery.style.display = 'flex';
    cargarResumenCarrito();
});

// =========================
// ELEGIR RECOGER EN TIENDA
// =========================
btnRecoger.addEventListener('click', () => {

    if (datosConfirmados && tipoSeleccionado !== 'tienda') {
        alert("Ya confirmaste otra opción.");
        return;
    }

    tipoSeleccionado = 'tienda';
    datosConfirmados = true;

    datosEntregaTemp = {}; // no necesita datos

    alert("Has seleccionado recoger en tienda.");
    cargarResumenCarrito();
});

// =========================
// CERRAR MODAL
// =========================
btnCerrarModal.addEventListener('click', () => {
    modalDelivery.style.display = 'none';
});

// =========================
// FORM DELIVERY
// =========================
formDatosEntrega.addEventListener('submit', (e) => {

    e.preventDefault();

    const ubicacion = document.getElementById('ubicacion').value.trim();
    const referencia = document.getElementById('referencia').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const nota = document.getElementById('nota').value.trim();

    if (!ubicacion || !telefono) {
        alert("Completa ubicación y teléfono.");
        return;
    }

    const regexTel = /^[0-9]{9,15}$/;

    if (!regexTel.test(telefono)) {
        alert("Número inválido.");
        return;
    }

    // BUSCA ESTA PARTE EN TU JS Y ASEGÚRATE QUE ESTÉ ASÍ:
datosEntregaTemp = {
    ubicacion: ubicacion,    // Debe decir 'ubicacion'
    referencia: referencia,  // Debe decir 'referencia'
    telefono: telefono,      // Debe decir 'telefono'
    nota: nota               // Debe decir 'nota'
};
    datosConfirmados = true;
    tipoSeleccionado = 'delivery';

    modalDelivery.style.display = 'none';
    alert("Dirección confirmada.");
    cargarResumenCarrito();
});

// ==========================================
// FINALIZAR (SOLO GUARDA DATOS Y VA A PAGO)
// ==========================================
btnFinalizarTodo.addEventListener('click', () => {

    if (!tipoSeleccionado) {
        alert("Debes seleccionar tipo de entrega.");
        return;
    }

    if (tipoSeleccionado === 'delivery' && !datosConfirmados) {
        alert("Confirma la dirección.");
        return;
    }

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) {
        alert("Carrito vacío.");
        return;
    }

    const subtotal = parseFloat(resSubtotal.innerText.replace('S/ ', '')) || 0;
    const envio = parseFloat(resEnvio.innerText.replace('S/ ', '')) || 0;
    const total = parseFloat(resTotal.innerText.replace('S/ ', '')) || 0;

    // 🔥 Guardamos todo para enviarlo desde tipodepago.js
    localStorage.setItem('pedido_temp', JSON.stringify({
        usuarioId: usuario.id,
        productos: carrito,
        tipoEntrega: tipoSeleccionado,
        datosEntrega: datosEntregaTemp,
        subtotal,
        envio,
        total
    }));

    window.location.href = 'tipodepago.html';
});

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', () => {
    cargarResumenCarrito();
});