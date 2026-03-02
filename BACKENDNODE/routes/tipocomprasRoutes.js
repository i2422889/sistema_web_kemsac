// routes/tipocomprasRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Tu conexión MySQL2

// =========================
// GUARDAR TIPO DE ENTREGA
// =========================
router.post('/', async (req, res) => {
    const { usuarioId, tipo, ubicacion, referencia, telefono, nota, subtotal, costo_envio } = req.body;

    // Validación básica
    if(!usuarioId || !tipo){
        return res.json({ success: false, message: 'Datos incompletos' });
    }

    try {
        if(tipo === 'delivery'){
            // Insertar delivery en DB
            await db.query(
                `INSERT INTO tipoentregacliente 
                (usuario_id, tipo_compra, ubicacion, referencia, telefono, nota_adicional, subtotal, costo_envio, fecha_registro) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    usuarioId,            // id del cliente
                    tipo,                 // 'delivery'
                    ubicacion || null,    // null si no hay
                    referencia || null,
                    telefono || null,
                    nota || null,
                    subtotal || 0,
                    costo_envio || 0
                ]
            );
        } else if(tipo === 'recoger'){
            // Insertar recogida en tienda en DB
            await db.query(
                `INSERT INTO tipoentregacliente 
                (usuario_id, tipo_compra, fecha_registro) 
                VALUES (?, ?, NOW())`,
                [usuarioId, tipo]
            );
        } else {
            return res.json({ success: false, message: 'Tipo de entrega no válido' });
        }

        res.json({ success: true, message: 'Tipo de entrega guardado correctamente' });
    } catch(err){
        console.error('Error guardando tipo de entrega:', err);
        res.json({ success: false, message: 'Error al guardar tipo de entrega' });
    }
});

module.exports = router;