let map;
let marker;
const pedidoId = localStorage.getItem('ultimo_pedido_id');

document.addEventListener('DOMContentLoaded', () => {
    if (!pedidoId) {
        alert("No se encontró el pedido.");
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('idDisplay').innerText = `#${pedidoId}`;
    obtenerEstadoPedido();
});

async function obtenerEstadoPedido() {
    try {
        const res = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}`);
        const data = await res.json();
        
        console.log("Datos recibidos del servidor:", data);

        if (data.success && data.pedido) {
            actualizarUI(data.pedido);
        } else {
            document.getElementById('detallePedido').innerHTML = "<p>Error: No se pudo cargar la información del pedido.</p>";
        }
    } catch (err) {
        console.error("Error al obtener pedido:", err);
    }
}

function actualizarUI(pedido) {
    const info = document.getElementById('detallePedido');
    
    // Aseguramos que el total sea un número para evitar el error de .toFixed()
    const totalNum = Number(pedido.total) || 0;

    info.innerHTML = `
        <div style="line-height: 2;">
            <p><strong>Estado:</strong> ${pedido.estado || 'PENDIENTE'}</p>
            <p><strong>Entrega:</strong> ${pedido.tipo_entrega || 'delivery'}</p>
            <p><strong>Total:</strong> S/ ${totalNum.toFixed(2)}</p>
        </div>
    `;

    // Normalizamos el estado a mayúsculas para comparar
    const estado = (pedido.estado || 'PENDIENTE').toUpperCase();

    // IMPORTANTE: El nombre de la función debe ser el mismo que definimos abajo
    if (estado === 'PENDIENTE') activarSteps(1);
    else if (estado === 'PAGADO') activarSteps(2);
    else if (estado === 'EN_CAMINO') {
        activarSteps(3);
        const mapSection = document.getElementById('map-section');
        if(mapSection) mapSection.style.display = 'block';
    }
    else if (estado === 'ENTREGADO') activarSteps(4);
}

// Función con el nombre correcto "activarSteps" (en plural)
function activarSteps(hasta) {
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        if (step) {
            if (i <= hasta) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        }
    }
}

// Lógica de Google Maps (Mantener igual, pero revisa tu API Key en el HTML)
function initMap() {
    const posInicial = { lat: -12.046374, lng: -77.042793 };
    const mapElement = document.getElementById("map");
    
    if (mapElement) {
        map = new google.maps.Map(mapElement, {
            zoom: 16,
            center: posInicial,
            disableDefaultUI: true
        });

        marker = new google.maps.Marker({
            position: posInicial,
            map: map,
            title: "Tu pedido",
            icon: {
                url: "https://www.google.com/maps/place/Huancayo,+Junín,+Perú",
                scaledSize: new google.maps.Size(40, 40)
            }
        });
    }
}