import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { supabase } from "./supabaseClient.js";
import { encrypt, decrypt } from './crypto-utils.js';

const app = express();
app.use(cors());
app.use(express.json());

const saltRounds = 10;

// ===============================================
// 🚀 ENDPOINT PARA INICIO DE SESIÓN (LOGIN)
// ===============================================
app.post("/login", async (req, res) => {
  const { no_lista, contrasena } = req.body;

  const { data: results, error: dbError } = await supabase
    .from('usuario')
    .select('no_lista, rol, nombre, apellido_p, contrasena')
    .eq('no_lista', no_lista);

  if (dbError) {
    console.error("Error de base de datos durante el login:", dbError);
    return res.status(500).json({ message: "Error interno del servidor." });
  }

  if (!results || results.length === 0) {
    return res.status(401).json({ message: "Usuario o Contraseña incorrectos." });
  }

  const usuario = results[0];
  const hashedPasswordFromDB = usuario.contrasena;

  try {
    const match = await bcrypt.compare(contrasena, hashedPasswordFromDB);

    if (match) {
      const usuarioDesencriptado = {
        no_lista: usuario.no_lista,
        rol: usuario.rol,
        nombre: decrypt(usuario.nombre),
        // ✨ CORREGIDO A MINÚSCULA
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
    console.error("Error al procesar login:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA USUARIO
// ===============================================

// ✅ CREATE (insertar usuario) - CON VALIDACIÓN
app.post("/usuarios", async (req, res) => {
  const { rol, contrasena, nombre, apellido_p, apellido_m, edad, fecha_de_nacimiento } = req.body;

  // ✨ --- VALIDACIÓN AÑADIDA --- ✨
  // Comprobamos que todos los campos requeridos existan
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
      apellido_m: apellido_m ? encrypt(apellido_m) : encrypt(''),
      edad: encrypt(edad.toString()),
      fecha_de_nacimiento: encrypt(fecha_de_nacimiento)
    };

    const { data, error } = await supabase.from('usuario').insert([encryptedData]).select();
    
    if (error) throw error;
    
    res.status(201).json({ message: "Usuario creado exitosamente", usuario: data[0] });

  } catch (err) {
    console.error("Error al crear usuario:", err);
    return res.status(500).json({ message: "Error interno del servidor.", error: err.message });
  }
});


// ✅ READ (todos los usuarios)
app.get("/usuarios", async (req, res) => {
    // ... (Este endpoint ya estaba corregido y se mantiene igual)
    const { data: results, error: err } = await supabase.from('usuario').select('no_lista, rol, nombre, apellido_p, apellido_m, edad, fecha_de_nacimiento');
    if (err) { console.error("Error al obtener usuarios:", err); return res.status(500).json({ error: err.message }); }
    const usuariosDesencriptados = results.map(user => {
        try { return { no_lista: user.no_lista, rol: user.rol, nombre: decrypt(user.nombre), apellido_p: decrypt(user.apellido_p), apellido_m: decrypt(user.apellido_m), edad: parseInt(decrypt(user.edad), 10), fecha_de_nacimiento: decrypt(user.fecha_de_nacimiento) }; }
        catch (e) { console.error(`Fallo al desencriptar datos para el usuario ${user.no_lista}:`, e); return { ...user, nombre: 'Error de datos' }; }
    });
    res.json(usuariosDesencriptados);
});

// ✅ GET (obtener SOLO usuarios con rol de 'Taxista') - VERSIÓN MÁS SEGURA
app.get("/usuarios/taxistas", async (req, res) => {
  const { data, error } = await supabase
    .from('usuario')
    .select('no_lista, rol, nombre, apellido_p')
    .ilike('rol', 'taxista');

  if (error) {
    console.error("Error al obtener taxistas:", error);
    return res.status(500).json({ error: error.message });
  }
  
  const taxistasDesencriptados = data.map(user => {
    try {
      // ✨ AÑADIMOS VALIDACIÓN ANTES DE DESENCRIPTAR
      // Si el campo es nulo, usamos un string vacío en su lugar.
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
});



// ✅ READ (usuario por id) - MIGRADO Y CORREGIDO
app.get("/usuarios/:id", async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('usuario')
      .select('no_lista, rol, nombre, apellido_p, apellido_m, edad, fecha_de_nacimiento')
      .eq('no_lista', id)
      .single(); // .single() espera un solo resultado o da error

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ message: "Usuario no encontrado" });
    
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
    } catch(e) {
      console.error(`Fallo al desencriptar datos para el usuario ${id}:`, e);
      return res.status(500).json({ message: "Error al procesar los datos del usuario." });
    }
});



// ✅ UPDATE (actualizar usuario) - MIGRADO Y CORREGIDO
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { rol, contrasena, nombre, apellido_p, apellido_m, edad, fecha_de_nacimiento } = req.body;

  try {
    const updates = {
      rol,
      nombre: encrypt(nombre),
      apellido_p: encrypt(apellido_p),
      apellido_m: encrypt(apellido_m || ''),
      edad: encrypt(edad.toString()),
      fecha_de_nacimiento: encrypt(fecha_de_nacimiento)
    };

    if (contrasena) {
      updates.contrasena = await bcrypt.hash(contrasena, saltRounds);
    }

    const { data, error } = await supabase.from('usuario').update(updates).eq('no_lista', id);
    
    if (error) throw error;
    res.json({ message: "Usuario actualizado" });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
});

// ✅ DELETE (eliminar usuario) - MIGRADO
app.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('usuario').delete().eq('no_lista', id);

  if (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
  res.json({ message: "Usuario eliminado exitosamente" });
});


// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA TAXI
// ===============================================

// ✅ CREATE (insertar taxi) - CORREGIDO
app.post("/taxis", async (req, res) => {
    // ✨ Corregido de 'ano' a 'año'
    const { marca, modelo, año, placa, no_lista } = req.body;
    try {
        const { data: user, error: userError } = await supabase.from('usuario').select('rol').eq('no_lista', no_lista).single();
        if (userError || !user || user.rol !== 'Taxista') {
            return res.status(403).json({ message: "Operación no permitida: El conductor no es un taxista." });
        }
        // ✨ Corregido de 'ano' a 'año'
        const taxiData = { marca, modelo, año, placa: encrypt(placa), no_lista };
        const { data, error } = await supabase.from('taxi').insert([taxiData]).select().single();
        if (error) throw error;
        res.status(201).json({ message: "Taxi creado exitosamente", id: data.economico });
    } catch (err) {
        console.error("Error al crear taxi:", err);
        return res.status(500).json({ message: "Error interno del servidor.", error: err.message });
    }
});
// server.js

// ✅ READ (todos los taxis) - CORREGIDO
app.get("/taxis", async (req, res) => {
    const { data, error } = await supabase
      .from('taxi')
      // ✨ Corregido de 'ano' a 'año'
      .select(`economico, marca, modelo, año, placa, no_lista, usuario (nombre, apellido_p)`);

    if (error) {
      console.error("Error al obtener taxis:", error); // Imprime el error real
      return res.status(500).json({ error: error.message });
    }
      
    const taxisDesencriptados = data.map(taxi => {
      try {
        const nombre = taxi.usuario ? decrypt(taxi.usuario.nombre) : null;
        const apellido = taxi.usuario ? decrypt(taxi.usuario.apellido_p) : null;
        return {
          economico: taxi.economico, marca: taxi.marca, modelo: taxi.modelo, 
          año: taxi.año, // ✨ Corregido
          placa: decrypt(taxi.placa), no_lista: taxi.no_lista,
          nombre_conductor: (nombre && apellido) ? `${nombre} ${apellido}` : "Sin asignar"
        };
      } catch (e) {
        return { ...taxi, placa: 'Error de datos', nombre_conductor: 'Error de datos' };
      }
    });
    res.json(taxisDesencriptados);
});

// ✅ DELETE (eliminar taxi) - MIGRADO
app.delete("/taxis/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('taxi').delete().eq('economico', id);
    if (error) return res.status(500).json({ message: "Error interno.", error: error.message });
    res.json({ message: "Taxi eliminado exitosamente" });
});

