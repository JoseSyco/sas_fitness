const { recognizeIntent } = require('./utils/intentRecognition');
const { handleIntent } = require('./utils/intentHandlers');

async function testIntentRecognition() {
  console.log('Testing intent recognition...');
  
  const testMessages = [
    'Quiero crear una rutina de entrenamiento para perder peso',
    'Necesito un plan de nutrición para ganar músculo',
    'Registra mi peso actual de 75 kg',
    'Muéstrame mi progreso del último mes',
    'Cómo se hace una sentadilla correctamente',
    'Dame consejos para mejorar mi resistencia'
  ];
  
  for (const message of testMessages) {
    console.log(`\nMessage: "${message}"`);
    const intent = await recognizeIntent(message);
    console.log('Recognized intent:', intent.type);
    console.log('Parameters:', intent.parameters);
  }
}

testIntentRecognition().catch(console.error);
