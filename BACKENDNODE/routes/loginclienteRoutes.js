const express = require('express');
const router = express.Router();
const db = require('../db'); // Conexión MySQL2
const bcrypt = require('bcrypt');

// =========================
// REGISTRO DE USUARIO
// =========================
router.post('/registro', async (req, res) => {
    const { nombre, email, pass } = req.body;

    if(!nombre || !email || !pass) 
        return res.json({ success: false, message: 'Datos incompletos' });

    try {
        // Verificar si el email ya existe
        const [existing] = await db.query('SELECT * FROM logincliente WHERE email = ?', [email]);
        if(existing.length > 0) return res.json({ success: false, message: 'El email ya está registrado' });

        // Hashear contraseña
        const hashedPass = await bcrypt.hash(pass, 10);

        // Insertar usuario
        await db.query('INSERT INTO logincliente (nombre, email, password) VALUES (?, ?, ?)', [nombre, email, hashedPass]);

        res.json({ success: true, message: 'Usuario registrado correctamente' });
    } catch(err) {
        console.error("Error en registro:", err);
        res.json({ success: false, message: 'Error inesperado al registrar usuario' });
    }
});

// =========================
// LOGIN DE USUARIO
// =========================
router.post('/login', async (req, res) => {
    const { email, pass } = req.body;

    if(!email || !pass) return res.json({ success: false, message: 'Datos incompletos' });

    try {
        const [users] = await db.query('SELECT * FROM logincliente WHERE email = ?', [email]);
        if(users.length === 0) return res.json({ success: false, message: 'Usuario no encontrado' });

        const user = users[0];
        const match = await bcrypt.compare(pass, user.password);

        if(match){
            res.json({ success: true, message: 'Login exitoso', user: { id: user.id, nombre: user.nombre } });
        } else {
            res.json({ success: false, message: 'Contraseña incorrecta' });
        }
    } catch(err) {
        console.error("Error en login:", err);
        res.json({ success: false, message: 'Error inesperado al iniciar sesión' });
    }
});

module.exports = router;

