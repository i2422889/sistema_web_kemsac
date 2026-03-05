// server.js
const express = require("express");
const path = require("path");
const db = require("./db");
const pedidostipoRoutes = require('./routes/pedidostipoRoutes');
const productosRoutes = require("./routes/productosRoutes");
const loginRoutes = require("./routes/loginclienteRoutes");
const tipopagoRoutes = require('./routes/tipopagoRoutes');
const loginadminRoutes = require('./routes/loginadminRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
//admin//
const panelgeneraladminRoutes = require('./routes/panelgeneraladminRoutes');




const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;
const cors = require('cors'); // Al inicio con los require
// ...

app.use(cors()); // Antes de las rutas
// ======================
// 1. MIDDLEWARES
// ======================
// 2. AUMENTAR EL LÍMITE PARA IMÁGENES BASE64
// CAMBIO: Por defecto Express usa 1mb, las fotos de laptop pesan más.
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

///// PARA SERVIR ARCHIVOS ESTÁTICOS (CSS, JS, IMÁGENES)//
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// ======================
// 2. RUTAS API
// ======================
app.use("/api/productos", productosRoutes);
app.use("/api/logincliente", loginRoutes);
app.use('/api/pedidostipo', pedidostipoRoutes);
app.use('/api/pedidos', tipopagoRoutes);
app.use('/api/loginadmin', loginadminRoutes); 
app.use('/api/reservas', reservaRoutes);
app.use('/api/', panelgeneraladminRoutes);
// ======================
// 3. RUTAS HTML
// ======================
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../public/index.html")));
app.get("/productos", (req, res) => res.sendFile(path.join(__dirname, "../public/productos.html")));
app.get("/repuestos", (req, res) => res.sendFile(path.join(__dirname, "../public/repuestos.html")));



// ======================
// 5. ARRANCAR SERVIDOR
// ======================
app.listen(PORT, () => {
  console.log(`
🚀 Servidor KEMSAC corriendo en: http://localhost:${PORT}
📦 API de Productos lista en: http://localhost:${PORT}/api/productos/listar
`);
});