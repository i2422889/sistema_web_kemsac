const express = require("express");
const router = express.Router();
const db = require("../db");

/* ==========================================
   1. GESTIÓN DE CATEGORÍAS
========================================== */

// 🔹 LISTAR CATEGORÍAS
router.get("/categorias", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM categorias ORDER BY nombre ASC"
        );
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ error: "No se pudieron cargar las categorías." });
    }
});


// 🔹 CREAR CATEGORÍA
router.post("/categorias", async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio." });
        }

        const query = "INSERT INTO categorias (nombre) VALUES (?)";

        const [result] = await db.query(query, [nombre]);

        res.status(201).json({
            message: "Categoría creada con éxito",
            id: result.insertId
        });

    } catch (error) {
        console.error("Error al guardar categoría:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Esta categoría ya existe." });
        }

        res.status(500).json({ error: "Error al guardar la categoría." });
    }
    
});


/* ==========================================
   2. GESTIÓN DE PRODUCTOS
========================================== */

// 🔹 LISTAR PRODUCTOS
router.get("/productos", async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*,
                c.nombre AS categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            ORDER BY p.id DESC
        `;

        const [rows] = await db.query(query);
        res.json(rows);

    } catch (error) {
        console.error("Error al listar productos:", error);
        res.status(500).json({ error: "Error al obtener productos." });
    }
});


// 🔹 OBTENER PRODUCTO POR ID
router.get("/productos/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                p.*,
                c.nombre AS categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = ?
        `;

        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado." });
        }

        res.json(rows[0]);

    } catch (error) {
        console.error("Error al buscar producto:", error);
        res.status(500).json({ error: "Error al buscar producto." });
    }
});


// 🔹 CREAR PRODUCTO
router.post("/productos", async (req, res) => {
    try {
        const p = req.body;

        if (!p.nombre || !p.precio || !p.categoria_id) {
            return res.status(400).json({
                error: "Nombre, precio y categoría son obligatorios."
            });
        }

        const query = `
            INSERT INTO productos 
            (nombre, marca, descripcion, precio, stock, stock_minimo, categoria_id, imagen_url, estado)
            VALUES (?,?,?,?,?,?,?,?,?)
        `;

        const values = [
            p.nombre,
            p.marca || null,
            p.descripcion || null,
            p.precio,
            p.stock || 0,
            p.stock_minimo || 0,
            p.categoria_id,
            p.imagen_url || null,
            p.estado || "activo"
        ];

        const [result] = await db.query(query, values);

        res.status(201).json({
            message: "Producto creado correctamente.",
            id: result.insertId
        });

    } catch (error) {
        console.error("Error al guardar producto:", error);
        res.status(500).json({ error: "Error al guardar producto." });
    }
});


// 🔹 ACTUALIZAR PRODUCTO
router.put("/productos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const p = req.body;

        if (!p.nombre || !p.precio || !p.categoria_id) {
            return res.status(400).json({
                error: "Nombre, precio y categoría son obligatorios."
            });
        }

        const query = `
            UPDATE productos SET
                nombre=?,
                marca=?,
                descripcion=?,
                precio=?,
                stock=?,
                stock_minimo=?,
                categoria_id=?,
                imagen_url=?,
                estado=?
            WHERE id=?
        `;

        const values = [
            p.nombre,
            p.marca || null,
            p.descripcion || null,
            p.precio,
            p.stock || 0,
            p.stock_minimo || 0,
            p.categoria_id,
            p.imagen_url || null,
            p.estado || "activo",
            id
        ];

        await db.query(query, values);

        res.json({ message: "Producto actualizado correctamente." });

    } catch (error) {
        console.error("Error actualizando producto:", error);
        res.status(500).json({ error: "No se pudo actualizar." });
    }
});


// 🔹 ELIMINAR PRODUCTO
router.delete("/productos/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM productos WHERE id = ?", [id]);

        res.json({ message: "Producto eliminado ." });

    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ error: "Error al eliminar." });
    }
});


// PARA ELIMINAR LA CATEGORIA //
// 🔹 ELIMINAR CATEGORÍA
router.delete("/categorias/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si tiene productos asociados
        const [productos] = await db.query(
            "SELECT id FROM productos WHERE categoria_id = ?",
            [id]
        );

        if (productos.length > 0) {
            return res.status(400).json({
                error: "No se puede eliminar. La categoría tiene productos asociados."
            });
        }

        const [result] = await db.query(
            "DELETE FROM categorias WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Categoría no encontrada."
            });
        }

        res.json({ message: "Categoría eliminada correctamente." });

    } catch (error) {
        console.error("Error eliminando categoría:", error);
        res.status(500).json({ error: "Error al eliminar categoría." });
    }
});






// CATEGORIA ELIMANR //
/* ==========================================
   ELIMINAR CATEGORÍA
========================================== */

router.delete('/categorias/:id', async (req, res) => {

    const { id } = req.params;

    try {

        // 🔹 Verificar si hay productos usando esta categoría
        const [productos] = await db.query(
            "SELECT id FROM productos WHERE categoria_id = ?",
            [id]
        );

        if (productos.length > 0) {
            return res.status(400).json({
                error: "No se puede eliminar. Esta categoría tiene productos asociados."
            });
        }

        // 🔹 Eliminar categoría
        await db.query(
            "DELETE FROM categorias WHERE id = ?",
            [id]
        );

        res.json({
            message: "Categoría eliminada correctamente."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error al eliminar categoría."
        });

    }

});
module.exports = router;