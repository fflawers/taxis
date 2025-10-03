import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a tu base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Trol334455.", // Tu contraseña
  database: "EJEMPLO1"
});

// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA USUARIO
// ===============================================
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


// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA TAXI
// ===============================================

// ✅ CREATE (insertar taxi)
app.post("/taxis", (req, res) => {
  const { Marca, Modelo, Año, Placa, no_lista } = req.body;
  const sql = `
    INSERT INTO Taxi (Marca, Modelo, Año, Placa, no_lista)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [Marca, Modelo, Año, Placa, no_lista], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Taxi creado", id: result.insertId });
  });
});

// ✅ READ (todos los taxis con el nombre del conductor)
app.get("/taxis", (req, res) => {
  const sql = `
    SELECT 
      t.economico, t.Marca, t.Modelo, t.Año, t.Placa, t.no_lista,
      CONCAT(u.nombre, ' ', u.apellido_P) AS nombre_conductor
    FROM Taxi t
    LEFT JOIN Usuario u ON t.no_lista = u.no_lista
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ✅ UPDATE (actualizar taxi)
app.put("/taxis/:id", (req, res) => {
  const { id } = req.params;
  const { Marca, Modelo, Año, Placa, no_lista } = req.body;
  const sql = `
    UPDATE Taxi SET Marca=?, Modelo=?, Año=?, Placa=?, no_lista=?
    WHERE economico=?
  `;
  db.query(sql, [Marca, Modelo, Año, Placa, no_lista, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Taxi no encontrado" });
    res.json({ message: "Taxi actualizado" });
  });
});

// ✅ DELETE (eliminar taxi)
app.delete("/taxis/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Taxi WHERE economico = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Taxi no encontrado" });
    res.json({ message: "Taxi eliminado" });
  });
});


// Servidor
app.listen(3000, () => {
  console.log("🚀 Servidor backend corriendo en http://localhost:3000");
});