import mysql from 'mysql2/promise'; // Usamos la versión con promesas para que sea más fácil
import { encrypt, decrypt } from './crypto-utils.js';

// Configuración de la base de datos (la misma de tu server.js)
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Trol334455.", // Tu contraseña
  database: "EJEMPLO1"
};

async function migrateUsers() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Conectado a la base de datos para migración.');

    // 1. Obtener todos los usuarios
    const [users] = await connection.execute('SELECT * FROM Usuario');
    console.log(`Se encontraron ${users.length} usuarios.`);

    for (const user of users) {
      // 2. Revisar si el nombre ya está encriptado (si no contiene ':')
      if (user.nombre && !user.nombre.includes(':')) {
        console.log(`Migrando datos para el usuario con no_lista: ${user.no_lista} (${user.nombre})...`);

        // 3. Encriptar los campos que no lo estén
        const updatedData = {
          nombre: encrypt(user.nombre),
          apellido_P: encrypt(user.apellido_P),
          apellido_M: user.apellido_M ? encrypt(user.apellido_M) : encrypt(''),
          Edad: encrypt(user.Edad.toString()),
          Fecha_de_nacimiento: encrypt(user.Fecha_de_nacimiento)
        };

        // 4. Actualizar el registro en la base de datos
        const sql = `
          UPDATE Usuario 
          SET nombre = ?, apellido_P = ?, apellido_M = ?, Edad = ?, Fecha_de_nacimiento = ?
          WHERE no_lista = ?
        `;
        await connection.execute(sql, [
          updatedData.nombre,
          updatedData.apellido_P,
          updatedData.apellido_M,
          updatedData.Edad,
          updatedData.Fecha_de_nacimiento,
          user.no_lista
        ]);
        console.log(`✅ Usuario ${user.no_lista} actualizado.`);
      } else {
        console.log(`El usuario ${user.no_lista} ya está encriptado, se omite.`);
      }
    }

    console.log('¡Migración completada!');
  } catch (error) {
    console.error('Ocurrió un error durante la migración:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión cerrada.');
    }
  }
}

migrateUsers();