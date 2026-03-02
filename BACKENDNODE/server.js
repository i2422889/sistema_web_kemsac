// server.js
const express = require("express");
const path = require("path");
const db = require("./db");
const tipoComprasRoutes = require('./routes/tipocomprasRoutes');
const productosRoutes = require("./routes/productosRoutes");
const loginRoutes = require("./routes/loginclienteRoutes");
const tipopagoRoutes = require('./routes/tipopagoRoutes');
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

// ======================
// 1. MIDDLEWARES
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// ======================
// 2. RUTAS API
// ======================
app.use("/api/productos", productosRoutes);
app.use("/api/logincliente", loginRoutes);
app.use('/api/tipoentrega', tipoComprasRoutes);
app.use('/api/tipopago', tipopagoRoutes);
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