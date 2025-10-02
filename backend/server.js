import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a tu base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root",      // cambia si usas otro usuario
  password: "Trol334455.",  // pon tu contraseña de MySQL
  database: "EJEMPLO1"
});

// ✅ CREATE (insertar usuario)
app.post("/usuarios", (req, res) => {
  const { rol, contraseña, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento } = req.body;
  const sql = `
    INSERT INTO Usuario (rol, contraseña, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [rol, contraseña, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Usuario creado", id: result.insertId });
  });
});

// ✅ READ (todos los usuarios)
app.get("/usuarios", (req, res) => {
  db.query("SELECT * FROM Usuario", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ✅ READ (usuario por id)
app.get("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM Usuario WHERE no_lista = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(result[0]);
  });
});

// ✅ UPDATE (actualizar usuario)
app.put("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  const { rol, contraseña, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento } = req.body;
  const sql = `
    UPDATE Usuario SET rol=?, contraseña=?, nombre=?, apellido_P=?, apellido_M=?, Edad=?, Fecha_de_nacimiento=?
    WHERE no_lista=?
  `;
  db.query(sql, [rol, contraseña, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario actualizado" });
  });
});

// ✅ DELETE (eliminar usuario)
app.delete("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Usuario WHERE no_lista = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  });
});

// servidor
app.listen(3000, () => {
  console.log("🚀 Servidor backend corriendo en http://localhost:3000");
});