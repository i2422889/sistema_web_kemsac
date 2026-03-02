const express = require('express');
const router = express.Router();
const db = require('../db'); // Tu archivo de conexión con Pool

// Ruta para obtener todos los productos activos
router.get('/listar', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM productos WHERE estado = 'activo'");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

module.exports = router;