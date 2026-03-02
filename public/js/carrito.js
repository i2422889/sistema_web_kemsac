// =========================
// VARIABLES GLOBALES
// =========================
const listaCarrito = document.getElementById('listaCarrito');
const subtotalEl = document.getElementById('subtotal');
const envioEl = document.getElementById('envio');
const totalEl = document.getElementById('total');

// =========================
// CARGAR CARRITO DESDE LOCALSTORAGE
// =========================
function cargarCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    listaCarrito.innerHTML = '';

    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<p>Tu carrito está vacío</p>';
        subtotalEl.innerText = 'S/ 0.00';
        envioEl.innerText = 'S/ 0.00';
        totalEl.innerText = 'S/ 0.00';
        return;
    }

    let subtotal = 0;

    carrito.forEach(p => {
        subtotal += p.precio * p.cantidad;

        const productoHTML = `
        <div class="carrito-item">
            <img src="${p.imagen_url}" alt="${p.nombre}">
            <div class="item-info">
                <h4>${p.nombre}</h4>
                <p>Precio: S/ ${p.precio}</p>

                <!-- Botones de cantidad -->
                <div class="cantidad-control">
                    <button onclick="modificarCantidad(${p.id}, -1)">-</button>
                    <span>${p.cantidad}</span>
                    <button onclick="modificarCantidad(${p.id}, 1)">+</button>
                </div>

                <button class="btn-eliminar" onclick="eliminarProducto(${p.id})">Eliminar</button>
            </div>
        </div>
        `;
        listaCarrito.insertAdjacentHTML('beforeend', productoHTML);
    });

    const envio = subtotal > 0 ? 10 : 0; // Ejemplo: envío fijo
    subtotalEl.innerText = `S/ ${subtotal.toFixed(2)}`;
    envioEl.innerText = `S/ ${envio.toFixed(2)}`;
    totalEl.innerText = `S/ ${(subtotal + envio).toFixed(2)}`;
}

// =========================
// MODIFICAR CANTIDAD DE UN PRODUCTO
// =========================
function modificarCantidad(id, cambio) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(p => p.id === id);

    if (index > -1) {
        carrito[index].cantidad += cambio;

        // Evitar que la cantidad sea menor a 1
        if (carrito[index].cantidad < 1) carrito[index].cantidad = 1;

        localStorage.setItem('carrito', JSON.stringify(carrito));
        cargarCarrito(); // recargar vista
    }
}

// =========================
// ELIMINAR PRODUCTO
// =========================
function eliminarProducto(id) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(p => p.id !== id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarCarrito();
}

// =========================
// VACIAR TODO EL CARRITO
// =========================
function vaciarCarrito() {
    localStorage.removeItem('carrito');
    cargarCarrito();
}

// =========================
// CERRAR CARRITO
// =========================
function cerrarCarrito() {
    document.querySelector('.carrito-overlay').style.display = 'none';
}
// =========================
// CERRAR CARRITO HACIENDO CLICK FUERA
// =========================
document.querySelector('.carrito-overlay').addEventListener('click', function(e) {
    const contenedor = document.querySelector('.carrito-container');
    // Solo si el click fue directamente en el overlay, no en el contenedor o hijos
    if (e.target === this) {
        cerrarCarrito();
    }
});
// =========================
// INICIALIZAR AL CARGAR PÁGINA
// =========================
document.addEventListener('DOMContentLoaded', cargarCarrito);