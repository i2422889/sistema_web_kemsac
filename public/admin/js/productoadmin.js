/* ==========================================
   VARIABLES GLOBALES
========================================== */

const form = document.getElementById("form-producto-admin");
const tablaBody = document.getElementById("tabla-productos-body");
const selectCategoria = document.getElementById("prod-categoria");

document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    cargarProductos();
});


/* ==========================================
   1. MODAL CATEGORÍA
========================================== */

function abrirModalCategoria() {
    document.getElementById("modal-cat").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modal-cat").style.display = "none";
    document.getElementById("nueva-cat-nombre").value = "";
}

async function agregarCategoria() {
    const input = document.getElementById("nueva-cat-nombre");
    const nombre = input.value.trim();

    if (!nombre) return alert("Escribe un nombre para la categoría.");

    try {
        const res = await fetch("/api/categorias", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "No se pudo crear");

        alert(data.message);
        cerrarModal();
        cargarCategorias();

    } catch (error) {
        console.error(error);
        alert("❌ " + error.message);
    }
}


/* ==========================================
   2. CARGAR CATEGORÍAS
========================================== */

async function cargarCategorias() {
    try {
        const res = await fetch("/api/categorias");
        if (!res.ok) throw new Error("Error cargando categorías");

        const categorias = await res.json();

        // Limpiar Select
        selectCategoria.innerHTML = '<option value="">Seleccionar categoría</option>';
        
        // Limpiar Lista del Modal (Asegúrate de tener este ID en tu HTML)
        const lista = document.getElementById("lista-categorias");
        if (lista) lista.innerHTML = "";

        categorias.forEach(cat => {
            // Llenar SELECT
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.nombre;
            selectCategoria.appendChild(option);

            // Llenar Lista Modal (con botón eliminar)
            if (lista) {
                const item = document.createElement("div");
                item.style = "display:flex; justify-content:space-between; margin:5px 0; align-items:center;";
                item.innerHTML = `
                    <span>${cat.nombre}</span>
                    <button onclick="eliminarCategoria(${cat.id})" style="background:red;color:white;border:none;padding:5px 10px;cursor:pointer;border-radius:4px;">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                lista.appendChild(item);
            }
        });

    } catch (error) {
        console.error(error);
    }
}


/* ==========================================
   3. LIMPIAR FORMULARIO
========================================== */

function limpiarFormulario() {
    form.reset();
    document.getElementById("prod-id").value = "";
    document.getElementById("form-title").innerHTML =
        '<i class="fas fa-plus-circle"></i> Agregar Nuevo Producto';
}


/* ==========================================
   4. CREAR / EDITAR PRODUCTO
========================================== */

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        let imgFinal = document.getElementById("prod-url-img").value;
        const file = document.getElementById("prod-file-img").files[0];

        if (file) {
            imgFinal = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }

        const id = document.getElementById("prod-id").value;

        const producto = {
            nombre: document.getElementById("prod-nombre").value.trim(),
            marca: document.getElementById("prod-marca").value.trim(),
            descripcion: document.getElementById("prod-descripcion").value.trim(),
            precio: parseFloat(document.getElementById("prod-precio").value),
            stock: parseInt(document.getElementById("prod-stock").value) || 0,
            stock_minimo: parseInt(document.getElementById("prod-stock-min").value) || 0,
            categoria_id: parseInt(selectCategoria.value),
            imagen_url: imgFinal,
            estado: document.getElementById("prod-estado").value
        };

        if (!producto.nombre || !producto.precio || !producto.categoria_id) {
            return alert("Nombre, precio y categoría son obligatorios.");
        }

        const metodo = id ? "PUT" : "POST";
        const url = id ? `/api/productos/${id}` : "/api/productos";

        const res = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto)
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al guardar");

        alert(data.message);
        limpiarFormulario();
        cargarProductos();

    } catch (error) {
        console.error(error);
        alert("❌ " + error.message);
    }
});


/* ==========================================
   5. CARGAR PRODUCTOS
========================================== */

async function cargarProductos() {
    try {
        const res = await fetch("/api/productos");
        if (!res.ok) throw new Error("Error cargando productos");

        const productos = await res.json();

        tablaBody.innerHTML = "";

        productos.forEach(prod => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${prod.id}</td>
                <td><img src="${prod.imagen_url || '/img/default.png'}" width="60"></td>
                <td><strong>${prod.nombre}</strong><br>${prod.marca || ""}</td>
                <td>${prod.categoria_nombre || "Sin categoría"}</td>
                <td>S/ ${prod.precio}</td>
                <td>${prod.stock}</td>
                <td>${prod.estado}</td>
                <td>
                    <button onclick="editarProducto(${prod.id})" class="btn-edit">✏</button>
                    <button onclick="eliminarProducto(${prod.id})" class="btn-delete">🗑</button>
                </td>
            `;
            tablaBody.appendChild(fila);
        });

    } catch (error) {
        console.error(error);
    }
}


/* ==========================================
   6. EDITAR PRODUCTO
========================================== */

async function editarProducto(id) {

    try {

        const res = await fetch(`/api/productos/${id}`);

        if (!res.ok) throw new Error("Producto no encontrado");

        const prod = await res.json();

        document.getElementById("prod-id").value = prod.id;
        document.getElementById("prod-nombre").value = prod.nombre;
        document.getElementById("prod-marca").value = prod.marca || "";
        document.getElementById("prod-descripcion").value = prod.descripcion || "";
        document.getElementById("prod-precio").value = prod.precio;
        document.getElementById("prod-stock").value = prod.stock;
        document.getElementById("prod-stock-min").value = prod.stock_minimo;

        selectCategoria.value = prod.categoria_id;

        document.getElementById("prod-estado").value = prod.estado;

        // 🔥 AQUÍ ESTÁ LO QUE FALTABA
        document.getElementById("prod-url-img").value = prod.imagen_url || "";

        // LIMPIAR INPUT FILE
        document.getElementById("prod-file-img").value = "";

        document.getElementById("form-title").innerHTML =
            '<i class="fas fa-edit"></i> Editando Producto';

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(error);
        alert("Error cargando producto.");

    }
}


/* ==========================================
   7. ELIMINAR PRODUCTO
========================================== */

async function eliminarProducto(id) {
    if (!confirm("¿Eliminar este producto definitivamente?")) return;

    try {
        const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "No se pudo eliminar");

        alert(data.message);
        cargarProductos();

    } catch (error) {
        console.error(error);
        alert("❌ " + error.message);
    }
}

/* ==========================================
   8. ELIMINAR CATEGORÍA (CORREGIDO)
========================================== */

async function eliminarCategoria(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return;

    try {
        const res = await fetch(`/api/categorias/${id}`, {
            method: 'DELETE'
        });

        const data = await res.json();

        if (!res.ok) {
            // Captura el error de "productos asociados" del backend
            throw new Error(data.error || data.message || "No se pudo eliminar");
        }

        alert("Categoría eliminada con éxito");
        cargarCategorias(); 

    } catch (error) {
        console.error("Error:", error);
        alert("❌ Error: " + error.message);
    }
}