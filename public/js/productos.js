document.addEventListener("DOMContentLoaded", () => {

    actualizarContador();

    const botonesCarrito = document.querySelectorAll(".btn-carrito");

    botonesCarrito.forEach(boton => {
        boton.addEventListener("click", (e) => {

            const card = e.target.closest(".card-producto");

            const producto = {
                nombre: card.querySelector("h3").textContent,
                precio: card.querySelector(".precio").textContent,
                imagen: card.querySelector("img").getAttribute("src"),
                cantidad: 1
            };

            agregarAlCarrito(producto);
        });
    });

});


function agregarAlCarrito(producto) {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    carrito.push(producto);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    actualizarContador();
}


function actualizarContador() {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const contador = document.getElementById("contadorCarrito");

    if (!contador) return;

    if (carrito.length === 0) {
        contador.style.display = "none";
    } else {
        contador.style.display = "flex";
        contador.textContent = carrito.length;
    }
}
