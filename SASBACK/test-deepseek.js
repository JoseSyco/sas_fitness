require('dotenv').config();
const axios = require('axios');

// Función para probar la API de DeepSeek
async function testDeepseekAPI() {
  console.log('Probando conexión con DeepSeek API...');
  console.log(`API Key: ${process.env.DEEPSEEK_API_KEY.substring(0, 5)}...${process.env.DEEPSEEK_API_KEY.substring(process.env.DEEPSEEK_API_KEY.length - 4)}`);
  
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Eres un asistente útil y amigable.' },
          { role: 'user', content: 'Hola, ¿cómo estás? Dame un plan de entrenamiento simple.' }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    console.log('\n=== RESPUESTA DE DEEPSEEK API ===');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('\nContenido de la respuesta:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.choices && response.data.choices[0]) {
      console.log('\nMensaje:');
      console.log(response.data.choices[0].message.content);
    }
    
    console.log('\n=== PRUEBA COMPLETADA CON ÉXITO ===');
    return true;
  } catch (error) {
    console.error('\n=== ERROR EN LA PRUEBA ===');
    if (error.response) {
      // La solicitud fue realizada y el servidor respondió con un código de estado
      // que cae fuera del rango de 2xx
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // La solicitud fue realizada pero no se recibió respuesta
      console.error('No se recibió respuesta. Request:', error.request);
    } else {
      // Algo ocurrió al configurar la solicitud que desencadenó un error
      console.error('Error al configurar la solicitud:', error.message);
    }
    console.error('Config:', error.config);
    return false;
  }
}

// Ejecutar la prueba
testDeepseekAPI()
  .then(success => {
    if (success) {
      console.log('La API de DeepSeek funciona correctamente.');
    } else {
      console.log('Hubo un problema con la API de DeepSeek.');
    }
  })
  .catch(err => {
    console.error('Error inesperado:', err);
  });
