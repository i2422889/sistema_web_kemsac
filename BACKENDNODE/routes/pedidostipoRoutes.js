const express = require('express');
const router = express.Router();
const db = require('../db');

// ==========================================
// CREAR PEDIDO COMPLETO
// ==========================================
router.post('/', async (req, res) => {

    const {
        usuarioId,
        productos,
        tipoEntrega,
        metodoPago,      // 🔥 agregado
        datosEntrega,
        subtotal,
        envio,
        total
    } = req.body;

    // =========================
    // VALIDACIONES BÁSICAS
    // =========================
    if (!usuarioId || !productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Datos incompletos"
        });
    }

    if (!tipoEntrega || (tipoEntrega !== 'delivery' && tipoEntrega !== 'tienda')) {
        return res.status(400).json({
            success: false,
            message: "Tipo de entrega inválido"
        });
    }

    if (!metodoPago || !['YAPE','PLIN','TARJETA','EFECTIVO'].includes(metodoPago)) {
        return res.status(400).json({
            success: false,
            message: "Método de pago inválido"
        });
    }

    if (total <= 0 || subtotal < 0 || envio < 0) {
        return res.status(400).json({
            success: false,
            message: "Montos inválidos"
        });
    }

    for (const p of productos) {
        if (!p.id || !p.cantidad || !p.precio) {
            return res.status(400).json({
                success: false,
                message: "Producto inválido"
            });
        }
    }

    let connection;

    try {

        connection = await db.getConnection();
        await connection.beginTransaction();

        // =========================
        // 1️⃣ INSERTAR PEDIDO
        // =========================
        const [pedidoResult] = await connection.query(`
            INSERT INTO pedidos 
            (usuario_id, tipo_entrega, metodo_pago, subtotal, costo_envio, total, estado)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE')
        `, [
            usuarioId,
            tipoEntrega,
            metodoPago,
            subtotal,
            envio,
            total
        ]);

        const pedidoId = pedidoResult.insertId;

        // =========================
        // 2️⃣ INSERTAR DETALLE PRODUCTOS
        // =========================
        for (const p of productos) {
            await connection.query(`
                INSERT INTO pedido_detalle 
                (pedido_id, producto_id, cantidad, precio_unitario)
                VALUES (?, ?, ?, ?)
            `, [
                pedidoId,
                p.id,
                p.cantidad,
                p.precio
            ]);
        }

        // =========================
        // 3️⃣ INSERTAR DATOS ENTREGA (SI DELIVERY)
        // =========================
        if (tipoEntrega === 'delivery' && datosEntrega) {

            await connection.query(`
                INSERT INTO pedido_entrega
                (pedido_id, ubicacion, referencia, telefono, nota)
                VALUES (?, ?, ?, ?, ?)
            `, [
                pedidoId,
                datosEntrega.ubicacion || null,
                datosEntrega.referencia || null,
                datosEntrega.telefono || null,
                datosEntrega.nota || null
            ]);
        }

        await connection.commit();

        return res.json({
            success: true,
            pedido_id: pedidoId
        });

    } catch (error) {

        console.error("Error al crear pedido:", error);

        if (connection) {
            await connection.rollback();
        }

        return res.status(500).json({
            success: false,
            message: "Error al crear pedido"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;