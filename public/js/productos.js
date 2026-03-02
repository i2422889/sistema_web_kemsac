// =========================
// productos.js
// Controla:
// 1. Carga de productos desde la base de datos
// 2. Filtrado por categoría
// 3. Modal de detalles
// 4. Contador de carrito (global, temporal, sincronizable con carrito.html)
// =========================

// Contador global de productos agregados al carrito
let totalCarrito = 0;

// Variable global de productos (para filtrar y mostrar detalles)
let productos = [];

// =========================
// Función principal: carga productos desde la API
// =========================
document.addEventListener('DOMContentLoaded', () => {
    fetchProductos();
});

// Función que obtiene los productos desde tu backend
async function fetchProductos() {
    const container = document.getElementById('productosContainer');

    try {
        const response = await fetch('/api/productos/listar'); // Tu API
        productos = await response.json(); // Guardamos globalmente

        container.innerHTML = ''; // Limpiar loader

        if (productos.length === 0) {
            container.innerHTML = '<p class="status-msg">No hay productos disponibles.</p>';
            return;
        }

        // Generar tarjetas dinámicamente
        productos.forEach(p => {
    // Revisar si la imagen es URL externa
    let imgSrc = p.imagen_url;
    if (!imgSrc.startsWith('http')) {
        // Si no empieza con http, asumimos que es un archivo local
        imgSrc = `img/${imgSrc || 'default.png'}`;
    }

    const card = `
        <div class="product-card" data-categoria="${p.categoria}">
            <img src="${imgSrc}" alt="${p.nombre}">
            <div class="info">
                <small>${p.marca} | ${p.categoria}</small>
                <h3>${p.nombre}</h3>
                <span class="price">S/ ${p.precio}</span>

                <!-- Botones: agregar al carrito y detalles -->
                <div class="botones-card">
                    <button class="btn-add" onclick="agregarAlCarrito(${p.id})">
                        <i class="fa-solid fa-plus"></i> Agregar
                    </button>
                    <button class="btn-detalles" onclick="mostrarDetalles(${p.id})">
                        Detalles
                    </button>
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', card);
});

    } catch (error) {
        console.error("Error cargando productos:", error);
        container.innerHTML = '<p class="status-msg">❌ Error al conectar con el servidor.</p>';
    }
}

// =========================
// FUNCIONES DEL CARRITO
// =========================

// =========================
// VARIABLES GLOBALES

// =========================
// FUNCIONES DEL CARRITO
// =========================
function agregarAlCarrito(id) {
    totalCarrito++;

    // Actualizar sticker
    const sticker = document.getElementById('contadorCarrito');
    sticker.innerText = `🛒${totalCarrito}`;

    // Guardar producto en localStorage
    const producto = productos.find(p => p.id === id);
    if (producto) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        // Revisar si ya existe
        const index = carrito.findIndex(p => p.id === id);
        if (index > -1) {
            carrito[index].cantidad += 1; // sumar cantidad
        } else {
            producto.cantidad = 1;
            carrito.push(producto);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    // Animación rebote
    sticker.classList.remove('bounce');
    void sticker.offsetWidth;
    sticker.classList.add('bounce');
}

// =========================
// FILTRO DE PRODUCTOS
// =========================
function filtrar(categoria) {
    const container = document.getElementById('productosContainer');
    const tarjetas = container.querySelectorAll('.product-card');

    tarjetas.forEach(t => {
        if(categoria === 'todos' || t.dataset.categoria === categoria){
            t.style.display = 'block';
        } else {
            t.style.display = 'none';
        }
    });

    // Cambiar clase active en botones
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('active'));
    const btn = Array.from(document.querySelectorAll('.btn-filtro'))
                    .find(b => b.getAttribute('onclick') === `filtrar('${categoria}')`);
    if(btn) btn.classList.add('active');
}

// =========================
// MODAL DE DETALLES
// =========================

// Mostrar modal con detalles del producto
function mostrarDetalles(id) {
    const producto = productos.find(p => p.id === id);
    if(!producto) return;

    document.getElementById('modalNombre').innerText = producto.nombre;
    document.getElementById('modalDescripcion').innerText = producto.descripcion || "Sin descripción";
    document.getElementById('modalPrecio').innerText = `S/ ${producto.precio}`;

    document.getElementById('modalDetalles').style.display = 'block';
}

// Cerrar modal
function cerrarModal() {
    document.getElementById('modalDetalles').style.display = 'none';
}

// Cerrar modal al hacer click fuera del contenido
window.onclick = function(event) {
    const modal = document.getElementById('modalDetalles');
    if(event.target === modal){
        modal.style.display = 'none';
    }
}