// ✅ UPDATE (actualizar taxi) - CORREGIDO
app.put("/taxis/:id", async (req, res) => {
    const { id } = req.params;
    // ✨ Corregido de 'ano' a 'año'
    const { marca, modelo, año, placa, no_lista } = req.body;
    try {
        const { data: user, error: userError } = await supabase.from('usuario').select('rol').eq('no_lista', no_lista).single();
        if (userError || !user || user.rol !== 'Taxista') {
            return res.status(403).json({ message: "Operación no permitida: El conductor no es un taxista." });
        }
        // ✨ Corregido de 'ano' a 'año'
        const updates = { marca, modelo, año, no_lista, placa: encrypt(placa) };
        const { error } = await supabase.from('taxi').update(updates).eq('economico', id);
        if (error) throw error;
        res.json({ message: "Taxi actualizado exitosamente" });
    } catch (err) {
        console.error("Error al actualizar taxi:", err);
        return res.status(500).json({ message: "Error interno del servidor.", error: err.message });
    }
});

// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA INCIDENCIA (CORREGIDOS)
// ===============================================

// ✅ CREATE (insertar incidencia con conductor)
app.post("/incidencias", async (req, res) => {
    // ✨ Usamos minúsculas y recibimos no_lista
    const { descripcion, observaciones, no_lista } = req.body; 

    if (!descripcion || !no_lista) {
        return res.status(400).json({ message: "La descripción y el conductor son obligatorios." });
    }

    try {
        // Verificamos que el usuario sea un taxista
        const { data: user, error: userError } = await supabase.from('usuario').select('rol').eq('no_lista', no_lista).single();
        if (userError || !user || user.rol !== 'Taxista') {
            return res.status(403).json({ message: "Operación no permitida: El usuario seleccionado no es un taxista." });
        }
        
        const { data, error } = await supabase.from('incidencia').insert([{ descripcion, observaciones, no_lista }]).select().single();
        if (error) throw error;
        res.status(201).json({ message: "Incidencia creada", id: data.id_incidencia });

    } catch (err) {
        console.error("Error al crear incidencia:", err);
        return res.status(500).json({ message: "Error interno.", error: err.message });
    }
});

