const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql2/promise');

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Datos de prueba para simular una respuesta de DeepSeek
const mockDeepSeekResponse = {
  message: "¡Aquí tienes un plan de entrenamiento personalizado! He creado una rutina de 3 días a la semana enfocada en ejercicios compuestos para principiantes. Estos ejercicios son interesantes y efectivos para comenzar tu viaje fitness.",
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
            name: "Press de banca",
            sets: 3,
            reps: 10,
            rest_seconds: 60,
            notes: "Mantén la espalda apoyada en el banco"
          },
          {
            name: "Fondos en paralelas",
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
            name: "Sentadillas",
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
            name: "Dominadas",
            sets: 3,
            reps: 8,
            rest_seconds: 60,
            notes: "Si es muy difícil, usa banda elástica de asistencia"
          },
          {
            name: "Press militar",
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

// Función para crear una conexión a la base de datos
async function createDbConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'sas2'
  });
}

// Función para verificar si hay datos en la base de datos
async function checkDatabaseData() {
  const connection = await createDbConnection();
  
  try {
    console.log('Verificando datos en la base de datos...');
    
    // Verificar planes de entrenamiento
    const [workoutPlans] = await connection.query('SELECT * FROM workout_plans');
    console.log(`Planes de entrenamiento: ${workoutPlans.length}`);
    
    if (workoutPlans.length > 0) {
      const planId = workoutPlans[0].plan_id;
      
      // Verificar sesiones de entrenamiento
      const [sessions] = await connection.query('SELECT * FROM workout_sessions WHERE plan_id = ?', [planId]);
      console.log(`Sesiones para el plan ${planId}: ${sessions.length}`);
      
      if (sessions.length > 0) {
        const sessionId = sessions[0].session_id;
        
        // Verificar ejercicios
        const [exercises] = await connection.query('SELECT * FROM workout_exercises WHERE session_id = ?', [sessionId]);
        console.log(`Ejercicios para la sesión ${sessionId}: ${exercises.length}`);
        
        return {
          hasData: true,
          planId,
          sessionCount: sessions.length,
          exerciseCount: exercises.length
        };
      }
    }
    
    return { hasData: false };
  } finally {
    await connection.end();
  }
}

// Función para limpiar datos de prueba
async function cleanupTestData() {
  const connection = await createDbConnection();
  
  try {
    console.log('Limpiando datos de prueba...');
    
    // Obtener planes de entrenamiento
    const [workoutPlans] = await connection.query('SELECT plan_id FROM workout_plans WHERE is_ai_generated = TRUE');
    
    for (const plan of workoutPlans) {
      const planId = plan.plan_id;
      
      // Obtener sesiones
      const [sessions] = await connection.query('SELECT session_id FROM workout_sessions WHERE plan_id = ?', [planId]);
      
      for (const session of sessions) {
        const sessionId = session.session_id;
        
        // Eliminar ejercicios
        await connection.query('DELETE FROM workout_exercises WHERE session_id = ?', [sessionId]);
      }
      
      // Eliminar sesiones
      await connection.query('DELETE FROM workout_sessions WHERE plan_id = ?', [planId]);
      
      // Eliminar plan
      await connection.query('DELETE FROM workout_plans WHERE plan_id = ?', [planId]);
    }
    
    console.log('Datos de prueba eliminados correctamente');
  } finally {
    await connection.end();
  }
}

