import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bcrypt from "bcrypt";
import { encrypt, decrypt } from './crypto-utils.js';

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
// 🚀 ENDPOINT PARA INICIO DE SESIÓN (LOGIN)
// ===============================================

// ENDPOINT PARA INICIO DE SESIÓN (LOGIN) - MODIFICADO
app.post("/login", (req, res) => {
  const { no_lista, contraseña } = req.body;

  const sql = `
    SELECT no_lista, rol, nombre, apellido_P, contraseña FROM Usuario 
    WHERE no_lista = ?
  `;

  db.query(sql, [no_lista], async (err, results) => {
    if (err) {
      console.error("Error de base de datos durante el login:", err);
      return res.status(500).json({ message: "Error interno del servidor." });
    }

    // 2. Si no se encuentra el usuario, las credenciales son incorrectas
    if (results.length === 0) {
      return res.status(401).json({ message: "Username o Contraseña incorrectos." });
    }

    const usuario = results[0];
    const hashedPasswordFromDB = usuario.contraseña;

    try {
      // 3. Compara la contraseña enviada con el hash de la BD
      const match = await bcrypt.compare(contraseña, hashedPasswordFromDB);

      if (match) {
        // Eliminar la contraseña (el hash) antes de enviarla al cliente
        delete usuario.contraseña; 
        
        return res.json({ 
          message: "Inicio de sesión exitoso", 
          usuario: usuario,
          rol: usuario.rol
        });
      } else {
        // La contraseña no coincide
        return res.status(401).json({ message: "Username o Contraseña incorrectos." });
      }
    } catch (error) {
        console.error("Error al comparar contraseñas:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
  });
});

// UPDATE para hashear la contraseña si se cambia.
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { rol, contraseña, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);
    const sql = `
      UPDATE Usuario SET rol=?, contraseña=?, nombre=?, apellido_P=?, apellido_M=?, Edad=?, Fecha_de_nacimiento=?
      WHERE no_lista=?
    `;
    db.query(sql, [rol, hashedPassword, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json({ message: "Usuario actualizado" });
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA USUARIO
// ===============================================
//  CREATE (insertar usuario)

// Número de "rondas" de salting. 
const saltRounds = 10;

app.post("/usuarios", async (req, res) => {
  const { rol, contraseña, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento } = req.body;
  
  try {
    // 1. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

    const sql = `
      INSERT INTO Usuario (rol, contraseña, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // 2. Guardar el hash en la BD, no la contraseña original
    db.query(sql, [rol, hashedPassword, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Usuario creado", id: result.insertId });
    });

  } catch (error) {
    console.error("Error al hashear la contraseña:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

//  READ (todos los usuarios)
app.get("/usuarios", (req, res) => {
  db.query("SELECT * FROM Usuario", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//  READ (usuario por id)
app.get("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM Usuario WHERE no_lista = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(result[0]);
  });
});

//  UPDATE (actualizar usuario)
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

//  DELETE (eliminar usuario)
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

// CREATE (insertar taxi) 
app.post("/taxis", (req, res) => {
  const { Marca, Modelo, Año, Placa, no_lista } = req.body;
  
  // Encriptamos la placa antes de guardarla
  const encryptedPlaca = encrypt(Placa);

  const sql = `
    INSERT INTO Taxi (Marca, Modelo, Año, Placa, no_lista)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [Marca, Modelo, Año, encryptedPlaca, no_lista], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Taxi creado", id: result.insertId });
  });
});


//  READ (todos los taxis con el nombre del conductor)

// READ (todos los taxis) - MODIFICADO
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

    // Desencriptamos la placa para cada taxi antes de enviarla al cliente
    const taxisDesencriptados = results.map(taxi => {
      return {
        ...taxi,
        Placa: decrypt(taxi.Placa)
      };
    });

    res.json(taxisDesencriptados);
  });
});

// app.get("/taxis", (req, res) => {
//   const sql = `
//     SELECT 
//       t.economico, t.Marca, t.Modelo, t.Año, t.Placa, t.no_lista,
//       CONCAT(u.nombre, ' ', u.apellido_P) AS nombre_conductor
//     FROM Taxi t
//     LEFT JOIN Usuario u ON t.no_lista = u.no_lista
//   `;
//   db.query(sql, (err, results) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(results);
//   });
// });

//  UPDATE (actualizar taxi)
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

//  DELETE (eliminar taxi)
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
  console.log(" Servidor backend corriendo en http://localhost:3000");
});