const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Carpeta pública
app.use(express.static(path.join(__dirname, "public")));

// RUTA INICIO
app.get("/principal", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// RUTA PRODUCTOS
app.get("/productos", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "productos.html"));
});

// RUTA SERVICIOS
app.get("/servicios", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "servicios.html"));
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
