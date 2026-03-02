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

// Elementos de resumen del carrito
const resSubtotal = document.getElementById('resSubtotal');
const resEnvio = document.getElementById('resEnvio');
const resTotal = document.getElementById('resTotal');

let tipoSeleccionado = null; // Para bloquear cambio después de confirmar
let datosConfirmados = false; // Delivery confirmado

// =========================
// VOLVER ATRÁS
// =========================
btnVolver.addEventListener('click', () => {
    window.history.back();
});

// =========================
// MOSTRAR NOMBRE DE USUARIO
// =========================
const usuario = JSON.parse(localStorage.getItem('usuario'));
if(usuario && usuario.nombre){
    nombreUsuario.textContent = usuario.nombre;
} else {
    nombreUsuario.textContent = 'Cliente';
}

// =========================
// CARGAR CARRITO Y RESUMEN
// =========================
function cargarResumenCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let subtotal = 0;

    carrito.forEach(p => {
        subtotal += p.precio * p.cantidad;
    });

    // Determinar envío según tipo de entrega
    let envio = 0;
    if(tipoSeleccionado === 'delivery'){
        envio = subtotal > 0 ? 10 : 0; // Ejemplo: envío fijo
    } else if(tipoSeleccionado === 'recoger'){
        envio = 0;
    }

    resSubtotal.innerText = `S/ ${subtotal.toFixed(2)}`;
    resEnvio.innerText = `S/ ${envio.toFixed(2)}`;
    resTotal.innerText = `S/ ${(subtotal + envio).toFixed(2)}`;
}

// =========================
// ELEGIR TIPO DE PEDIDO
// =========================
btnDelivery.addEventListener('click', () => {
    if(datosConfirmados && tipoSeleccionado !== 'delivery'){
        alert("Ya confirmaste otra opción, no puedes cambiar a Delivery.");
        return;
    }
    tipoSeleccionado = 'delivery';
    modalDelivery.style.display = 'flex';
    cargarResumenCarrito();
});

btnRecoger.addEventListener('click', () => {
    if(datosConfirmados && tipoSeleccionado !== 'recoger'){
        alert("Ya confirmaste otra opción, no puedes cambiar a Recoger en tienda.");
        return;
    }
    tipoSeleccionado = 'recoger';
    
    // IMPORTANTE: Para que btnFinalizarTodo funcione con 'recoger'
    datosConfirmados = true; 

    // Guardamos inmediatamente tipo en DB (Tu lógica original)
    guardarTipoEntrega({tipo: 'recoger'});
    
    alert("Has seleccionado Recoger en tienda. Puedes continuar al pago.");
    cargarResumenCarrito();
});

// =========================
// CERRAR MODAL DELIVERY
// =========================
btnCerrarModal.addEventListener('click', () => {
    modalDelivery.style.display = 'none';
});

// =========================
// FORMULARIO DELIVERY
// =========================
formDatosEntrega.addEventListener('submit', async (e) => {
    e.preventDefault();

    const ubicacion = document.getElementById('ubicacion').value.trim();
    const referencia = document.getElementById('referencia').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const nota = document.getElementById('nota').value.trim();

    if(!ubicacion || !telefono){
        alert("Debes completar la ubicación y el teléfono.");
        return;
    }

    // Validación de teléfono
    const regexTel = /^[0-9]{9,15}$/;
    if(!regexTel.test(telefono)){
        alert("Ingrese un número de WhatsApp válido.");
        return;
    }

    // Guardar en DB (Tu lógica original)
    await guardarTipoEntrega({
        tipo: 'delivery',
        ubicacion,
        referencia,
        telefono,
        nota
    });

    alert("Dirección confirmada. No podrás cambiar de opción.");
    datosConfirmados = true;
    modalDelivery.style.display = 'none';
    cargarResumenCarrito();
});

// =========================
// FUNCION GUARDAR TIPO DE ENTREGA EN DB (MANTENIDA)
// =========================
async function guardarTipoEntrega(datos){
    try {
        const subtotal = parseFloat(resSubtotal.innerText.replace('S/ ', '')) || 0;
        const costo_envio = parseFloat(resEnvio.innerText.replace('S/ ', '')) || 0;

        const res = await fetch('http://localhost:3000/api/tipoentrega', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                usuarioId: usuario.id, 
                subtotal,
                costo_envio,
                ...datos  
            })
        });

        const data = await res.json();
        if(!data.success){
            alert("Error al guardar datos de entrega: " + data.message);
        } else {
            console.log("Datos de entrega guardados en DB:", data);
        }
    } catch(err){
        console.error("Error fetch tipo entrega:", err);
        alert("Error al guardar datos de entrega");
    }
}

// ==========================================
// FINALIZAR PEDIDO (GARANTIZA EL PASO A PAGOS)
// ==========================================
btnFinalizarTodo.addEventListener('click', () => {
    if(!tipoSeleccionado){
        alert("Debes seleccionar un tipo de pedido primero.");
        return;
    }
    if(tipoSeleccionado === 'delivery' && !datosConfirmados){
        alert("Debes confirmar la dirección de Delivery.");
        return;
    }

    // Extraemos montos finales para LocalStorage
    const subtotal = parseFloat(resSubtotal.innerText.replace('S/ ', '')) || 0;
    const envio = parseFloat(resEnvio.innerText.replace('S/ ', '')) || 0;
    const total = parseFloat(resTotal.innerText.replace('S/ ', '')) || 0;

    // GUARDAR EN LOCALSTORAGE PARA "TIPODEPAGO.JS"
    localStorage.setItem('resumenCompra', JSON.stringify({
        tipoEntrega: tipoSeleccionado,
        subtotal: subtotal,
        envio: envio,
        total: total
    }));

    // Redirigir a la siguiente página
    window.location.href = 'tipodepago.html';
});

// =========================
// INICIALIZAR AL CARGAR PÁGINA
// =========================
document.addEventListener('DOMContentLoaded', () => {
    cargarResumenCarrito();
});