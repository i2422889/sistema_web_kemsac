const productos = [
  { nombre: "Filtro de Aceite", tipo: "repuesto", precio: 25, img: "img/logo1.png" },
  { nombre: "Batería 12V 60Ah", tipo: "repuesto", precio: 280, img: "img/logo2.png" },
  { nombre: "Kit de Embrague", tipo: "producto", precio: 450, img: "img/logo3.png" }
];

const contenedor = document.getElementById("productos");

function mostrar(lista) {
  contenedor.innerHTML = "";
  lista.forEach(p => {
    contenedor.innerHTML += `
      <div class="card">
        <img src="${p.img}">
        <div class="info">
          <small>${p.tipo.toUpperCase()}</small>
          <h3>${p.nombre}</h3>
          <p>S/ ${p.precio}</p>
          <button>Agregar</button>
        </div>
      </div>
    `;
  });
}

function filtrar(tipo) {
  document.querySelectorAll(".buttons button").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");

  if (tipo === "todos") mostrar(productos);
  else mostrar(productos.filter(p => p.tipo === tipo));
}

mostrar(productos);

// codigo para el boton productos reconosque //
// Este código solo debe estar en index.js
document.addEventListener('DOMContentLoaded', () => {
    const btnProductos = document.getElementById('btnProductos');

    if (btnProductos) {
        btnProductos.addEventListener('click', () => {
            // Redirige a la ruta de Node.js que sirve productos.html
            window.location.href = '/productos';
        });
    }
});



document.addEventListener('DOMContentLoaded', () => {

  const main = document.getElementById('contenido-principal');

  // Función que carga un HTML dentro del main
  function cargarVista(html, js) {
    fetch(html)
      .then(res => res.text())
      .then(data => {
        main.innerHTML = data;

        // Si el hijo tiene JS, lo ejecutamos
        if (js) {
          const script = document.createElement('script');
          script.src = js;
          main.appendChild(script);
        }
      })
      .catch(err => console.error('Error al cargar vista:', err));
  }

  // Eventos de los botones
  document.getElementById('btnProductos')
    .addEventListener('click', () => cargarVista('productos.html', 'js/productos.js'));

  document.getElementById('btnRepuestos')
    .addEventListener('click', () => cargarVista('repuestos.html', 'js/repuestos.js'));

  document.getElementById('btnServicios')
    .addEventListener('click', () => cargarVista('servicios.html', 'js/servicios.js'));

  document.getElementById('btnPerfil')
    .addEventListener('click', () => cargarVista('perfil.html', 'js/perfil.js'));

});