// ✅ READ (todas las incidencias) - VERSIÓN CON "JOIN MANUAL" A PRUEBA DE FALLOS
app.get("/incidencias", async (req, res) => {
    try {
        // --- PASO 1: Obtener todas las incidencias ---
        const { data: incidencias, error: incidenciasError } = await supabase
            .from('incidencia')
            .select('*');

        if (incidenciasError) throw incidenciasError;
        if (!incidencias || incidencias.length === 0) {
            return res.json([]); // Si no hay incidencias, devuelve un array vacío
        }

        // --- PASO 2: Obtener solo los usuarios necesarios ---
        const idsDeUsuarios = [...new Set(incidencias.map(inc => inc.no_lista).filter(id => id))];
        
        let usuariosMap = new Map();
        if (idsDeUsuarios.length > 0) {
            const { data: usuarios, error: usuariosError } = await supabase
                .from('usuario')
                .select('no_lista, nombre, apellido_p')
                .in('no_lista', idsDeUsuarios);

            if (usuariosError) throw usuariosError;
            usuarios.forEach(u => usuariosMap.set(u.no_lista, u));
        }

        // --- PASO 3: Combinar los datos en JavaScript ---
        const incidenciasCompletas = incidencias.map(inc => {
            const usuario = usuariosMap.get(inc.no_lista);
            let nombreConductor = 'Sin asignar';

            if (usuario) {
                try {
                    const nombre = decrypt(usuario.nombre);
                    const apellido = decrypt(usuario.apellido_p);
                    nombreConductor = `${nombre} ${apellido}`;
                } catch (e) {
                    console.error(`Fallo al desencriptar datos para la incidencia ${inc.id_incidencia}:`, e);
                    nombreConductor = 'Error de datos';
                }
            }

            return {
                id_incidencia: inc.id_incidencia,
                descripcion: inc.descripcion,
                observaciones: inc.observaciones,
                no_lista: inc.no_lista,
                nombre_conductor: nombreConductor,
            };
        });

        res.json(incidenciasCompletas);

    } catch (error) {
        // Este console.error sí es bueno dejarlo para registrar errores reales
        console.error("Error al obtener incidencias:", error);
        return res.status(500).json({ error: error.message });
    }
});

// ✅ UPDATE (actualizar incidencia con conductor)
app.put("/incidencias/:id", async (req, res) => {
    const { id } = req.params;
    const { descripcion, observaciones, no_lista } = req.body; 

    if (!descripcion || !no_lista) {
         return res.status(400).json({ message: "La descripción y el conductor son obligatorios." });
    }

    try {
        const { data: user, error: userError } = await supabase.from('usuario').select('rol').eq('no_lista', no_lista).single();
        if (userError || !user || user.rol !== 'Taxista') {
            return res.status(403).json({ message: "Operación no permitida: El usuario seleccionado no es un taxista." });
        }

        const { error } = await supabase.from('incidencia').update({ descripcion, observaciones, no_lista }).eq('id_incidencia', id);
        if (error) throw error;
        res.json({ message: "Incidencia actualizada" });

    } catch (err) {
         console.error("Error al actualizar incidencia:", err);
         return res.status(500).json({ message: "Error interno.", error: err.message });
    }
});

