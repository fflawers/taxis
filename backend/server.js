import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { encrypt, decrypt } from './crypto-utils.js';
import pool from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const saltRounds = 10;

// ===============================================
// 🚀 ENDPOINT PARA INICIO DE SESIÓN (LOGIN)
// ===============================================
app.post("/login", async (req, res) => {
  const { no_lista, contrasena } = req.body;

  const sqlQuery = `
    SELECT no_lista, rol, nombre, apellido_p, contrasena 
    FROM usuario 
    WHERE no_lista = $1
  `;

  // El bloque 'try' DEBE empezar aquí, para atrapar errores de la base de datos
  try {
    // 1. EJECUTAMOS LA CONSULTA
    //    Usamos 'pool.query' y le pasamos la consulta y los valores
    //    La librería 'pg' devuelve los resultados en una propiedad llamada 'rows'
    const { rows: results } = await pool.query(sqlQuery, [no_lista]);

    // 2. REVISAMOS LOS RESULTADOS
    //    Esta lógica se mueve aquí adentro, ahora que 'results' existe
    if (!results || results.length === 0) {
      return res.status(401).json({ message: "Usuario o Contraseña incorrectos." });
    }

    // 3. CONTINUAMOS CON TU LÓGICA (esto ya estaba bien)
    const usuario = results[0];
    const hashedPasswordFromDB = usuario.contrasena;

    const match = await bcrypt.compare(contrasena, hashedPasswordFromDB);

    if (match) {
      const usuarioDesencriptado = {
        no_lista: usuario.no_lista,
        rol: usuario.rol,
        nombre: decrypt(usuario.nombre),
        apellido_p: decrypt(usuario.apellido_p)
      };

      return res.json({
        message: "Inicio de sesión exitoso",
        usuario: usuarioDesencriptado,
        rol: usuarioDesencriptado.rol
      });
    } else {
      return res.status(401).json({ message: "Usuario o Contraseña incorrectos." });
    }

  } catch (error) {
    // Este 'catch' ahora atrapa errores de la BD, de bcrypt, o de decrypt
    console.error("Error al procesar login:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA USUARIO
// ===============================================

// ✅ CREATE (insertar usuario) - TRADUCIDO A PG
app.post("/usuarios", async (req, res) => {
  // 1. Agregamos 'estatus' a la desestructuración
  const { rol, contrasena, nombre, apellido_p, apellido_m, edad, fecha_de_nacimiento, estatus } = req.body;

  // ✨ --- TU VALIDACIÓN (ESTO QUEDA IGUAL) --- ✨
  if (!rol || !contrasena || !nombre || !apellido_p || !edad || !fecha_de_nacimiento) {
    return res.status(400).json({
      message: "Faltan campos obligatorios. Asegúrate de enviar: rol, contrasena, nombre, apellido_p, edad, fecha_de_nacimiento."
    });
  }
  // ✨ --- FIN DE LA VALIDACIÓN --- ✨

  try {
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);
    const encryptedData = {
      rol,
      contrasena: hashedPassword,
      nombre: encrypt(nombre),
      apellido_p: encrypt(apellido_p),
      apellido_m: apellido_m
        ? encrypt(apellido_m.toString()) // Asegura que se encripta algo válido
        : null, // Si es null o undefined, envías null a la base de datos
      edad: encrypt(edad.toString()),
      fecha_de_nacimiento: encrypt(fecha_de_nacimiento)
    };

    // --- LÓGICA DE BD (ESTO CAMBIA) ---
    // 1. Define la consulta SQL
    const sqlQuery = `
      INSERT INTO usuario (rol, contrasena, nombre, apellido_p, apellido_m, edad, fecha_de_nacimiento, estatus)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;// 'RETURNING *' hace lo mismo que el .select() de Supabase

    // 2. Define el array de valores (¡en orden!)
    const values = [
      encryptedData.rol,
      encryptedData.contrasena,
      encryptedData.nombre,
      encryptedData.apellido_p,
      encryptedData.apellido_m,
      encryptedData.edad,
      encryptedData.fecha_de_nacimiento,
      estatus || 'Activo' // 3. Valor por defecto si no viene en el body
    ];

    // 3. Ejecuta la consulta
    //    Usamos 'rows' para obtener los resultados
    const { rows } = await pool.query(sqlQuery, values);
    res.status(201).json({ message: "Usuario creado exitosamente", usuario: rows[0] });
  } catch (err) { // Este catch ahora atrapa errores de bcrypt, encrypt, y de la BD
    console.error("Error al crear usuario:", err);
    return res.status(500).json({ message: "Error interno del servidor.", error: err.message });
  }
});

// ✅ READ (todos los usuarios) - TRADUCIDO A PG
app.get("/usuarios", async (req, res) => {
  // 1. Define la consulta
  const sqlQuery = `
    SELECT no_lista, rol, nombre, apellido_p, apellido_m, edad, fecha_de_nacimiento, estatus 
    FROM usuario
  `;

  try {
    const { rows: results } = await pool.query(sqlQuery);

    const usuariosDesencriptados = results.map(user => {
      try {
        return {
          no_lista: user.no_lista,
          rol: user.rol,
          nombre: decrypt(user.nombre),
          apellido_p: decrypt(user.apellido_p),
          apellido_m: decrypt(user.apellido_m),
          edad: parseInt(decrypt(user.edad), 10),
          fecha_de_nacimiento: decrypt(user.fecha_de_nacimiento),
          estatus: user.estatus
        };
      }
      catch (e) {
        console.error(`Fallo al desencriptar datos para el usuario ${user.no_lista}:`, e);
        return { ...user, nombre: 'Error de datos' };
      }
    });
    res.json(usuariosDesencriptados);

  } catch (err) { // Atrapa errores de la BD
    console.error("Error al obtener usuarios:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ✅ GET (obtener SOLO usuarios con rol de 'Taxista') - TRADUCIDO A PG
app.get("/usuarios/taxistas", async (req, res) => {
  // 1. Define la consulta
  //    'ILIKE' es el equivalente SQL de 'ilike()'
  const sqlQuery = `
    SELECT no_lista, rol, nombre, apellido_p 
    FROM usuario 
    WHERE rol ILIKE $1
  `;
  const values = ['taxista'];

  try {
    // 2. Ejecuta la consulta
    const { rows: data } = await pool.query(sqlQuery, values);

    // 3. Tu lógica de desencriptación (ESTO QUEDA IGUAL)
    const taxistasDesencriptados = data.map(user => {
      try {
        const nombre = user.nombre ? decrypt(user.nombre) : '';
        const apellido_p = user.apellido_p ? decrypt(user.apellido_p) : '';

        return {
          no_lista: user.no_lista,
          rol: user.rol,
          nombre: nombre,
          apellido_p: apellido_p,
        };
      } catch (e) {
        console.error(`Fallo al desencriptar datos para el taxista ${user.no_lista}:`, e);
        return { ...user, nombre: 'Error de datos' };
      }
    });
    res.json(taxistasDesencriptados);

  } catch (error) { // Atrapa errores de la BD
    console.error("Error al obtener taxistas:", error);
    return res.status(500).json({ error: error.message });
  }
});



// ✅ READ (usuario por id) - TRADUCIDO A PG
app.get("/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  // 1. Define la consulta
  const sqlQuery = `
      SELECT no_lista, rol, nombre, apellido_p, apellido_m, edad, fecha_de_nacimiento 
      FROM usuario 
      WHERE no_lista = $1
    `;
  const values = [id];

  try {
    // 2. Ejecuta la consulta
    const { rows } = await pool.query(sqlQuery, values);

    // 3. Revisa si se encontró al usuario (reemplaza a .single() y if (!data))
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const data = rows[0]; // Obtenemos el primer (y único) resultado

    // 4. Tu lógica de desencriptación (ESTO QUEDA IGUAL)
    //    (Solo moví el try...catch de decrypt para que sea más claro)
    try {
      const usuarioDesencriptado = {
        ...data,
        nombre: decrypt(data.nombre),
        apellido_p: decrypt(data.apellido_p),
        apellido_m: decrypt(data.apellido_m),
        edad: parseInt(decrypt(data.edad), 10),
        fecha_de_nacimiento: decrypt(data.fecha_de_nacimiento)
      };
      res.json(usuarioDesencriptado);
    } catch (e) {
      console.error(`Fallo al desencriptar datos para el usuario ${id}:`, e);
      return res.status(500).json({ message: "Error al procesar los datos del usuario." });
    }

  } catch (err) { // Atrapa errores de la BD
    console.error("Error al obtener usuario:", err);
    return res.status(500).json({ error: err.message });
  }
});



// ✅ UPDATE (actualizar usuario) - TRADUCIDO A PG (Versión Dinámica)
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { rol, contrasena, nombre, apellido_p, apellido_m, edad, fecha_de_nacimiento, estatus } = req.body;

  try {
    // 1. Prepara los campos y valores
    //    Usamos un objeto para construir la consulta dinámicamente
    const fields = {
      rol,
      nombre: encrypt(nombre),
      apellido_p: encrypt(apellido_p),
      apellido_m: encrypt(apellido_m || ''),
      edad: encrypt(edad.toString()),
      fecha_de_nacimiento: encrypt(fecha_de_nacimiento),
      estatus: estatus // 2. Nuevo campo soportado
    };

    // 2. Añade la contraseña solo si se proporcionó
    if (contrasena) {
      fields.contrasena = await bcrypt.hash(contrasena, saltRounds);
    }

    // 3. Construye la consulta SQL dinámicamente
    const fieldKeys = Object.keys(fields); // ['rol', 'nombre', 'contrasena', ...]
    const values = Object.values(fields);   // ['Admin', '...', 'hash...', ...]

    // Esto crea: "rol = $1, nombre = $2, contrasena = $3, ..."
    const fieldSet = fieldKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');

    // El 'id' siempre será el último parámetro
    const sqlQuery = `
      UPDATE usuario 
      SET ${fieldSet} 
      WHERE no_lista = $${fieldKeys.length + 1}
    `;

    const allValues = [...values, id]; // Añadimos el 'id' al final del array de valores

    // 4. Ejecuta la consulta
    await pool.query(sqlQuery, allValues);

    res.json({ message: "Usuario actualizado" });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// ✅ DELETE (eliminar usuario) - TRADUCIDO A PG
app.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  // 1. Define la consulta
  const sqlQuery = "DELETE FROM usuario WHERE no_lista = $1";
  const values = [id];

  try {
    // 2. Ejecuta la consulta
    await pool.query(sqlQuery, values);

    res.json({ message: "Usuario eliminado exitosamente" });

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA TAXI
// ===============================================

// ✅ CREATE (insertar taxi) - TRADUCIDO A PG
app.post("/taxis", async (req, res) => {
  const { marca, modelo, año, placa, no_lista, estatus } = req.body;

  try {
    // --- CONSULTA 1: Validar el rol del conductor ---
    const userQuery = "SELECT rol FROM usuario WHERE no_lista = $1";
    const { rows: users } = await pool.query(userQuery, [no_lista]);

    if (no_lista && (users.length === 0 || users[0].rol !== 'Taxista')) {
      return res.status(403).json({ message: "El conductor asignado debe ser un taxista." });
    }

    // --- CONSULTA 2: Insertar el taxi (si la validación pasó) ---
    const encryptedPlaca = encrypt(placa);
    const insertQuery = `
      INSERT INTO taxi (marca, modelo, anio, placa, no_lista, estatus) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING economico;
    `;

    const values = [marca, modelo, año, encryptedPlaca, no_lista || null, estatus || 'Activo'];
    const { rows } = await pool.query(insertQuery, values);

    res.status(201).json({ message: "Taxi creado exitosamente", id: rows[0].economico });
  } catch (err) {
    console.error("Error al crear taxi:", err);
    return res.status(500).json({ message: "Error interno.", error: err.message });
  }
});

// ✅ READ (todos los taxis) con ESTATUS y JOIN
app.get("/taxis", async (req, res) => {
  const sqlQuery = `
    SELECT 
      t.economico, t.marca, t.modelo, t.anio, t.placa, t.no_lista, t.estatus,
      u.nombre, u.apellido_p 
    FROM taxi t
    LEFT JOIN usuario u ON t.no_lista = u.no_lista
  `;

  try {
    const { rows: data } = await pool.query(sqlQuery);

    const taxisDesencriptados = data.map(taxi => {
      try {
        const nombre = taxi.nombre ? decrypt(taxi.nombre) : null;
        const apellido = taxi.apellido_p ? decrypt(taxi.apellido_p) : null;

        return {
          economico: taxi.economico,
          marca: taxi.marca,
          modelo: taxi.modelo,
          año: taxi.anio,
          placa: decrypt(taxi.placa),
          no_lista: taxi.no_lista,
          estatus: taxi.estatus || 'Activo', // Importante para el Frontend
          nombre_conductor: (nombre && apellido) ? `${nombre} ${apellido}` : "Sin asignar"
        };
      } catch (e) {
        return { ...taxi, placa: 'Error de datos', nombre_conductor: 'Error de datos' };
      }
    });
    res.json(taxisDesencriptados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ DELETE (eliminar taxi) - TRADUCIDO A PG
app.delete("/taxis/:id", async (req, res) => {
  const { id } = req.params;

  // 1. Define la consulta
  const sqlQuery = "DELETE FROM taxi WHERE economico = $1";
  const values = [id];

  try {
    // 2. Ejecuta la consulta
    await pool.query(sqlQuery, values);
    res.json({ message: "Taxi eliminado exitosamente" });

  } catch (error) {
    console.error("Error al eliminar taxi:", error);
    return res.status(500).json({ message: "Error interno.", error: error.message });
  }
});

// ✅ UPDATE (actualizar taxi) - Soporta Estatus y Reasignación
app.put("/taxis/:id", async (req, res) => {
  const { id } = req.params;
  const { marca, modelo, año, placa, no_lista, estatus } = req.body;

  try {
    // 1. Validar conductor si se está asignando uno
    if (no_lista) {
      const userQuery = "SELECT rol FROM usuario WHERE no_lista = $1";
      const { rows: users } = await pool.query(userQuery, [no_lista]);
      if (users.length === 0 || users[0].rol !== 'Taxista') {
        return res.status(403).json({ message: "El conductor debe ser un taxista." });
      }
    }

    const encryptedPlaca = encrypt(placa);
    const updateQuery = `
      UPDATE taxi 
      SET marca = $1, modelo = $2, anio = $3, placa = $4, no_lista = $5, estatus = $6 
      WHERE economico = $7
    `;

    const values = [marca, modelo, año, encryptedPlaca, no_lista || null, estatus, id];
    await pool.query(updateQuery, values);

    res.json({ message: "Taxi actualizado exitosamente" });
  } catch (err) {
    console.error("Error al actualizar taxi:", err);
    res.status(500).json({ message: "Error interno." });
  }
});

// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA INCIDENCIA (CORREGIDOS)
// ===============================================

// ✅ CREATE (insertar incidencia con conductor) - TRADUCIDO A PG
app.post("/incidencias", async (req, res) => {
  const { descripcion, observaciones, no_lista } = req.body;

  // Tu validación (queda igual)
  if (!descripcion || !no_lista) {
    return res.status(400).json({ message: "La descripción y el conductor son obligatorios." });
  }

  try {
    // --- CONSULTA 1: Validar el rol del conductor ---
    const userQuery = "SELECT rol FROM usuario WHERE no_lista = $1";
    const { rows: users } = await pool.query(userQuery, [no_lista]);

    if (users.length === 0 || users[0].rol !== 'Taxista') {
      return res.status(403).json({ message: "Operación no permitida: El usuario seleccionado no es un taxista." });
    }

    // --- CONSULTA 2: Insertar la incidencia (CORREGIDO) ---
    const insertQuery = `INSERT INTO incidencia (descripcion, observaciones, no_lista_conductor) 
    VALUES ($1, $2, $3) 
    RETURNING id_incidencia`;
    const values = [descripcion, observaciones, no_lista]; // no_lista es el valor, no el nombre de la columna

    const { rows } = await pool.query(insertQuery, values);

    res.status(201).json({ message: "Incidencia creada", id: rows[0].id_incidencia });

  } catch (err) {
    console.error("Error al crear incidencia:", err);
    return res.status(500).json({ message: "Error interno.", error: err.message });
  }
});

// ✅ READ (todas las incidencias) - TRADUCIDO A PG (Con JOIN)
app.get("/incidencias", async (req, res) => {
  const { estado } = req.query; // 👈 NUEVO

  try {
    let where = '';
    const values = [];

    if (estado) {
      where = 'WHERE i.estado = $1';
      values.push(estado);
    }

    const sqlQuery = `
      SELECT 
        i.id_incidencia,
        COALESCE(i.descripcion, '')   AS descripcion,
        COALESCE(i.observaciones, '') AS observaciones,
        i.estado,
        i.no_lista_conductor,
        u.nombre,
        u.apellido_p
      FROM incidencia i
      LEFT JOIN usuario u ON i.no_lista_conductor = u.no_lista
      ${where}
      ORDER BY i.id_incidencia DESC
    `;

    const { rows } = await pool.query(sqlQuery, values);

    const incidenciasCompletas = rows.map(inc => {
      let nombreConductor = 'Sin asignar';
      if (inc.nombre) {
        try {
          nombreConductor = `${decrypt(inc.nombre)} ${decrypt(inc.apellido_p)}`;
        } catch {
          nombreConductor = 'Error de datos';
        }
      }

      return {
        id_incidencia: inc.id_incidencia,
        descripcion: inc.descripcion,
        observaciones: inc.observaciones,
        estado: inc.estado,
        no_lista: inc.no_lista_conductor,
        nombre_conductor: nombreConductor,
      };
    });

    res.json(incidenciasCompletas);

  } catch (error) {
    console.error("Error al obtener incidencias:", error);
    res.status(500).json({ error: error.message });
  }
});



// ✅ UPDATE (actualizar incidencia con conductor) - TRADUCIDO A PG
app.put("/incidencias/:id", async (req, res) => {
  const { id } = req.params;
  const { descripcion, observaciones, no_lista } = req.body;

  // Tu validación (queda igual)
  if (!descripcion || !no_lista) {
    return res.status(400).json({ message: "La descripción y el conductor son obligatorios." });
  }

  try {
    // --- CONSULTA 1: Validar el rol del conductor ---
    const userQuery = "SELECT rol FROM usuario WHERE no_lista = $1";
    const { rows: users } = await pool.query(userQuery, [no_lista]);

    if (users.length === 0 || users[0].rol !== 'Taxista') {
      return res.status(403).json({ message: "Operación no permitida: El usuario seleccionado no es un taxista." });
    }

    // --- CONSULTA 2: Actualizar la incidencia (CORREGIDO) ---
    const updateQuery = `UPDATE incidencia 
            SET descripcion = $1, observaciones = $2, no_lista_conductor = $3 
            WHERE id_incidencia = $4`;
    const values = [descripcion, observaciones, no_lista, id];

    await pool.query(updateQuery, values);

    res.json({ message: "Incidencia actualizada" });

  } catch (err) {
    console.error("Error al actualizar incidencia:", err);
    return res.status(500).json({ message: "Error interno.", error: err.message });
  }
});

// ✅ DELETE (eliminar incidencia) - TRADUCIDO A PG
app.delete("/incidencias/:id", async (req, res) => {
  const { id } = req.params;

  // 1. Define la consulta
  const sqlQuery = "DELETE FROM incidencia WHERE id_incidencia = $1";
  const values = [id];

  try {
    // 2. Ejecuta la consulta
    await pool.query(sqlQuery, values);
    res.json({ message: "Incidencia eliminada exitosamente" });

  } catch (error) {
    // ¡Perfecto! 'pg' también reporta el error '23503'
    // Así que tu lógica de error original funciona aquí.
    if (error.code === '23503') {
      return res.status(400).json({ message: "No se puede eliminar: la incidencia está en uso." });
    }
    console.error("Error al eliminar incidencia:", error);
    return res.status(500).json({ message: "Error interno.", error: error.message });
  }
});

app.post("/incidencias/:id/resolver", async (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;

  try {
    // 1️⃣ Crear acuerdo
    const acuerdoQuery = `
      INSERT INTO acuerdo (descripcion, id_incidencia)
      VALUES ($1, $2)
      RETURNING id_acuerdo
    `;
    const { rows } = await pool.query(acuerdoQuery, [
      descripcion || '',
      id
    ]);

    // 2️⃣ Marcar incidencia como RESUELTA
    await pool.query(
      "UPDATE incidencia SET estado = 'RESUELTA' WHERE id_incidencia = $1",
      [id]
    );

    res.json({
      message: "Incidencia resuelta",
      id_acuerdo: rows[0].id_acuerdo
    });

  } catch (err) {
    console.error("Error al resolver incidencia:", err);
    res.status(500).json({ message: "Error interno" });
  }
});

// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA ACUERDO
// ===============================================

// ✅ CREATE (insertar acuerdo) - TRADUCIDO A PG
app.post("/acuerdos", async (req, res) => {
  const { descripcion, id_incidencia } = req.body;

  // 1. Define la consulta
  const sqlQuery = `
        INSERT INTO acuerdo (descripcion, id_incidencia) 
        VALUES ($1, $2) 
        RETURNING id_acuerdo;
    `;
  const values = [descripcion, id_incidencia];

  try {
    // 2. Ejecuta la consulta
    const { rows } = await pool.query(sqlQuery, values);

    // 3. Devuelve la respuesta
    res.status(201).json({ message: "Acuerdo creado", id: rows[0].id_acuerdo });

  } catch (error) {
    console.error("Error al crear acuerdo:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ✅ READ (todos los acuerdos) - TRADUCIDO A PG
app.get("/acuerdos", async (req, res) => {
  // 1. Define la consulta con el JOIN
  //    Usamos 'AS' para renombrar la descripción de la incidencia
  const sqlQuery = `
        SELECT 
            a.id_acuerdo, a.descripcion, a.id_incidencia,
            i.descripcion AS incidencia_descripcion
        FROM acuerdo a
        LEFT JOIN incidencia i ON a.id_incidencia = i.id_incidencia
    `;

  try {
    // 2. Ejecuta la consulta
    const { rows } = await pool.query(sqlQuery);

    // 3. Mapea los resultados para que coincidan con la estructura de Supabase
    //    (Esto es opcional, pero mantiene la consistencia con tu código anterior)
    const data = rows.map(row => ({
      id_acuerdo: row.id_acuerdo,
      descripcion: row.descripcion,
      id_incidencia: row.id_incidencia,
      // Re-creamos el objeto anidado 'incidencia'
      incidencia: {
        descripcion: row.incidencia_descripcion
      }
    }));

    res.json(data);

  } catch (error) {
    console.error("Error al obtener acuerdos:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ✅ UPDATE (actualizar acuerdo) - TRADUCIDO A PG
app.put("/acuerdos/:id", async (req, res) => {
  const { id } = req.params;
  const { descripcion, id_incidencia } = req.body;

  // 1. Define la consulta
  const sqlQuery = `
        UPDATE acuerdo 
        SET descripcion = $1, id_incidencia = $2 
        WHERE id_acuerdo = $3
    `;
  const values = [descripcion, id_incidencia, id];

  try {
    // 2. Ejecuta la consulta
    await pool.query(sqlQuery, values);
    res.json({ message: "Acuerdo actualizado" });

  } catch (error) {
    console.error("Error al actualizar acuerdo:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ✅ DELETE (eliminar acuerdo) - TRADUCIDO A PG
app.delete("/acuerdos/:id", async (req, res) => {
  const { id } = req.params;

  // 1. Define la consulta
  const sqlQuery = "DELETE FROM acuerdo WHERE id_acuerdo = $1";
  const values = [id];

  try {
    // 2. Ejecuta la consulta
    await pool.query(sqlQuery, values);
    res.json({ message: "Acuerdo eliminado exitosamente" });

  } catch (error) {
    // 3. Tu lógica de error original funciona aquí (¡excelente!)
    if (error.code === '23503') {
      return res.status(400).json({ message: "No se puede eliminar: el acuerdo está en uso en un reporte." });
    }
    console.error("Error al eliminar acuerdo:", error);
    return res.status(500).json({ message: "Error interno.", error: error.message });
  }
});


// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA REPORTE
// ===============================================

// ✅ CREATE (insertar reporte) - TRADUCIDO A PG
app.post("/reportes", async (req, res) => {
  const { no_lista, economico, fecha_reporte, observaciones, id_incidencia, id_acuerdo } = req.body;

  // 1. Define la consulta
  const sqlQuery = `
        INSERT INTO reporte (no_lista, economico, fecha_reporte, observaciones, id_incidencia, id_acuerdo)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id_reporte;
    `;
  const values = [no_lista, economico, fecha_reporte, observaciones, id_incidencia, id_acuerdo];

  try {
    // 2. Ejecuta la consulta
    const { rows } = await pool.query(sqlQuery, values);

    // 3. Devuelve la respuesta
    res.status(201).json({ message: "Reporte creado", id: rows[0].id_reporte });

  } catch (error) {
    console.error("Error al crear reporte:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ✅ READ (todos los reportes) - TRADUCIDO A PG
app.get("/reportes", async (req, res) => {
  // 1. Define la consulta con todos los JOINs
  const sqlQuery = `
        SELECT 
            r.*, 
            u.nombre, u.apellido_p, 
            t.placa, 
            i.descripcion AS incidencia_descripcion,
            a.descripcion AS acuerdo_descripcion
        FROM reporte r
        LEFT JOIN usuario u ON r.no_lista = u.no_lista
        LEFT JOIN taxi t ON r.economico = t.economico
        LEFT JOIN incidencia i ON r.id_incidencia = i.id_incidencia
        LEFT JOIN acuerdo a ON r.id_acuerdo = a.id_acuerdo
    `;

  try {
    // 2. Ejecuta la consulta
    const { rows: data } = await pool.query(sqlQuery);

    // 3. Tu lógica de desencriptación (¡Funciona casi igual!)
    //    Solo cambiamos cómo accedemos a las propiedades
    const reportesDesencriptados = data.map(rep => {
      try {
        // Ya no es rep.usuario.nombre, sino rep.nombre
        const nombre = rep.nombre ? decrypt(rep.nombre) : null;
        const apellido = rep.apellido_p ? decrypt(rep.apellido_p) : null;

        return {
          id_reporte: rep.id_reporte,
          fecha_reporte: rep.fecha_reporte,
          observaciones: rep.observaciones,
          no_lista: rep.no_lista,
          economico: rep.economico,
          id_incidencia: rep.id_incidencia,
          id_acuerdo: rep.id_acuerdo,
          nombre_conductor: (nombre && apellido) ? `${nombre} ${apellido}` : "N/A",
          // Ya no es rep.taxi.placa, sino rep.placa
          placa_taxi: rep.placa ? decrypt(rep.placa) : "N/A",
          // Estos ya vienen con el nombre correcto gracias al 'AS' de SQL
          incidencia_descripcion: rep.incidencia_descripcion || "N/A",
          acuerdo_descripcion: rep.acuerdo_descripcion || "N/A"
        };
      } catch (e) {
        console.error(`Fallo al procesar datos para el reporte ${rep.id_reporte}:`, e);
        return { ...rep, nombre_conductor: 'Error', placa_taxi: 'Error' };
      }
    });

    res.json(reportesDesencriptados);

  } catch (error) {
    console.error("Error al obtener reportes:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ✅ UPDATE (actualizar reporte) - TRADUCIDO A PG
app.put("/reportes/:id", async (req, res) => {
  const { id } = req.params;
  const { no_lista, economico, fecha_reporte, observaciones, id_incidencia, id_acuerdo } = req.body;

  // 1. Define la consulta
  const sqlQuery = `
        UPDATE reporte
        SET no_lista = $1, economico = $2, fecha_reporte = $3, 
            observaciones = $4, id_incidencia = $5, id_acuerdo = $6
        WHERE id_reporte = $7
    `;
  const values = [no_lista, economico, fecha_reporte, observaciones, id_incidencia, id_acuerdo, id];

  try {
    // 2. Ejecuta la consulta
    await pool.query(sqlQuery, values);
    res.json({ message: "Reporte actualizado" });

  } catch (error) {
    console.error("Error al actualizar reporte:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ✅ DELETE (eliminar reporte) - TRADUCIDO A PG
app.delete("/reportes/:id", async (req, res) => {
  const { id } = req.params;

  // 1. Define la consulta
  const sqlQuery = "DELETE FROM reporte WHERE id_reporte = $1";
  const values = [id];

  try {
    // 2. Ejecuta la consulta
    await pool.query(sqlQuery, values);
    res.json({ message: "Reporte eliminado exitosamente" });

  } catch (error) {
    console.error("Error al eliminar reporte:", error);
    return res.status(500).json({ error: error.message });
  }
});


// ===============================================
// 🚀 ENDPOINTS ESPECIALIZADOS PARA TAXISTAS (CORREGIDOS)
// ===============================================

// ✅ GET (reportes de un taxista) - TRADUCIDO A PG
app.get("/reportes/taxista/:id", async (req, res) => {
  const taxistaId = req.params.id;

  // 1. Define la consulta
  //    Usamos LEFT JOINs para obtener los datos de taxi e incidencia
  const sqlQuery = `
        SELECT 
            r.id_reporte, r.fecha_reporte, r.observaciones,
            t.placa,
            i.descripcion AS incidencia_descripcion
        FROM reporte r
        LEFT JOIN taxi t ON r.economico = t.economico
        LEFT JOIN incidencia i ON r.id_incidencia = i.id_incidencia
        WHERE r.no_lista = $1;
    `;
  const values = [taxistaId];

  try {
    // 2. Ejecuta la consulta
    const { rows: data } = await pool.query(sqlQuery, values);

    // 3. Tu lógica de desencriptación (casi igual)
    const reportesDesencriptados = data.map(rep => {
      try {
        return {
          id_reporte: rep.id_reporte,
          fecha_reporte: rep.fecha_reporte,
          observaciones: rep.observaciones,
          // 'placa' ahora está al nivel de 'rep', no en 'rep.taxi'
          placa_taxi: rep.placa ? decrypt(rep.placa) : "N/A",
          // 'incidencia_descripcion' ya viene lista por el 'AS' de SQL
          incidencia_descripcion: rep.incidencia_descripcion || "N/A"
        };
      } catch (e) {
        console.error(`Fallo al desencriptar placa para reporte ${rep.id_reporte}:`, e);
        return { ...rep, placa_taxi: 'Error de datos' };
      }
    });
    res.json(reportesDesencriptados);

  } catch (error) {
    console.error("Error al obtener reportes del taxista:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ✅ GET (acuerdos de un taxista) - TRADUCIDO A PG (Más eficiente)
app.get("/acuerdos/taxista/:id", async (req, res) => {
  const taxistaId = req.params.id;

  try {
    // 1. Define la consulta
    //    Unimos 'acuerdo' con 'reporte' (para filtrar por taxista)
    //    y 'acuerdo' con 'incidencia' (para obtener la descripción)
    const sqlQuery = `
            SELECT DISTINCT
                a.id_acuerdo, a.descripcion, a.id_incidencia,
                i.descripcion AS incidencia_descripcion
            FROM acuerdo a
            JOIN reporte r ON a.id_acuerdo = r.id_acuerdo
            LEFT JOIN incidencia i ON a.id_incidencia = i.id_incidencia
            WHERE r.no_lista = $1;
        `;
    // 'DISTINCT' evita que salgan acuerdos duplicados si están en varios reportes
    const values = [taxistaId];

    // 2. Ejecuta la consulta
    const { rows: acuerdos } = await pool.query(sqlQuery, values);

    if (!acuerdos || acuerdos.length === 0) {
      return res.json([]); // Si no hay, devuelve array vacío
    }

    // 3. Mapea la respuesta (tu lógica ya estaba bien)
    const acuerdosFinales = acuerdos.map(ac => ({
      id_acuerdo: ac.id_acuerdo,
      descripcion: ac.descripcion,
      id_incidencia: ac.id_incidencia,
      incidencia_descripcion: ac.incidencia_descripcion || "N/A"
    }));

    res.json(acuerdosFinales);

  } catch (error) {
    console.error("Error al obtener acuerdos del taxista:", error);
    return res.status(500).json({ error: error.message });
  }
});


app.get("/prueba", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});



// ✅ ENDPOINT MAESTRO PARA EL DASHBOARD
app.get("/dashboard/analisis/:modulo", async (req, res) => {
  const { modulo } = req.params;
  let sqlQuery = "";

  try {
    switch (modulo) {
      case "ingresos_top":
        sqlQuery = `
          SELECT u.no_lista, u.nombre, SUM(i.monto) as total_ingreso
          FROM ingresos i
          JOIN usuario u ON i.no_lista = u.no_lista
          WHERE i.fecha >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY u.no_lista, u.nombre
          ORDER BY total_ingreso DESC LIMIT 5`;
        break;

      case "choferes_reportados":
        sqlQuery = `
          SELECT u.nombre, COUNT(r.id_reporte) as total_reportes
          FROM reporte r
          JOIN usuario u ON r.no_lista = u.no_lista
          WHERE r.fecha_reporte >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY u.nombre
          ORDER BY total_reportes DESC LIMIT 5`;
        break;

      case "resumen_30_dias":
        sqlQuery = `
          SELECT 
            (SELECT COUNT(*) FROM reporte WHERE fecha_reporte >= CURRENT_DATE - INTERVAL '30 days') as total_reportes,
            (SELECT COUNT(*) FROM usuario WHERE rol = 'Taxista') as total_taxistas,
            (SELECT COUNT(*) FROM taxi) as total_taxis`;
        break;

      // En tu server.js, actualiza el caso del dashboard:
      case "ingresos_top":
        sqlQuery = `
          SELECT u.nombre, 
                SUM(i.monto) as total_ingreso, 
                SUM(i.kilometraje_recorrido) as total_km,
                (SUM(i.monto) / NULLIF(SUM(i.kilometraje_recorrido), 0)) as eficiencia
          FROM ingresos i
          JOIN usuario u ON i.no_lista = u.no_lista
          WHERE i.fecha >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY u.nombre
          ORDER BY total_ingreso DESC`;
        break;

      default:
        return res.status(400).json({ message: "Módulo no válido" });
    }

    const { rows } = await pool.query(sqlQuery);

    // Desencriptar nombres si es necesario antes de enviar
    const dataDesencriptada = rows.map(row => ({
      ...row,
      nombre: row.nombre ? decrypt(row.nombre) : row.nombre
    }));

    res.json(dataDesencriptada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/ingresos", async (req, res) => {
  try {
    const { no_lista, kilometraje_recorrido, numero_viajes, fecha } = req.body;

    if (!no_lista || !kilometraje_recorrido || !numero_viajes || !fecha) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // 🔐 TARIFA FIJA POR KM (MXN)
    const TARIFA_REAL = 25;
    const monto = kilometraje_recorrido * TARIFA_REAL;

    // 🔹 Convertir fecha a objeto
    const fechaObj = new Date(fecha);
    const anio = fechaObj.getFullYear();
    const mes = fechaObj.getMonth() + 1; // getMonth() va de 0 a 11

    // 🔍 Verificar si ya hay registro del mismo mes
    const checkQuery = `
      SELECT id_ingreso
      FROM ingresos
      WHERE no_lista = $1
      AND anio = $2
      AND mes = $3
    `;

    const checkResult = await pool.query(checkQuery, [no_lista, anio, mes]);

    if (checkResult.rows.length > 0) {
      // 🔄 Si ya existe → actualizar acumulando valores
      const updateQuery = `
        UPDATE ingresos
        SET
          numero_viajes = numero_viajes + $1,
          kilometraje_recorrido = kilometraje_recorrido + $2,
          monto = monto + $3
        WHERE id_ingreso = $4
        RETURNING *
      `;

      const { rows } = await pool.query(updateQuery, [
        numero_viajes,
        kilometraje_recorrido,
        monto,
        checkResult.rows[0].id_ingreso,
      ]);

      return res.json(rows[0]);
    }

    // ➕ Si no existe → insertar nuevo registro
    const insertQuery = `
      INSERT INTO ingresos (
        no_lista,
        monto,
        numero_viajes,
        fecha,
        kilometraje_recorrido,
        tarifa_aplicada,
        anio,
        mes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const { rows } = await pool.query(insertQuery, [
      no_lista,
      monto,
      numero_viajes,
      fechaObj,
      kilometraje_recorrido,
      TARIFA_REAL,
      anio,
      mes,
    ]);

    res.json(rows[0]);

  } catch (error) {
    console.error("Error al guardar ingresos:", error);
    res.status(500).json({ error: error.message });
  }
});



app.get("/ingresos/taxista/:id", async (req, res) => {
  const taxistaId = req.params.id;
  const { mes, anio } = req.query;

  try {
    const query = `
      SELECT
        COALESCE(SUM(numero_viajes), 0) AS total_viajes,
        COALESCE(SUM(monto), 0) AS ingresos_totales,
        COALESCE(SUM(kilometraje_recorrido), 0) AS km_totales
      FROM ingresos
      WHERE no_lista = $1
      AND EXTRACT(MONTH FROM fecha) = $2
      AND EXTRACT(YEAR FROM fecha) = $3
    `;

    const values = [taxistaId, mes, anio];
    const { rows } = await pool.query(query, values);

    res.json(rows[0]);

  } catch (error) {
    console.error("Error al obtener resumen de ingresos:", error);
    res.status(500).json({ error: error.message });
  }
});



// ===============================================
// 🚀 SERVIDOR (VERSIÓN CORREGIDA PARA DESPLIEGUE)
// ===============================================

// 1. Obtiene el puerto que la plataforma nos da. Si no existe (en tu compu), usa el 3000.
const PORT = process.env.PORT || 3000;

// 2. Le decimos a Express que escuche en ese puerto y en la dirección 0.0.0.0
//    '0.0.0.0' es crucial para que acepte conexiones dentro del entorno de Railway/Render.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});

