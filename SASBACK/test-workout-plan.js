const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Datos de prueba para un plan de entrenamiento
const workoutPlanData = {
  message: "¡Aquí tienes un plan de entrenamiento personalizado! He creado una rutina de 3 días a la semana enfocada en ejercicios compuestos para principiantes.",
  data: {
    type: "workout_plan",
    plan_name: "Rutina de Fuerza para Principiantes",
    description: "Plan de entrenamiento de 3 días a la semana enfocado en ejercicios compuestos para principiantes",
    fitness_level: "beginner",
    sessions: [
      {
        day_of_week: "Lunes",
        focus_area: "Tren Superior",
        duration_minutes: 45,
        exercises: [
          {
            exercise_id: 1, // Press de banca
            sets: 3,
            reps: 10,
            rest_seconds: 60,
            notes: "Mantén la espalda apoyada en el banco"
          },
          {
            exercise_id: 2, // Fondos en paralelas
            sets: 3,
            reps: 8,
            rest_seconds: 60,
            notes: "Si es muy difícil, usa asistencia"
          }
        ]
      },
      {
        day_of_week: "Miércoles",
        focus_area: "Tren Inferior",
        duration_minutes: 45,
        exercises: [
          {
            exercise_id: 4, // Sentadillas
            sets: 3,
            reps: 12,
            rest_seconds: 90,
            notes: "Mantén la espalda recta y las rodillas alineadas con los pies"
          }
        ]
      },
      {
        day_of_week: "Viernes",
        focus_area: "Cuerpo Completo",
        duration_minutes: 50,
        exercises: [
          {
            exercise_id: 3, // Dominadas
            sets: 3,
            reps: 8,
            rest_seconds: 60,
            notes: "Si es muy difícil, usa banda elástica de asistencia"
          },
          {
            exercise_id: 5, // Press militar
            sets: 3,
            reps: 10,
            rest_seconds: 60,
            notes: "Mantén el core activado"
          }
        ]
      }
    ]
  },
  action: {
    type: "CREATE_WORKOUT_PLAN"
  }
};

// Función para enviar el plan de entrenamiento al servidor
async function testCreateWorkoutPlan() {
  try {
    console.log('Enviando solicitud para crear un plan de entrenamiento...');

    // Simular una solicitud al endpoint de chat
    const response = await axios.post('http://localhost:5000/api/ai/chat', {
      message: "Quiero una rutina de ejercicios para principiantes de 3 días a la semana"
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Respuesta del servidor:', response.data);

    // Ahora enviar directamente al endpoint de planes de entrenamiento
    console.log('\nEnviando plan de entrenamiento directamente al endpoint de planes...');

    const planResponse = await axios.post('http://localhost:5000/api/workouts/plans', {
      user_id: 1,
      plan_name: workoutPlanData.data.plan_name,
      description: workoutPlanData.data.description,
      is_ai_generated: true,
      sessions: workoutPlanData.data.sessions
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Plan de entrenamiento creado:', planResponse.data);

    // Obtener los planes de entrenamiento
    console.log('\nObteniendo planes de entrenamiento...');

    const plansResponse = await axios.get('http://localhost:5000/api/workouts/plans?user_id=1');

    console.log('Planes de entrenamiento:', plansResponse.data);

    return true;
  } catch (error) {
    console.error('Error en la prueba:', error);
    if (error.response) {
      console.error('Datos de la respuesta de error:', error.response.data);
      console.error('Estado de la respuesta de error:', error.response.status);
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
    } else {
      console.error('Error al configurar la solicitud:', error.message);
    }
    return false;
  }
}

// Ejecutar la prueba
testCreateWorkoutPlan()
  .then(success => {
    if (success) {
      console.log('\n✅ Prueba completada con éxito');
    } else {
      console.log('\n❌ La prueba falló');
    }
  })
  .catch(err => {
    console.error('Error inesperado:', err);
  });
