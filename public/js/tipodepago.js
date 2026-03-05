// ==========================================
// VARIABLES GLOBALES
// ==========================================
let totalGlobal = 0;
let pedidoTemp = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosPedidoTemp();
});

// ==========================================
// 1. CARGAR DATOS DESDE pedido_temp
// ==========================================
function cargarDatosPedidoTemp() {
    const datos = localStorage.getItem('pedido_temp');

    if (!datos) {
        alert("No hay datos de pedido.");
        window.location.href = 'checkout.html';
        return;
    }

    pedidoTemp = JSON.parse(datos);

    if (!pedidoTemp || !pedidoTemp.total || pedidoTemp.total <= 0) {
        alert("Pedido inválido.");
        window.location.href = 'checkout.html';
        return;
    }

    totalGlobal = Number(pedidoTemp.total);

    // Actualizar interfaz
    document.getElementById('pagoSubtotal').innerText = `S/ ${pedidoTemp.subtotal.toFixed(2)}`;
    document.getElementById('pagoEnvio').innerText = `S/ ${pedidoTemp.envio.toFixed(2)}`;
    document.getElementById('pagoTipoEntrega').innerText = pedidoTemp.tipoEntrega.toUpperCase();
    document.getElementById('totalMostrado').innerText = `S/ ${totalGlobal.toFixed(2)}`;
}

// ==========================================
// MODAL
// ==========================================
const modal = document.getElementById('modalPago');
const tituloModal = document.getElementById('tituloModal');
const contenidoModal = document.getElementById('contenidoModal');

function abrirModal() {
    modal?.classList.add('open');
}

function cerrarModal() {
    modal?.classList.remove('open');
}

window.onclick = function (event) {
    if (event.target === modal) cerrarModal();
};

// ==========================================
// VISTAS DE PAGO
// ==========================================
function abrirVista(metodo) {
    const totalTxt = totalGlobal.toFixed(2);
    let html = '<div class="pago-metodo-container">';

    switch (metodo) {
        case 'yape':
        case 'plin':
            const nombreMetodo = metodo === 'yape' ? 'Yape' : 'Plin';
            const colorMetodo = metodo === 'yape' ? '#742284' : '#00b4cc';
            
            const titular = "MACHA SANTA CRUZ KENEDY"; 
            const numeroCelular = "987 654 321";
            const rutaQR = `./img/${metodo}.png`;

            tituloModal.textContent = `Pagar con ${nombreMetodo}`;
            html += `
                <div style="text-align: center; margin-bottom: 15px;">
                    <p>Escanea el QR o yapea al número indicado.</p>
                    <img src="${rutaQR}" alt="QR ${nombreMetodo}" 
                         style="width: 180px; height: 180px; border-radius: 10px; border: 1px solid #ddd; margin: 10px 0;">
                    
                    <div style="background: #f4f4f4; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 0; font-weight: bold; color: ${colorMetodo};">${nombreMetodo.toUpperCase()}: ${numeroCelular}</p>
                        <p style="margin: 0; font-size: 0.9em; color: #555;">Titular: ${titular}</p>
                    </div>

                    <div class="monto-destacado" style="font-size: 1.5em; font-weight: bold; color: #333; margin-bottom: 15px;">
                        S/ ${totalTxt}
                    </div>
                </div>

                <div class="form-group">
                    <label>Código de operación</label>
                    <input type="text" id="codOperacion" maxlength="8" 
                           placeholder="Ej: 12345678" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                </div>

                <button class="btn-accion btn-confirmar" 
                        onclick="procesarPago('${metodo}')"
                        style="background-color: #00d1b2; color: white; width: 100%; padding: 12px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 10px;">
                    Confirmar ${nombreMetodo}
                </button>
            `;
            break;

        case 'tarjeta':
            tituloModal.textContent = 'Pago con Tarjeta';
            html += `
                <div class="monto-destacado">
                    Total: S/ ${totalTxt}
                </div>
                <button class="btn-accion btn-confirmar" onclick="procesarPago('tarjeta')">
                    💳 Pagar Ahora
                </button>
            `;
            break;

        case 'efectivo':
            tituloModal.textContent = 'Pago en Efectivo';
            html += `
                <div class="monto-destacado">
                    Total: S/ ${totalTxt}
                </div>
                <button class="btn-accion btn-confirmar" onclick="procesarPago('efectivo')">
                    Confirmar Pedido
                </button>
            `;
            break;
    }

    html += '</div>';
    contenidoModal.innerHTML = html;
    abrirModal();
}

// ==========================================
// CREAR PEDIDO + REGISTRAR PAGO
// ==========================================
async function procesarPago(metodo) {
    let codigo = null;

    if (metodo === 'yape' || metodo === 'plin') {
        const input = document.getElementById('codOperacion');
        codigo = input ? input.value.trim() : '';

        if (!codigo) {
            alert("Ingresa el código de operación");
            return;
        }

        if (!/^\d{6,8}$/.test(codigo)) {
            alert("El código debe tener 6 a 8 dígitos numéricos");
            return;
        }
    }

    try {
        const btn = document.querySelector('.btn-confirmar');
        if (btn) {
            btn.disabled = true;
            btn.innerText = "Procesando...";
        }

        // Enviamos los datos al servidor
        const response = await fetch('http://localhost:3000/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuarioId: pedidoTemp.usuarioId,
                productos: pedidoTemp.productos,
                tipoEntrega: pedidoTemp.tipoEntrega,
                metodoPago: metodo,
                subtotal: pedidoTemp.subtotal,
                costoEnvio: pedidoTemp.envio, // Aseguramos que el nombre coincida con el Backend
                total: pedidoTemp.total,
                datosEntrega: pedidoTemp.datosEntrega,
                codigoOperacion: codigo
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Error al crear pedido");
        }
// ===========================================================
        // 🚨 IMPORTANTE: Guardamos el ID del pedido que devolvió el Backend
        // para poder consultarlo en la página de "Estado del Pedido"
        // ===========================================================
        if (data.pedido_id) {
            localStorage.setItem('ultimo_pedido_id', data.pedido_id);
        }
        cerrarModal();

        // Limpiar almacenamiento local
        localStorage.removeItem('pedido_temp');
        localStorage.removeItem('carrito');

        setTimeout(() => {
            window.location.href = 'estadodelpedido.html';
        }, 1500);

    } catch (error) {
        alert("Error: " + error.message);
        console.error(error);

        const btn = document.querySelector('.btn-confirmar');
        if (btn) {
            btn.disabled = false;
            btn.innerText = "Reintentar";
        }
    }
}






// ==========================================
// FUNCIONES ADICIONALES
// ==========================================
function activarEfectivo(event) {
    event.stopPropagation();
    const card = document.getElementById("cardEfectivo");
    card.classList.toggle("activo");

    if(card.classList.contains("activo")){
        alert("Pago en efectivo activado. Deberás pagar al recoger en tienda.");
    }
}