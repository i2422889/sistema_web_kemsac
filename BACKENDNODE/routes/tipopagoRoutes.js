const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate que db.js esté bien configurado

// ==========================================
// CREAR PEDIDO COMPLETO
// ==========================================
router.post('/', async (req, res) => {

    const {
        usuarioId,
        productos,
        tipoEntrega,
        metodoPago,
        subtotal,
        costoEnvio,
        total,
        datosEntrega,
        codigoOperacion
    } = req.body;

    // ======================
    // VALIDACIONES
    // ======================
    if (!usuarioId || !productos || productos.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Datos incompletos"
        });
    }

    if (!tipoEntrega || !metodoPago || !total) {
        return res.status(400).json({
            success: false,
            message: "Datos inválidos"
        });
    }

    if (total <= 0) {
        return res.status(400).json({
            success: false,
            message: "Total inválido"
        });
    }

    // ======================
    // ESTADO INICIAL
    // ======================
    let estadoPedido = 'PENDIENTE';
    let estadoPago = 'PENDIENTE_VERIFICACION';

    if (metodoPago === 'tarjeta') {
        estadoPedido = 'PAGADO';
        estadoPago = 'APROBADO';
    }

    if (metodoPago === 'efectivo') {
        estadoPedido = 'PENDIENTE';
        estadoPago = 'RESERVADO';
    }

    try {

        // ======================
        // INSERTAR PEDIDO
        // ======================
        const sqlPedido = `
            INSERT INTO pedidos
            (usuario_id, tipo_entrega, metodo_pago, subtotal, costo_envio, total, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [resultPedido] = await db.query(sqlPedido, [
            usuarioId,
            tipoEntrega,
            metodoPago.toUpperCase(),
            subtotal,
            costoEnvio,
            total,
            estadoPedido
        ]);

        const pedidoId = resultPedido.insertId;
// ... (Debajo de donde insertas el Detalle con VALUES ?) ...

        // ======================
        // 3️⃣ INSERTAR DATOS ENTREGA (ESTO FALTABA)
        // ======================
        const tipoEntregaNormalizado = tipoEntrega ? tipoEntrega.toLowerCase() : '';

        if (tipoEntregaNormalizado === 'delivery' && datosEntrega) {
            const sqlEntrega = `
                INSERT INTO pedido_entrega
                (pedido_id, ubicacion, referencia, telefono, nota)
                VALUES (?, ?, ?, ?, ?)
            `;

            await db.query(sqlEntrega, [
                pedidoId,
                datosEntrega.ubicacion || null,
                datosEntrega.referencia || null,
                datosEntrega.telefono || null,
                datosEntrega.nota || null
            ]);
            console.log("✅ Datos de entrega guardados para ID:", pedidoId);
        }

        // ======================
        // 4️⃣ INSERTAR PAGO (Tu código sigue aquí...)
        // ======================
        const estadoFinalPago = (metodoPago.toLowerCase() === 'tarjeta') ? 'Aprobado' : 'Pendiente';
        // ... resto de tu código de pagos
        // ======================
        // INSERTAR DETALLE
        // ======================
        const sqlDetalle = `
            INSERT INTO pedido_detalle
            (pedido_id, producto_id, cantidad, precio_unitario)
            VALUES ?
        `;

        const valoresDetalle = productos.map(p => [
            pedidoId,
            p.id,
            p.cantidad,
            p.precio
        ]);

        await db.query(sqlDetalle, [valoresDetalle]);

        // ======================
// INSERTAR PAGO (Corregido)
// ======================

// Definimos el estado inicial. 
// Si es Yape/Plin/Efectivo, empieza en 'Pendiente' hasta que alguien lo valide.
const estadoPago = (metodoPago === 'Tarjeta') ? 'Aprobado' : 'Pendiente';

const sqlPago = `
    INSERT INTO pagos 
    (id_pedido, metodo_pago, monto_total, codigo_operacion, estado_pago) 
    VALUES (?, ?, ?, ?, ?)
`;

await db.query(sqlPago, [
    pedidoId,           // El ID que obtuviste al insertar el pedido
    metodoPago,         // 'Yape', 'Plin', 'Tarjeta' o 'Efectivo'
    total,              // 250.50
    codigoOperacion || null, // El número de 8 dígitos de las capturas
    estadoPago          // El estado que definimos arriba
]);

        // ======================
        // RESPUESTA FINAL
        // ======================
        res.status(201).json({
            success: true,
            message: "Pedido creado correctamente",
            pedido_id: pedidoId
        });

    } catch (error) {

        console.error("❌ Error creando pedido:", error);

        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});


// ==========================================
// LISTAR PEDIDOS
// ==========================================
router.get('/', async (req, res) => {

    try {

        const [rows] = await db.query(`
            SELECT * FROM pedidos
            ORDER BY fecha_creacion DESC
        `);

        res.json({
            success: true,
            pedidos: rows
        });

    } catch (error) {

        console.error("Error listando pedidos:", error);

        res.status(500).json({
            success: false,
            message: "Error obteniendo pedidos"
        });
    }
});


// ==========================================
// OBTENER PEDIDO POR ID
// ==========================================
router.get('/:id', async (req, res) => {

    const { id } = req.params;

    try {

        const [pedido] = await db.query(
            "SELECT * FROM pedidos WHERE id = ?",
            [id]
        );

        if (pedido.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pedido no encontrado"
            });
        }

        const [detalle] = await db.query(
            "SELECT * FROM pedido_detalle WHERE pedido_id = ?",
            [id]
        );

       const [pagos] = await db.query("SELECT * FROM pagos WHERE id_pedido = ?", [id]);

        res.json({
            success: true,
            pedido: pedido[0],
            detalle,
            pagos
        });

    } catch (error) {

        console.error("Error obteniendo pedido:", error);

        res.status(500).json({
            success: false,
            message: "Error interno"
        });
    }
});


module.exports = router;