// ✅ DELETE (eliminar incidencia) - Sin cambios necesarios aquí
app.delete("/incidencias/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('incidencia').delete().eq('id_incidencia', id);
    if (error) {
        if (error.code === '23503') {
            return res.status(400).json({ message: "No se puede eliminar: la incidencia está en uso." });
        }
        return res.status(500).json({ message: "Error interno.", error: error.message });
    }
    res.json({ message: "Incidencia eliminada exitosamente" });
});
// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA ACUERDO
// ===============================================

// ✅ CREATE (insertar acuerdo) - MIGRADO
app.post("/acuerdos", async (req, res) => {
    const { descripcion, id_incidencia } = req.body;
    const { data, error } = await supabase.from('acuerdo').insert([{ descripcion, id_incidencia }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ message: "Acuerdo creado", id: data.id_acuerdo });
});

// ✅ READ (todos los acuerdos) - MIGRADO
app.get("/acuerdos", async (req, res) => {
    const { data, error } = await supabase.from('acuerdo').select('*, incidencia(descripcion)');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// ✅ UPDATE (actualizar acuerdo) - MIGRADO
app.put("/acuerdos/:id", async (req, res) => {
    const { id } = req.params;
    const { descripcion, id_incidencia } = req.body;
    const { error } = await supabase.from('acuerdo').update({ descripcion, id_incidencia }).eq('id_acuerdo', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Acuerdo actualizado" });
});

// ✅ DELETE (eliminar acuerdo) - MIGRADO Y CORREGIDO
app.delete("/acuerdos/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('acuerdo').delete().eq('id_acuerdo', id);
    if (error) {
        if (error.code === '23503') {
            return res.status(400).json({ message: "No se puede eliminar: el acuerdo está en uso en un reporte." });
        }
        return res.status(500).json({ message: "Error interno.", error: error.message });
    }
    res.json({ message: "Acuerdo eliminado exitosamente" });
});


// ===============================================
// 🚀 ENDPOINTS PARA LA TABLA REPORTE
// ===============================================

// ✅ CREATE (insertar reporte) - MIGRADO
app.post("/reportes", async (req, res) => {
    const { no_lista, economico, fecha_reporte, observaciones, id_incidencia, id_acuerdo } = req.body;
    const { data, error } = await supabase.from('reporte').insert([{ no_lista, economico, fecha_reporte, observaciones, id_incidencia, id_acuerdo }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ message: "Reporte creado", id: data.id_reporte });
});

app.get("/reportes", async (req, res) => {
    // Usamos la sintaxis explícita para asegurar que los joins funcionen
    const { data, error } = await supabase.from('reporte')
      .select(`*, 
               usuario!no_lista(nombre, apellido_p), 
               taxi!economico(placa), 
               incidencia!id_incidencia(descripcion), 
               acuerdo!id_acuerdo(descripcion)`);
      
    if (error) {
        console.error("Error al obtener reportes:", error);
        return res.status(500).json({ error: error.message });
    }

    const reportesDesencriptados = data.map(rep => {
      try {
        const nombre = rep.usuario ? decrypt(rep.usuario.nombre) : null;
        const apellido = rep.usuario ? decrypt(rep.usuario.apellido_p) : null;
        
        return {
          id_reporte: rep.id_reporte,
          fecha_reporte: rep.fecha_reporte,
          observaciones: rep.observaciones,
          no_lista: rep.no_lista,
          economico: rep.economico,
          id_incidencia: rep.id_incidencia,
          id_acuerdo: rep.id_acuerdo,
          nombre_conductor: (nombre && apellido) ? `${nombre} ${apellido}` : "N/A",
          placa_taxi: rep.taxi ? decrypt(rep.taxi.placa) : "N/A",
          incidencia_descripcion: rep.incidencia ? rep.incidencia.descripcion : "N/A",
          acuerdo_descripcion: rep.acuerdo ? rep.acuerdo.descripcion : "N/A"
        };
      } catch (e) {
        console.error(`Fallo al procesar datos para el reporte ${rep.id_reporte}:`, e);
        return { ...rep, nombre_conductor: 'Error', placa_taxi: 'Error' };
      }
    });

    res.json(reportesDesencriptados);
});

// ✅ UPDATE (actualizar reporte) - MIGRADO
app.put("/reportes/:id", async (req, res) => {
    const { id } = req.params;
    const { no_lista, economico, fecha_reporte, observaciones, id_incidencia, id_acuerdo } = req.body;
    const { error } = await supabase.from('reporte').update({ no_lista, economico, fecha_reporte, observaciones, id_incidencia, id_acuerdo }).eq('id_reporte', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Reporte actualizado" });
});

// ✅ DELETE (eliminar reporte) - MIGRADO
app.delete("/reportes/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('reporte').delete().eq('id_reporte', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Reporte eliminado exitosamente" });
});


