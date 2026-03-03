const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Asegúrate de que este archivo exporta tu conexión a MySQL (promisified)

// Esta es la clave secreta para firmar los tokens. Manténla segura.
const JWT_SECRET = 'KEMSAC_MASTER_KEY_2026';

// ==========================================
// 1. RUTA DE LOGIN (PÚBLICA)
// ==========================================
router.post('/', async (req, res) => {
    const { usuario, password } = req.body;

    try {
        // Buscamos al usuario por el campo 'usuario' de tu tabla
        const [rows] = await db.query('SELECT * FROM usuarios_admin WHERE usuario = ?', [usuario]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: "El usuario no existe." });
        }

        const admin = rows[0];

        // Comparamos la contraseña ingresada con el hash VARCHAR(255) de la base de datos
        const esValido = await bcrypt.compare(password, admin.password);

        if (!esValido) {
            return res.status(401).json({ success: false, message: "Contraseña incorrecta." });
        }

        // Si es válido, generamos el Token JWT
        const token = jwt.sign(
            { id: admin.id, rol: admin.rol }, 
            JWT_SECRET, 
            { expiresIn: '8h' } // El admin tendrá sesión por 8 horas
        );

        // Enviamos la respuesta exitosa
        res.json({
            success: true,
            token: token,
            nombre: admin.nombre,
            rol: admin.rol
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
});

// ==========================================
// 2. MIDDLEWARE DE AUTORIZACIÓN (EL GUARDIA)
// ==========================================
const verificarAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

    if (!token) {
        return res.status(403).json({ success: false, message: "No se proporcionó un token." });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: "Sesión expirada o token inválido." });
        }
        req.adminId = decoded.id;
        req.adminRol = decoded.rol;
        next();
    });
};

// ==========================================
// 3. RUTA PARA CREAR NUEVO ADMIN (PROTEGIDA)
// ==========================================
router.post('/registrar-admin', verificarAdmin, async (req, res) => {
    const { usuario, password, nombre, rol } = req.body;

    try {
        // Encriptamos la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = 'INSERT INTO usuarios_admin (usuario, password, nombre, rol) VALUES (?, ?, ?, ?)';
        await db.query(sql, [usuario, hashedPassword, nombre, rol || 'admin']);

        res.json({ success: true, message: "Nuevo administrador registrado correctamente." });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.json({ success: false, message: "El nombre de usuario ya está en uso." });
        }
        res.status(500).json({ success: false, message: "Error al registrar el admin." });
    }
});

// ==========================================
// 4. RUTA PARA LISTAR ADMINS (PROTEGIDA)
// ==========================================
router.get('/listar-admins', verificarAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, usuario, nombre, rol, fecha_registro FROM usuarios_admin');
        res.json({ success: true, admins: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error al obtener la lista." });
    }
});

module.exports = router;