// ==========================================
// VARIABLE GLOBAL
// ==========================================
let totalGlobal = 0;

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosDesdeLocalStorage();
});

// ==========================================
// 1. CARGA DE DATOS DESDE LOCALSTORAGE
// ==========================================
function cargarDatosDesdeLocalStorage() {

    const datosGuardados = localStorage.getItem('resumenCompra');

    if (!datosGuardados) {
        alert("Tu sesión expiró.");
        window.location.href = 'tipodecompra.html';
        return;
    }

    const resumen = JSON.parse(datosGuardados);

    const subtotal = Number(resumen.subtotal || 0);
    const envio = Number(resumen.envio || 0);
    totalGlobal = Number(resumen.total || 0);
    const tipo = resumen.tipoEntrega || 'No especificado';

    if (totalGlobal <= 0) {
        alert("Monto inválido.");
        window.location.href = 'tipodecompra.html';
        return;
    }

    document.getElementById('pagoSubtotal').innerText = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById('pagoEnvio').innerText = `S/ ${envio.toFixed(2)}`;
    document.getElementById('pagoTipoEntrega').innerText = tipo.toUpperCase();
    document.getElementById('totalMostrado').innerText = `S/ ${totalGlobal.toFixed(2)}`;
}

// ==========================================
// 2. MODAL
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
// 3. VISTAS DINÁMICAS
// ==========================================
function abrirVista(metodo) {

    const totalTxt = totalGlobal.toFixed(2);
    let html = '<div class="pago-metodo-container">';

    switch (metodo) {

        case 'yape':
            tituloModal.textContent = 'Pagar con Yape';
            html += `
                <p>Escanea el QR o realiza el Yape.</p>

                <div class="qr-container">
                    <img src="./img/yape.png" alt="QR Yape" class="qr-image">
                </div>

                <div class="info-pago-destacada">
                    <p><strong>Número:</strong> 999 888 777</p>
                    <p><strong>Titular:</strong> Juan Pérez S.A.C.</p>
                </div>

                <div class="monto-destacado">
                    S/ ${totalTxt}
                </div>

                <div class="form-group">
                    <label>Código de operación</label>
                    <input type="text" id="codOperacion" maxlength="8" placeholder="Ej: 12345678">
                </div>

                <button class="btn-accion btn-confirmar" 
                        onclick="procesarPago('yape')">
                    Confirmar Yapeo
                </button>
            `;
            break;

        case 'plin':
            tituloModal.textContent = 'Pagar con Plin';
            html += `
                <p>Escanea el QR o realiza la transferencia.</p>

                <div class="qr-container">
                    <img src="./img/plin.png" alt="QR Plin" class="qr-image">
                </div>

                <div class="info-pago-destacada">
                    <p><strong>Número:</strong> 999 888 777</p>
                    <p><strong>Titular:</strong> Juan Pérez S.A.C.</p>
                </div>

                <div class="monto-destacado">
                    S/ ${totalTxt}
                </div>

                <div class="form-group">
                    <label>Código de operación</label>
                    <input type="text" id="codOperacion" maxlength="8" placeholder="Ej: 12345678">
                </div>

                <button class="btn-accion btn-confirmar" 
                        onclick="procesarPago('plin')">
                    Confirmar Plin
                </button>
            `;
            break;

        case 'tarjeta':
            tituloModal.textContent = 'Pago con Tarjeta';
            html += `
                <div class="monto-destacado">
                    Total: S/ ${totalTxt}
                </div>

                <button class="btn-accion btn-confirmar"
                        onclick="procesarPago('tarjeta')">
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

                <button class="btn-accion btn-confirmar"
                        onclick="procesarPago('efectivo')">
                    Confirmar Reserva
                </button>
            `;
            break;
    }

    html += '</div>';
    contenidoModal.innerHTML = html;
    abrirModal();
}

// ==========================================
// 4. PROCESAR PAGO
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

    const pedido_id = localStorage.getItem('pedido_id');

    if (!pedido_id) {
        alert("No se encontró el pedido.");
        return;
    }

    try {

        const btn = document.querySelector('.btn-confirmar');
        if (btn) {
            btn.disabled = true;
            btn.innerText = "Procesando...";
        }

        const response = await fetch('/api/tipopago', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pedido_id: Number(pedido_id),
                metodo_pago: metodo,
                monto: totalGlobal,
                codigo_aprobacion: codigo,
                estado: 'PENDIENTE_VERIFICACION'
            })
        });

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error("Respuesta inválida del servidor");
        }

        if (!response.ok) {
            throw new Error(data.error || "Error al registrar pago");
        }

        cerrarModal();

        document.getElementById('procesandoPedido')?.classList.add('active');

        setTimeout(() => {
            window.location.href = 'procesodelpedido.html';
        }, 2000);

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