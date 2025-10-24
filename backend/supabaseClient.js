// supabaseClient.js

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config' // Carga las variables del .env

// Obtenemos las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Creamos y exportamos el cliente de Supabase
// MUY IMPORTANTE: Especificamos el esquema 'ejemplo1' que creaste.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public' 
  }
});