// Función para simular el flujo completo
async function testCompleteFlow() {
  try {
    console.log('=== INICIANDO PRUEBA DE FLUJO COMPLETO ===');
    
    // Paso 1: Limpiar datos de prueba anteriores
    await cleanupTestData();
    
    // Paso 2: Verificar que no hay datos en la base de datos
    const initialData = await checkDatabaseData();
    console.log('Estado inicial de la base de datos:', initialData);
    
    // Paso 3: Enviar mensaje al endpoint de chat
    console.log('\nPaso 1: Enviando mensaje al endpoint de chat...');
    const chatResponse = await axios.post('http://localhost:5000/api/ai/chat', {
      message: "Quiero una rutina de ejercicios para principiantes de 3 días a la semana"
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Respuesta del chat:', {
      message: chatResponse.data.message,
      actionType: chatResponse.data.action?.type,
      dataType: chatResponse.data.data?.type
    });
    
    // Paso 4: Verificar que se han creado datos en la base de datos
    console.log('\nPaso 2: Verificando datos creados en la base de datos...');
    const finalData = await checkDatabaseData();
    console.log('Estado final de la base de datos:', finalData);
    
    // Paso 5: Verificar que la respuesta no contiene JSON visible
    console.log('\nPaso 3: Verificando formato de la respuesta...');
    const responseContainsJson = chatResponse.data.message.includes('{') && chatResponse.data.message.includes('}');
    console.log('¿La respuesta contiene JSON visible?', responseContainsJson ? 'SÍ (ERROR)' : 'NO (CORRECTO)');
    
    // Paso 6: Verificar que la respuesta contiene el mensaje conversacional
    const containsConversationalMessage = chatResponse.data.message.includes('ejercicios') && 
                                         chatResponse.data.message.includes('rutina');
    console.log('¿La respuesta contiene mensaje conversacional?', containsConversationalMessage ? 'SÍ (CORRECTO)' : 'NO (ERROR)');
    
    // Resultado final
    if (finalData.hasData && !responseContainsJson && containsConversationalMessage) {
      console.log('\n✅ PRUEBA EXITOSA: El flujo completo funciona correctamente');
      return true;
    } else {
      console.log('\n❌ PRUEBA FALLIDA: Hay problemas en el flujo');
      return false;
    }
  } catch (error) {
    console.error('Error en la prueba:', error.message);
    if (error.response) {
      console.error('Datos de la respuesta de error:', error.response.data);
      console.error('Estado de la respuesta de error:', error.response.status);
    }
    return false;
  }
}

// Función para simular una respuesta de DeepSeek (para pruebas sin API)
async function mockDeepSeekTest() {
  try {
    console.log('=== INICIANDO PRUEBA CON RESPUESTA SIMULADA DE DEEPSEEK ===');
    
    // Paso 1: Limpiar datos de prueba anteriores
    await cleanupTestData();
    
    // Paso 2: Verificar que no hay datos en la base de datos
    const initialData = await checkDatabaseData();
    console.log('Estado inicial de la base de datos:', initialData);
    
    // Paso 3: Enviar la respuesta simulada directamente al endpoint de procesamiento
    console.log('\nPaso 1: Enviando respuesta simulada al endpoint de procesamiento...');
    
    // Primero, enviar un mensaje para obtener un intent de tipo CREATE_WORKOUT
    const intentResponse = await axios.post('http://localhost:5000/api/ai/chat', {
      message: "Quiero una rutina de ejercicios para principiantes"
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Respuesta del intent:', {
      message: intentResponse.data.message,
      actionType: intentResponse.data.action?.type
    });
    
    // Paso 4: Enviar los datos del plan directamente al endpoint de planes
    console.log('\nPaso 2: Enviando plan directamente al endpoint de planes...');
    const planResponse = await axios.post('http://localhost:5000/api/workouts/plans', {
      user_id: 1,
      plan_name: mockDeepSeekResponse.data.plan_name,
      description: mockDeepSeekResponse.data.description,
      is_ai_generated: true,
      sessions: mockDeepSeekResponse.data.sessions
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Respuesta del endpoint de planes:', planResponse.data);
    
    // Paso 5: Verificar que se han creado datos en la base de datos
    console.log('\nPaso 3: Verificando datos creados en la base de datos...');
    const finalData = await checkDatabaseData();
    console.log('Estado final de la base de datos:', finalData);
    
    // Resultado final
    if (finalData.hasData) {
      console.log('\n✅ PRUEBA EXITOSA: La creación de planes funciona correctamente');
      return true;
    } else {
      console.log('\n❌ PRUEBA FALLIDA: Hay problemas en la creación de planes');
      return false;
    }
  } catch (error) {
    console.error('Error en la prueba:', error.message);
    if (error.response) {
      console.error('Datos de la respuesta de error:', error.response.data);
      console.error('Estado de la respuesta de error:', error.response.status);
    }
    return false;
  }
}

// Ejecutar las pruebas
async function runTests() {
  try {
    // Primero intentar con el flujo completo
    console.log('\n\n======= PRUEBA DE FLUJO COMPLETO =======\n');
    const completeFlowResult = await testCompleteFlow();
    
    // Si falla, intentar con la respuesta simulada
    if (!completeFlowResult) {
      console.log('\n\n======= PRUEBA CON RESPUESTA SIMULADA =======\n');
      await mockDeepSeekTest();
    }
    
    console.log('\n\n======= PRUEBAS FINALIZADAS =======');
  } catch (error) {
    console.error('Error ejecutando pruebas:', error);
  }
}

// Ejecutar las pruebas
runTests();
