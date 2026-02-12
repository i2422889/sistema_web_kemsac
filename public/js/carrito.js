document.addEventListener("DOMContentLoaded", () => {
    mostrarCarrito();
});

// Cerrar si hacen click fuera
document.querySelector(".carrito-overlay").addEventListener("click", function(e) {
    if (e.target.classList.contains("carrito-overlay")) {
        cerrarCarrito();
    }
});

function mostrarCarrito() {
    const lista = document.getElementById("listaCarrito");
    const subtotalSpan = document.getElementById("subtotal");
    const envioSpan = document.getElementById("envio");
    const totalSpan = document.getElementById("total");

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    lista.innerHTML = "";

    let subtotal = 0;

    carrito.forEach((producto, index) => {
        // 🔥 Limpiar precio y convertir a número
        let precioStr = producto.precio || "0";
        // Elimina "S/" y espacios, luego parsea a float
        let precio = parseFloat(precioStr.replace("S/", "").trim()) || 0;
        let cantidad = parseInt(producto.cantidad) || 1;

        subtotal += precio * cantidad;

        lista.innerHTML += `
            <div class="item-carrito">

                <img src="${producto.imagen || 'img/logo1.png'}" 
                     class="img-carrito">

                <div class="item-info">
                    <h4>${producto.nombre}</h4>
                    <p>Precio: S/ ${precio.toFixed(2)}</p>
                    <p>Subtotal: S/ ${(precio * cantidad).toFixed(2)}</p>
                </div>

                <div class="item-cantidad">
                    <button onclick="disminuir(${index})">-</button>
                    <span>${cantidad}</span>
                    <button onclick="aumentar(${index})">+</button>
                </div>

                <button class="item-eliminar" onclick="eliminar(${index})">🗑</button>
            </div>
        `;
    });

    // Cálculo de envío
    let envio = subtotal > 100 ? 0 : (subtotal > 0 ? 10 : 0);
    let total = subtotal + envio;

    subtotalSpan.textContent = `S/ ${subtotal.toFixed(2)}`;
    envioSpan.textContent = `S/ ${envio.toFixed(2)}`;
    totalSpan.textContent = `S/ ${total.toFixed(2)}`;
}

function aumentar(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito[index].cantidad++;
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
}

function disminuir(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
    } else {
        carrito.splice(index, 1); // si llega a 0 lo elimina
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
}

function eliminar(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
}

function vaciarCarrito() {
    localStorage.removeItem("carrito");
    mostrarCarrito();
}

function cerrarCarrito() {
    document.querySelector(".carrito-overlay").style.display = "none";
}
