// db.js
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "kemsac_principal",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Probar conexión al cargar
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Conexión a MySQL exitosa (kemsac_principal)");
    connection.release();
  } catch (error) {
    console.error("❌ Error al conectar con MySQL:", error.message);
  }
})();

module.exports = db;