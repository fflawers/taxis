// db.js
import pg from 'pg';
import 'dotenv/config'; // Carga las variables del .env automáticamente

const { Pool } = pg;

// Crea el "pool" de conexiones usando las variables del .env
const pool = new Pool({
   host: process.env.DB_HOST,
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

// Exportamos el pool para usarlo en server.js
export default pool;