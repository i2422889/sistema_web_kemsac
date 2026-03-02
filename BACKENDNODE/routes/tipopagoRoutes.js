const express = require('express');
const router = express.Router();
const db = require('../db'); // Usa tu conexión existente

// ==========================================
// REGISTRAR PAGO
// ==========================================
router.post('/', (req, res) => {

    const {
        pedido_id,
        metodo_pago,
        monto,
        codigo_aprobacion,
        estado
    } = req.body;

    // ======================
    // VALIDACIONES
    // ======================

    if (!pedido_id || !metodo_pago || !monto) {
        return res.status(400).json({
            error: "Datos incompletos"
        });
    }

    if ((metodo_pago === 'yape' || metodo_pago === 'plin') && !codigo_aprobacion) {
        return res.status(400).json({
            error: "Código de aprobación requerido"
        });const express = require('express');
const router = express.Router();
const db = require('../db'); // Usa tu conexión existente

// ==========================================
// REGISTRAR PAGO
// ==========================================
router.post('/', (req, res) => {

    const {
        pedido_id,
        metodo_pago,
        monto,
        codigo_aprobacion,
        estado
    } = req.body;

    // ======================
    // VALIDACIONES
    // ======================

    if (!pedido_id || !metodo_pago || !monto) {
        return res.status(400).json({
            error: "Datos incompletos"
        });
    }

    if ((metodo_pago === 'yape' || metodo_pago === 'plin') && !codigo_aprobacion) {
        return res.status(400).json({
            error: "Código de aprobación requerido"
        });
    }

    if (monto <= 0) {
        return res.status(400).json({
            error: "Monto inválido"
        });
    }

    // ======================
    // INSERTAR EN BD
    // ======================

    const sql = `
        INSERT INTO pagos 
        (pedido_id, metodo_pago, monto, codigo_aprobacion, estado)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        pedido_id,
        metodo_pago,
        monto,
        codigo_aprobacion || null,
        estado || 'PENDIENTE_VERIFICACION'
    ], (err, result) => {

        if (err) {
            console.error("Error al registrar pago:", err);
            return res.status(500).json({
                error: "Error al registrar pago"
            });
        }

        res.status(201).json({
            mensaje: "Pago registrado correctamente",
            id_pago: result.insertId
        });
    });
});


// ==========================================
// LISTAR PAGOS
// ==========================================
router.get('/', (req, res) => {

    const sql = "SELECT * FROM pagos ORDER BY fecha DESC";

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Error al listar pagos:", err);
            return res.status(500).json({
                error: "Error al obtener pagos"
            });
        }

        res.json(results);
    });
});


// ==========================================
// ACTUALIZAR ESTADO (APROBAR / RECHAZAR)
// ==========================================
router.put('/:id', (req, res) => {

    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({
            error: "Estado requerido"
        });
    }

    const sql = "UPDATE pagos SET estado = ? WHERE id = ?";

    db.query(sql, [estado, id], (err, result) => {

        if (err) {
            console.error("Error actualizando estado:", err);
            return res.status(500).json({
                error: "Error actualizando estado"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Pago no encontrado"
            });
        }

        res.json({
            mensaje: "Estado actualizado correctamente"
        });
    });
});

module.exports = router;
    }

    if (monto <= 0) {
        return res.status(400).json({
            error: "Monto inválido"
        });
    }

    // ======================
    // INSERTAR EN BD
    // ======================

    const sql = `
        INSERT INTO pagos 
        (pedido_id, metodo_pago, monto, codigo_aprobacion, estado)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        pedido_id,
        metodo_pago,
        monto,
        codigo_aprobacion || null,
        estado || 'PENDIENTE_VERIFICACION'
    ], (err, result) => {

        if (err) {
            console.error("Error al registrar pago:", err);
            return res.status(500).json({
                error: "Error al registrar pago"
            });
        }

        res.status(201).json({
            mensaje: "Pago registrado correctamente",
            id_pago: result.insertId
        });
    });
});


// ==========================================
// LISTAR PAGOS
// ==========================================
router.get('/', (req, res) => {

    const sql = "SELECT * FROM pagos ORDER BY fecha DESC";

    db.query(sql, (err, results) => {

        if (err) {
            console.error("Error al listar pagos:", err);
            return res.status(500).json({
                error: "Error al obtener pagos"
            });
        }

        res.json(results);
    });
});


// ==========================================
// ACTUALIZAR ESTADO (APROBAR / RECHAZAR)
// ==========================================
router.put('/:id', (req, res) => {

    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({
            error: "Estado requerido"
        });
    }

    const sql = "UPDATE pagos SET estado = ? WHERE id = ?";

    db.query(sql, [estado, id], (err, result) => {

        if (err) {
            console.error("Error actualizando estado:", err);
            return res.status(500).json({
                error: "Error actualizando estado"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Pago no encontrado"
            });
        }

        res.json({
            mensaje: "Estado actualizado correctamente"
        });
    });
});

module.exports = router;