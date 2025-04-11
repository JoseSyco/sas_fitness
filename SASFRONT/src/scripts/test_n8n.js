/**
 * Script para probar la conexión con n8n
 * 
 * Para ejecutar:
 * node src/scripts/test_n8n.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URL del webhook de n8n
const N8N_WEBHOOK_URL = 'https://n8n.synapticalhub.com/webhook/sas';

// Cargar datos de prueba
const testPayloadPath = path.join(__dirname, '../data/n8n_test_payload.json');
const testPayload = JSON.parse(fs.readFileSync(testPayloadPath, 'utf8'));

console.log('Enviando solicitud POST a:', N8N_WEBHOOK_URL);
console.log('Datos de la solicitud:', JSON.stringify(testPayload, null, 2));

// Enviar solicitud POST a n8n
axios.post(N8N_WEBHOOK_URL, testPayload, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000 // 30 segundos de timeout
})
.then(response => {
  console.log('Respuesta recibida:');
  console.log('Status:', response.status);
  console.log('Headers:', JSON.stringify(response.headers, null, 2));
  console.log('Data:', JSON.stringify(response.data, null, 2));
})
.catch(error => {
  console.error('Error al enviar la solicitud:');
  if (error.response) {
    // La solicitud fue realizada y el servidor respondió con un código de estado
    // que cae fuera del rango 2xx
    console.error('Datos de respuesta:', error.response.data);
    console.error('Status:', error.response.status);
    console.error('Headers:', error.response.headers);
  } else if (error.request) {
    // La solicitud fue realizada pero no se recibió respuesta
    console.error('No se recibió respuesta:', error.request);
  } else {
    // Algo ocurrió al configurar la solicitud que desencadenó un error
    console.error('Error de configuración:', error.message);
  }
  console.error('Config:', error.config);
});
