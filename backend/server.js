import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bcrypt from "bcrypt";
// Asegúrate que la ruta sea correcta
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
// Asegúrate de que tu endpoint de login NO esté duplicado en el archivo.
// Busca el app.post("/login", ...) y reemplázalo con este.

app.post("/login", (req, res) => {
  const { no_lista, contrasena } = req.body;

  const sql = `
    SELECT no_lista, rol, nombre, apellido_P, contrasena 
    FROM Usuario 
    WHERE no_lista = ?
  `;

  db.query(sql, [no_lista], async (err, results) => {
    if (err) {
      console.error("Error de base de datos durante el login:", err);
      return res.status(500).json({ message: "Error interno del servidor." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Usuario o Contraseña incorrectos." });
    }

    const usuario = results[0];
    const hashedPasswordFromDB = usuario.contrasena;

    try {
      // ✅ --- AÑADE ESTAS LÍNEAS PARA DEPURAR ---
      console.log("1. Password from frontend:", contrasena);
      console.log("2. Hashed password from DB:", hashedPasswordFromDB);
      // ---------------------------------------------

      const match = await bcrypt.compare(contrasena, hashedPasswordFromDB);

      if (match) {
        // ... el resto de tu código para desencriptar y responder ...
        try {
          const usuarioDesencriptado = {
            no_lista: usuario.no_lista,
            rol: usuario.rol,
            nombre: decrypt(usuario.nombre),
            apellido_P: decrypt(usuario.apellido_P)
          };

          return res.json({
            message: "Inicio de sesión exitoso",
            usuario: usuarioDesencriptado,
            rol: usuarioDesencriptado.rol
          });
        } catch (decryptError) {
          console.error("Error al desencriptar datos durante el login:", decryptError);
          return res.status(500).json({ message: "Error al procesar datos del usuario." });
        }
      } else {
        return res.status(401).json({ message: "Usuario o Contraseña incorrectos." });
      }
    } catch (error) {
      console.error("Error al comparar contraseñas:", error);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  });
});
// // UPDATE para hashear la contraseña si se cambia.
// app.put("/usuarios/:id", async (req, res) => {
//   const { id } = req.params;
//   const { rol, contraseña, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(contraseña, saltRounds);
//     const sql = `
//       UPDATE Usuario SET rol=?, contraseña=?, nombre=?, apellido_P=?, apellido_M=?, Edad=?, Fecha_de_nacimiento=?
//       WHERE no_lista=?
//     `;
//     db.query(sql, [rol, hashedPassword, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento, id], (err, result) => {
//       if (err) return res.status(500).json({ error: err.message });
//       if (result.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
//       res.json({ message: "Usuario actualizado" });
//     });
//   } catch (error) {
//     console.error("Error al actualizar usuario:", error);
//     return res.status(500).json({ message: "Error interno del servidor." });
//   }
// });

// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA USUARIO
// ===============================================
//  CREATE (insertar usuario)

// Número de "rondas" de salting. 
const saltRounds = 10;

// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA USUARIO (MODIFICADOS)
// ===============================================

// ✅ CREATE (insertar usuario) - CON ENCRIPTACIÓN
// ✅ CREATE (insertar usuario) - CON ENCRIPTACIÓN Y DEBUG
// ✅ CREATE (insertar usuario) - CON DEPURACIÓN AVANZADA
app.post("/usuarios", async (req, res) => {
  console.log("1. Cuerpo de la petición recibido:", req.body); 

  // Vamos a extraer la contraseña de forma directa para evitar cualquier problema
  const contrasenaParaHashear = req.body.contrasena;
  const { rol, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento } = req.body;

  try {
    // ✅ PASO CLAVE: Verificamos el valor JUSTO ANTES de usarlo
    console.log("2. Contraseña que se va a hashear:", contrasenaParaHashear);

    // 1. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasenaParaHashear, saltRounds);

    // ... (el resto de tu código para encriptar y guardar se queda igual)
    const encryptedNombre = encrypt(nombre);
    const encryptedApellido_P = encrypt(apellido_P);
    const encryptedApellido_M = apellido_M ? encrypt(apellido_M) : encrypt('');
    const encryptedEdad = encrypt(Edad.toString());
    const encryptedFecha = encrypt(Fecha_de_nacimiento);

    const sql = `
      INSERT INTO Usuario (rol, contrasena, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [rol, hashedPassword, encryptedNombre, encryptedApellido_P, encryptedApellido_M, encryptedEdad, encryptedFecha], (err, result) => {
      if (err) {
        console.error("Error al crear usuario:", err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Usuario creado", id: result.insertId });
    });

  } catch (error) {
    console.error("Error al hashear la contrasena:", error); 
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// ✅ READ (todos los usuarios) - CON DESENCRIPTACIÓN
app.get("/usuarios", (req, res) => {
  db.query("SELECT no_lista, rol, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento FROM Usuario", (err, results) => {
    if (err) {
        console.error("Error al obtener usuarios:", err);
        return res.status(500).json({ error: err.message });
    }
    
    // Desencriptamos los datos antes de enviarlos al cliente
    const usuariosDesencriptados = results.map(user => {
      try {
        return {
          ...user,
          nombre: decrypt(user.nombre),
          apellido_P: decrypt(user.apellido_P),
          apellido_M: decrypt(user.apellido_M),
          Edad: parseInt(decrypt(user.Edad), 10), // Convertimos de nuevo a número
          Fecha_de_nacimiento: decrypt(user.Fecha_de_nacimiento)
        };
      } catch (e) {
        console.error(`Fallo al desencriptar datos para el usuario ${user.no_lista}:`, e);
        // Decide cómo manejar el error: puedes omitir el usuario o devolverlo con campos nulos
        return { ...user, nombre: 'Error de datos', apellido_P: '', apellido_M: '', Edad: 0, Fecha_de_nacimiento: '' };
      }
    });

    res.json(usuariosDesencriptados);
  });
});


// ✅ READ (usuario por id) - CON DESENCRIPTACIÓN
app.get("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  // Excluimos la contraseña del SELECT por seguridad
  db.query("SELECT no_lista, rol, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento FROM Usuario WHERE no_lista = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    const usuarioEncriptado = result[0];
    
    try {
      // Desencriptamos los campos para enviarlos
      const usuarioDesencriptado = {
        ...usuarioEncriptado,
        nombre: decrypt(usuarioEncriptado.nombre),
        apellido_P: decrypt(usuarioEncriptado.apellido_P),
        apellido_M: decrypt(usuarioEncriptado.apellido_M),
        Edad: parseInt(decrypt(usuarioEncriptado.Edad), 10),
        Fecha_de_nacimiento: decrypt(usuarioEncriptado.Fecha_de_nacimiento)
      };
      res.json(usuarioDesencriptado);

    } catch(e) {
      console.error(`Fallo al desencriptar datos para el usuario ${id}:`, e);
      return res.status(500).json({ message: "Error al procesar los datos del usuario." });
    }
  });
});


// ✅ UPDATE (actualizar usuario) - CON ENCRIPTACIÓN
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { rol, contrasena, nombre, apellido_P, apellido_M, Edad, Fecha_de_nacimiento } = req.body;

  try {
    // Los campos a actualizar
    const updates = {
      rol,
      nombre: encrypt(nombre),
      apellido_P: encrypt(apellido_P),
      apellido_M: encrypt(apellido_M),
      Edad: encrypt(Edad.toString()),
      Fecha_de_nacimiento: encrypt(Fecha_de_nacimiento)
    };

    // Si se envía una nueva contraseña, la hasheamos.
    // Si no, la excluimos de la actualización.
    if (contrasena) {
      updates.contrasena = await bcrypt.hash(contrasena, saltRounds);
    }

    const sql = `UPDATE Usuario SET ? WHERE no_lista = ?`;
    
    db.query(sql, [updates, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json({ message: "Usuario actualizado" });
    });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});


// 🚀 ENDPOINT PARA ELIMINAR USUARIO (DELETE)
app.delete("/usuarios/:id", (req, res) => {
  const { id } = req.params; // Obtenemos el ID de la URL
  const sql = "DELETE FROM Usuario WHERE no_lista = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar usuario:", err);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
    
    // Es una buena práctica verificar si algo fue realmente eliminado
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Si todo sale bien, enviamos una respuesta JSON de éxito
    res.json({ message: "Usuario eliminado exitosamente" });
  });
});


// Tu endpoint de LOGIN y DELETE de usuario se mantienen igual, ya que no manejan directamente estos campos.

// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA TAXI
// ===============================================
// (Tus endpoints de taxi ya están correctos, los dejo aquí por completitud)

// CREATE (insertar taxi) 
// ✅ CREATE (insertar taxi) - VERSIÓN MEJORADA Y ROBUSTA
app.post("/taxis", (req, res) => {
  // Para depurar, vemos qué datos llegan
  console.log("Recibido para crear taxi:", req.body); 

  const { Marca, Modelo, Año, Placa, no_lista } = req.body;

  // Verificación básica de que los datos no estén vacíos
  if (!Marca || !Modelo || !Año || !Placa || !no_lista) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    const encryptedPlaca = encrypt(Placa);

    const sql = `INSERT INTO Taxi (Marca, Modelo, Año, Placa, no_lista) VALUES (?, ?, ?, ?, ?)`;
    
    db.query(sql, [Marca, Modelo, Año, encryptedPlaca, no_lista], (err, result) => {
      // Si hay un error de la base de datos (como una placa muy larga)
      if (err) {
        console.error("Error al insertar taxi en la BD:", err);
        return res.status(500).json({ message: "Error al guardar en la base de datos.", error: err.message });
      }
      res.status(201).json({ message: "Taxi creado exitosamente", id: result.insertId });
    });

  } catch (error) {
    // Si la función de encriptación falla
    console.error("Error durante la encriptación de la placa:", error);
    return res.status(500).json({ message: "Error interno del servidor al procesar los datos." });
  }
});

// ✅ READ (todos los taxis) - VERSIÓN CORREGIDA Y ROBUSTA
app.get("/taxis", (req, res) => {
  // 1. Seleccionamos los campos por separado, sin CONCAT en la base de datos
  const sql = `
    SELECT 
      t.economico, t.Marca, t.Modelo, t.Año, t.Placa, t.no_lista,
      u.nombre AS nombre_conductor_enc, 
      u.apellido_P AS apellido_conductor_enc
    FROM Taxi t
    LEFT JOIN Usuario u ON t.no_lista = u.no_lista
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
      
    const taxisDesencriptados = results.map(taxi => {
      try {
        // 2. Desencriptamos cada parte por separado en JavaScript
        const nombre = decrypt(taxi.nombre_conductor_enc);
        const apellido = decrypt(taxi.apellido_conductor_enc);
        
        return {
          economico: taxi.economico,
          Marca: taxi.Marca,
          Modelo: taxi.Modelo,
          Año: taxi.Año,
          Placa: decrypt(taxi.Placa),
          no_lista: taxi.no_lista,
          // 3. Unimos los datos ya desencriptados para mostrarlos
          nombre_conductor: (nombre && apellido) ? `${nombre} ${apellido}` : "Sin asignar"
        };
      } catch (e) {
        console.error(`Fallo al procesar datos para el taxi ${taxi.economico}:`, e);
        return { ...taxi, Placa: 'Error de datos', nombre_conductor: 'Error de datos' };
      }
    });

    res.json(taxisDesencriptados);
  });
});

// 🚀 ENDPOINT PARA ELIMINAR TAXI (DELETE)
app.delete("/taxis/:id", (req, res) => {
  // En este caso, el 'id' que viene de la URL es el número 'economico' del taxi
  const { id } = req.params; 
  const sql = "DELETE FROM Taxi WHERE economico = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar el taxi:", err);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Taxi no encontrado" });
    }
    
    res.json({ message: "Taxi eliminado exitosamente" });
  });
});

// Servidor
app.listen(3000, () => {
  console.log("Servidor backend corriendo en http://localhost:3000");
});