require('dotenv').config();
const axios = require('axios');

// Función para simular una respuesta de API
async function testMockAPI() {
  console.log('Simulando una respuesta de API...');
  
  try {
    // Creamos una respuesta simulada que imita el formato esperado por el frontend
    const mockResponse = {
      message: "¡Hola! Aquí tienes un plan de entrenamiento simple para comenzar. Este plan está diseñado para principiantes y se enfoca en ejercicios básicos que puedes hacer en casa o en el gimnasio.",
      data: {
        type: "workout_plan",
        plan_name: "Plan de Entrenamiento Básico",
        description: "Un plan de entrenamiento de 3 días para principiantes",
        fitness_level: "beginner",
        sessions: [
          {
            day_of_week: "Lunes",
            focus_area: "Cuerpo Completo",
            duration_minutes: 45,
            exercises: [
              {
                name: "Sentadillas",
                sets: 3,
                reps: 12,
                rest_seconds: 60,
                notes: "Mantén la espalda recta"
              },
              {
                name: "Flexiones",
                sets: 3,
                reps: 10,
                rest_seconds: 60,
                notes: "Modifica en rodillas si es necesario"
              }
            ]
          }
        ]
      }
    };

    console.log('\n=== RESPUESTA SIMULADA ===');
    console.log(JSON.stringify(mockResponse, null, 2));
    
    // Guardar esta respuesta en un archivo para usarla como respuesta simulada
    const fs = require('fs');
    fs.writeFileSync('mock-response.json', JSON.stringify(mockResponse, null, 2));
    
    console.log('\n=== PRUEBA COMPLETADA CON ÉXITO ===');
    console.log('Se ha guardado la respuesta simulada en mock-response.json');
    console.log('Puedes usar esta respuesta para probar el frontend sin necesidad de la API de DeepSeek');
    
    return true;
  } catch (error) {
    console.error('\n=== ERROR EN LA PRUEBA ===');
    console.error('Error:', error.message);
    return false;
  }
}

// Ejecutar la prueba
testMockAPI()
  .then(success => {
    if (success) {
      console.log('La prueba de API simulada funciona correctamente.');
      console.log('Ahora puedes modificar el backend para usar esta respuesta simulada en lugar de llamar a DeepSeek.');
    } else {
      console.log('Hubo un problema con la prueba simulada.');
    }
  })
  .catch(err => {
    console.error('Error inesperado:', err);
  });
