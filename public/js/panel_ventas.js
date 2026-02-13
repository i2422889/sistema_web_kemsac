const btnAgregar = document.getElementById("btnAgregar");
const modal = document.getElementById("modal");
const guardar = document.getElementById("guardar");
const cancelar = document.getElementById("cancelar");
const tabla = document.getElementById("tablaProductos");

let productos = [];
let editIndex = null;

btnAgregar.onclick = () => {
    modal.style.display = "flex";
    document.getElementById("modalTitulo").textContent = "Agregar Producto";
    limpiar();
    editIndex = null;
};

cancelar.onclick = () => {
    modal.style.display = "none";
};

guardar.onclick = () => {
    const nombre = document.getElementById("nombre").value;
    const precio = document.getElementById("precio").value;
    const stock = document.getElementById("stock").value;

    if (!nombre || !precio || !stock) return;

    if (editIndex === null) {
        productos.push({ nombre, precio, stock });
    } else {
        productos[editIndex] = { nombre, precio, stock };
    }

    modal.style.display = "none";
    render();
};

function render() {
    tabla.innerHTML = "";

    productos.forEach((prod, index) => {
        tabla.innerHTML += `
            <tr>
                <td>${prod.nombre}</td>
                <td>$${prod.precio}</td>
                <td>${prod.stock}</td>
                <td class="acciones">
                    <button class="editar" onclick="editar(${index})">Editar</button>
                    <button class="eliminar" onclick="eliminar(${index})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

function editar(index) {
    modal.style.display = "flex";
    document.getElementById("modalTitulo").textContent = "Editar Producto";

    document.getElementById("nombre").value = productos[index].nombre;
    document.getElementById("precio").value = productos[index].precio;
    document.getElementById("stock").value = productos[index].stock;

    editIndex = index;
}

function eliminar(index) {
    if (confirm("¿Eliminar producto?")) {
        productos.splice(index, 1);
        render();
    }
}

function limpiar() {
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stock").value = "";
}
