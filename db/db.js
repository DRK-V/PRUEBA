// Importamos el cliente de Supabase
const { createClient } = require('@supabase/supabase-js');

// Cargamos las variables de entorno
require('dotenv').config();

// Creamos el cliente de Supabase usando las credenciales desde el archivo .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Creamos el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Exportamos el cliente para usarlo en otras partes de la aplicación
module.exports = supabase;
