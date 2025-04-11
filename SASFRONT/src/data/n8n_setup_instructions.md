# Configuración de n8n para integración con DeepSeek

Este documento explica cómo configurar n8n para procesar mensajes del usuario a través de DeepSeek y devolver respuestas estructuradas a la aplicación SAS Fitness.

## Requisitos previos

1. Instalar n8n (https://n8n.io/):
   ```
   npm install n8n -g
   ```

2. Tener una API key de DeepSeek:
   - API Key: sk-f4295cbdcc284d45b6a1752c5e998b5b

## Pasos para configurar el flujo en n8n

1. Iniciar n8n:
   ```
   n8n start
   ```

2. Acceder a la interfaz web de n8n (por defecto en http://localhost:5678)

3. Crear un nuevo flujo de trabajo:
   - Haz clic en "Create new workflow"
   - Nombra el flujo como "SAS Fitness Chat"

4. Configurar el nodo de Webhook:
   - Añade un nodo "Webhook"
   - Configúralo como método POST
   - Establece la ruta como `/sas`
   - Activa el webhook haciendo clic en "Deploy webhook"

5. Añadir un nodo HTTP Request para DeepSeek:
   - Añade un nodo "HTTP Request" después del Webhook
   - Configúralo con los siguientes parámetros:
     - Método: POST
     - URL: https://api.deepseek.com/v1/chat/completions
     - Autenticación: Bearer Token
     - Token: sk-f4295cbdcc284d45b6a1752c5e998b5b
     - Headers: Content-Type: application/json
     - Body: JSON

6. Configurar el cuerpo de la solicitud a DeepSeek:
   - En el campo "Body", usa el siguiente código JavaScript:

```javascript
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": {{$json["system_prompt"]}}
    },
    {
      "role": "user",
      "content": "Usuario: " + {{$json["nombre_usuario"]}} + "\nMensaje: " + {{$json["mensaje"]}}
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

7. Añadir un nodo Function para preparar el prompt:
   - Añade un nodo "Function" entre el Webhook y el HTTP Request
   - Usa el siguiente código:

```javascript
// Cargar el prompt del sistema desde un archivo o definirlo aquí
const systemPrompt = `
Eres un asistente virtual especializado en fitness y bienestar para la plataforma SaaS Fitness. Tu objetivo es ayudar a los usuarios a alcanzar sus metas de salud y fitness proporcionando información precisa, motivación y seguimiento personalizado.

# ROL
- Actúas como un entrenador personal y nutricionista virtual profesional
- Eres amigable, motivador y empático, pero también directo y profesional
- Proporcionas respuestas concisas y prácticas, evitando explicaciones innecesariamente largas

# REGLAS
1. NUNCA menciones que eres una IA o un modelo de lenguaje
2. Responde siempre en español
3. Mantén un tono conversacional y positivo
4. Evita jerga técnica excesiva, explica conceptos en términos sencillos
5. No inventes información sobre el usuario que no te haya sido proporcionada
6. Cuando no tengas suficiente información, haz preguntas para obtenerla
7. Siempre devuelve tus respuestas en formato JSON con la estructura especificada

# CAPACIDADES
Puedes ayudar con:
- Planes de entrenamiento personalizados
- Recomendaciones nutricionales
- Seguimiento de progreso
- Consejos de motivación
- Información sobre ejercicios específicos
- Responder preguntas generales sobre fitness y salud

# FORMATO DE RESPUESTA
Debes responder SIEMPRE con un objeto JSON con la siguiente estructura:
{
  "mensaje_agente": "Tu respuesta conversacional aquí",
  "data": {
    "tipo": "tipo_de_respuesta",
    "contenido": {}
  },
  "action": {
    "type": "ACCIÓN_SUGERIDA",
    "params": {}
  }
}

Donde:
- mensaje_agente: Es tu respuesta textual al usuario (obligatorio)
- data: Información estructurada relacionada con la respuesta (opcional)
- action: Acción sugerida para la interfaz (opcional)

# CONTEXTO DEL USUARIO
El usuario está utilizando una plataforma de fitness que incluye:
- Seguimiento de rutinas de ejercicio
- Planes de nutrición
- Registro de progreso (peso, medidas)
- Biblioteca de ejercicios
`;

// Añadir el prompt al objeto JSON
$json.system_prompt = systemPrompt;

return $json;
```

8. Añadir un nodo Function para procesar la respuesta:
   - Añade un nodo "Function" después del HTTP Request
   - Usa el siguiente código:

```javascript
// Extraer la respuesta de DeepSeek
const deepseekResponse = $json.choices[0].message.content;

try {
  // Intentar parsear la respuesta como JSON
  let parsedResponse = JSON.parse(deepseekResponse);

  // Verificar que tenga el formato esperado
  if (!parsedResponse.mensaje_agente) {
    throw new Error("Formato de respuesta inválido");
  }

  // Devolver la respuesta estructurada
  return parsedResponse;
} catch (error) {
  // Si no es JSON válido, crear una respuesta estructurada
  return {
    mensaje_agente: deepseekResponse,
    data: {},
    action: null
  };
}
```

9. Conectar los nodos:
   - Webhook → Function (preparar prompt) → HTTP Request → Function (procesar respuesta) → Webhook response

10. Configurar el nodo de Webhook Response:
    - Añade un nodo "Webhook Response" al final del flujo
    - Asegúrate de que esté configurado para devolver la respuesta JSON procesada

11. Activar el flujo de trabajo:
    - Haz clic en "Save" y luego en "Activate"

## Prueba de la integración

Para probar la integración, puedes usar una herramienta como Postman o curl:

```bash
curl -X POST https://n8n.synapticalhub.com/webhook/sas \
  -H "Content-Type: application/json" \
  -d '{"nombre_usuario": "Usuario", "mensaje": "Quiero perder peso, ¿qué ejercicios me recomiendas?"}'
```

Deberías recibir una respuesta con el siguiente formato:

```json
{
  "mensaje_agente": "Para perder peso, te recomiendo combinar ejercicios cardiovasculares con entrenamiento de fuerza...",
  "data": {
    "tipo": "recomendacion_ejercicio",
    "contenido": {
      "objetivo": "pérdida_de_peso",
      "categorias": ["cardio", "fuerza"]
    }
  },
  "action": {
    "type": "SHOW_EXERCISE_CATEGORY",
    "params": {
      "category": "weight_loss"
    }
  }
}
```

## Notas adicionales

- Asegúrate de que n8n esté ejecutándose cuando la aplicación SAS Fitness intente comunicarse con él.
- La URL del webhook debe ser accesible desde la aplicación SAS Fitness.
- La URL del webhook configurada es `https://n8n.synapticalhub.com/webhook/sas`.
- Para un entorno de producción, necesitarás configurar n8n para que sea accesible públicamente.
