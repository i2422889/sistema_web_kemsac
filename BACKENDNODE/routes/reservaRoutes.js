const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/reservas  -> crear una nueva reserva
router.post('/', async (req, res) => {
  const { name, phone, email, date, time, product, quantity, notes } = req.body;

  // validaciones básicas
  if (!name || !phone || !date || !time || !product) {
    return res.status(400).json({ success: false, message: 'Datos incompletos' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO reservas
        (nombre, telefono, email, fecha, hora, producto, cantidad, notas, estado, creado_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', NOW())`,
      [name, phone, email || null, date, time, product, quantity || 1, notes || null]
    );

    await connection.commit();

    return res.json({ success: true, reserva_id: result.insertId });

  } catch (error) {
    console.error('Error al crear reserva:', error.message);
    if (connection) await connection.rollback();
    return res.status(500).json({ success: false, message: 'Error al crear reserva' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