// ===============================================
// 🚀 ENDPOINTS ESPECIALIZADOS PARA TAXISTAS (CORREGIDOS)
// ===============================================

// ✅ GET (reportes de un taxista) - CON JOIN EXPLÍCITO Y MINÚSCULAS
app.get("/reportes/taxista/:id", async (req, res) => {
    const taxistaId = req.params.id;
    const { data, error } = await supabase.from('reporte')
      // ✨ Usamos JOIN explícito y minúsculas
      .select(`id_reporte, fecha_reporte, observaciones, 
               taxi!economico(placa), 
               incidencia!id_incidencia(descripcion)`)
      .eq('no_lista', taxistaId);
      
    if (error) {
        console.error("Error al obtener reportes del taxista:", error);
        return res.status(500).json({ error: error.message });
    }

    const reportesDesencriptados = data.map(rep => {
        try {
            return {
                id_reporte: rep.id_reporte,
                fecha_reporte: rep.fecha_reporte,
                observaciones: rep.observaciones, // ✨ Minúscula
                // ✨ Usamos minúscula y validamos que 'taxi' exista
                placa_taxi: rep.taxi ? decrypt(rep.taxi.placa) : "N/A", 
                // ✨ Usamos minúscula y validamos que 'incidencia' exista
                incidencia_descripcion: rep.incidencia ? rep.incidencia.descripcion : "N/A" 
            };
        } catch (e) {
            console.error(`Fallo al desencriptar placa para reporte ${rep.id_reporte}:`, e);
            return { ...rep, placa_taxi: 'Error de datos' };
        }
    });
    res.json(reportesDesencriptados);
});

// ✅ GET (acuerdos de un taxista) - CON JOIN EXPLÍCITO Y MINÚSCULAS
app.get("/acuerdos/taxista/:id", async (req, res) => {
    const taxistaId = req.params.id;
    try {
        // 1. Obtener los reportes del taxista que tengan un acuerdo asociado
        const { data: reportes, error: reportesError } = await supabase
            .from('reporte')
            .select('id_acuerdo')
            .eq('no_lista', taxistaId)
            .not('id_acuerdo', 'is', null); // Solo reportes con acuerdo

        if (reportesError) throw reportesError;
        if (!reportes || reportes.length === 0) return res.json([]); // Si no hay, devuelve array vacío

        // 2. Obtener los acuerdos correspondientes usando JOIN explícito
        const acuerdoIds = reportes.map(r => r.id_acuerdo);
        const { data: acuerdos, error: acuerdosError } = await supabase
            .from('acuerdo')
             // ✨ Usamos JOIN explícito y minúsculas
            .select('*, incidencia!id_incidencia(descripcion)') 
            .in('id_acuerdo', acuerdoIds);

        if (acuerdosError) throw acuerdosError;
        
        // ✨ Devolvemos los datos con la clave en minúscula
        const acuerdosFinales = acuerdos.map(ac => ({
            id_acuerdo: ac.id_acuerdo,
            descripcion: ac.descripcion, // ✨ Minúscula
            id_incidencia: ac.id_incidencia,
             // ✨ Usamos minúscula y validamos que 'incidencia' exista
            incidencia_descripcion: ac.incidencia ? ac.incidencia.descripcion : "N/A" 
        }));

        res.json(acuerdosFinales);

    } catch (error) {
         console.error("Error al obtener acuerdos del taxista:", error);
         return res.status(500).json({ error: error.message });
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