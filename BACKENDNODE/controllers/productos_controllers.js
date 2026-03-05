const db = require('../db');

exports.obtenerTodos = async (req, res) => {
    try {
        // Traemos todo de la tabla productos o repuestos
        const [rows] = await db.query("SELECT * FROM productos");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar la base de datos" });
    }
};