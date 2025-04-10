const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Verificando variables de entorno:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_USER:', process.env.DB_USER);
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '[CONFIGURADA]' : '[NO CONFIGURADA]');
console.log('- DB_NAME:', process.env.DB_NAME);
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '[CONFIGURADA]' : '[NO CONFIGURADA]');
console.log('- DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '[CONFIGURADA]' : '[NO CONFIGURADA]');

if (process.env.DEEPSEEK_API_KEY) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  console.log(`- DEEPSEEK_API_KEY (masked): ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`- DEEPSEEK_API_KEY length: ${apiKey.length} characters`);
}

// Verificar la ruta del archivo .env
console.log('\nRuta del archivo .env:');
console.log(path.resolve(__dirname, '.env'));

// Intentar leer el archivo .env directamente
const fs = require('fs');
try {
  const envContent = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
  console.log('\nContenido del archivo .env:');
  console.log(envContent.replace(/DEEPSEEK_API_KEY=.+/g, 'DEEPSEEK_API_KEY=[REDACTED]'));
} catch (error) {
  console.error('\nError al leer el archivo .env:', error.message);
}
