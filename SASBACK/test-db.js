const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  console.log('Probando conexión a la base de datos...');
  console.log('Configuración:');
  console.log('- Host:', process.env.DB_HOST || 'localhost');
  console.log('- Usuario:', process.env.DB_USER || 'root');
  console.log('- Contraseña:', process.env.DB_PASSWORD ? '[CONFIGURADA]' : '[NO CONFIGURADA]');
  console.log('- Base de datos:', process.env.DB_NAME || 'sas2');
  
  // Intentar con la configuración del .env
  try {
    console.log('\nIntentando conexión con variables de entorno...');
    const pool1 = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });
    
    const [rows1] = await pool1.query('SELECT 1 as result');
    console.log('✅ Conexión exitosa con variables de entorno:', rows1[0].result);
    await pool1.end();
  } catch (error1) {
    console.error('❌ Error con variables de entorno:', error1.message);
    
    // Intentar con contraseña hardcoded
    try {
      console.log('\nIntentando conexión con contraseña "root"...');
      const pool2 = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'root',
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0
      });
      
      const [rows2] = await pool2.query('SELECT 1 as result');
      console.log('✅ Conexión exitosa con contraseña "root":', rows2[0].result);
      
      // Intentar crear la base de datos
      try {
        console.log('\nIntentando crear la base de datos "sas2" si no existe...');
        await pool2.query('CREATE DATABASE IF NOT EXISTS sas2');
        console.log('✅ Base de datos creada o ya existente');
        
        // Probar la conexión a la base de datos específica
        await pool2.query('USE sas2');
        const [rows3] = await pool2.query('SELECT NOW() as now');
        console.log('✅ Conexión a la base de datos "sas2" exitosa:', rows3[0].now);
      } catch (error3) {
        console.error('❌ Error al crear o conectar a la base de datos:', error3.message);
      }
      
      await pool2.end();
    } catch (error2) {
      console.error('❌ Error con contraseña "root":', error2.message);
      
      // Intentar sin contraseña
      try {
        console.log('\nIntentando conexión sin contraseña...');
        const pool3 = mysql.createPool({
          host: 'localhost',
          user: 'root',
          password: '',
          waitForConnections: true,
          connectionLimit: 1,
          queueLimit: 0
        });
        
        const [rows3] = await pool3.query('SELECT 1 as result');
        console.log('✅ Conexión exitosa sin contraseña:', rows3[0].result);
        await pool3.end();
      } catch (error3) {
        console.error('❌ Error sin contraseña:', error3.message);
      }
    }
  }
}

testDatabaseConnection()
  .then(() => {
    console.log('\nPrueba de conexión completada.');
  })
  .catch(err => {
    console.error('Error inesperado:', err);
  });
