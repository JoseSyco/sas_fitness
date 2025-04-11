/**
 * Servicio para comunicación con n8n
 * Este servicio maneja el envío de mensajes al webhook de n8n y recibe las respuestas
 */

import axios from 'axios';
import { N8N_WEBHOOK_URL } from '../config/env';

// URL del webhook de n8n (configurado en config/env.ts)

interface UserMessageRequest {
  type: string;
  token: string;
  data: {
    nombre_usuario: string;
    mensaje: string;
  };
}

interface AgentMessageResponse {
  mensaje_agente: string;
  data?: any;
  action?: any;
}

interface N8nResponse {
  success: boolean;
  message: string;
  data: {
    mensaje_agente: string;
    data?: any;
    action?: any;
  };
}

const n8nService = {
  /**
   * Envía un mensaje del usuario a n8n y recibe la respuesta del agente
   * @param username Nombre del usuario
   * @param message Mensaje del usuario
   * @returns Respuesta del agente procesada por n8n/DeepSeek
   */
  async sendUserMessage(username: string, message: string): Promise<AgentMessageResponse> {
    try {
      // Logs detallados para depuración
      console.log('=== INICIO DE SOLICITUD A N8N ===');
      console.log('URL del webhook:', N8N_WEBHOOK_URL);
      console.log('Usuario:', username);
      console.log('Mensaje:', message);

      // Token ficticio para desarrollo
      const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6Imp1YW5wZXJleiIsImVtYWlsIjoianVhbi5wZXJlekBleGFtcGxlLmNvbSIsImlhdCI6MTY0MzI5MjQ4MH0.6Y5BHO-n1pTLJcYuRyKU9OqZ4XNR5kJtNmm6z3YS8';

      // Preparar datos de la solicitud con el nuevo formato
      const requestData: UserMessageRequest = {
        type: 'mensaje_chat',
        token: demoToken,
        data: {
          nombre_usuario: username,
          mensaje: message
        }
      };

      console.log('Datos JSON a enviar:', JSON.stringify(requestData, null, 2));

      // Enviar solicitud POST a n8n
      console.log('Enviando solicitud POST...');
      const response = await axios.post(N8N_WEBHOOK_URL, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000 // 30 segundos de timeout
      });

      // Logs detallados de la respuesta
      console.log('=== RESPUESTA DE N8N RECIBIDA ===');
      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', JSON.stringify(response.headers, null, 2));
      console.log('Datos de respuesta:', JSON.stringify(response.data, null, 2));
      console.log('=== FIN DE RESPUESTA ===');

      // Verificar si la respuesta tiene el formato esperado
      if (!response.data) {
        console.error('Respuesta vacía de n8n');
        throw new Error('Respuesta vacía desde n8n');
      }

      // Verificar si la respuesta tiene el nuevo formato (success, message, data)
      if (response.data.success !== undefined) {
        console.log('Detectado formato de respuesta n8n nuevo');

        // Verificar si la operación fue exitosa
        if (!response.data.success) {
          throw new Error(`Error desde n8n: ${response.data.message}`);
        }

        // Verificar si hay datos en la respuesta
        if (!response.data.data) {
          throw new Error('Respuesta sin datos desde n8n');
        }

        // Devolver los datos del agente
        return response.data.data;
      }

      // Manejar el caso donde la respuesta tiene un campo 'output' que es un string JSON
      if (response.data.output && typeof response.data.output === 'string') {
        try {
          console.log('Detectado campo output con string JSON, intentando parsear...');

          // Limpiar el string de marcadores Markdown si existen
          let outputStr = response.data.output;

          // Eliminar marcadores de código Markdown al inicio
          outputStr = outputStr.replace(/^```json\s*\n/, '');

          // Eliminar marcadores de código Markdown al final
          outputStr = outputStr.replace(/\n```\s*$/, '');

          console.log('String limpio para parsear:', outputStr);

          const parsedOutput = JSON.parse(outputStr);
          console.log('Output parseado correctamente:', parsedOutput);

          // Verificar si es el nuevo formato de respuesta
          if (parsedOutput.success !== undefined) {
            if (!parsedOutput.success) {
              throw new Error(`Error desde n8n: ${parsedOutput.message}`);
            }
            return parsedOutput.data;
          }

          // Formato antiguo
          if (parsedOutput.mensaje_agente) {
            return parsedOutput;
          }
        } catch (parseError) {
          console.error('Error al parsear el campo output:', parseError);
          console.log('String que causó el error:', response.data.output);

          // Intento de extracción manual del mensaje del agente
          try {
            const matchMensaje = response.data.output.match(/"mensaje_agente"\s*:\s*"([^"]+)"/);
            if (matchMensaje && matchMensaje[1]) {
              console.log('Extracción manual del mensaje del agente exitosa');
              return {
                mensaje_agente: matchMensaje[1],
                data: {},
                action: null
              };
            }
          } catch (extractError) {
            console.error('Error en la extracción manual:', extractError);
          }
        }
      }

      // Si la respuesta no tiene el formato esperado, intentar adaptarla
      if (!response.data.mensaje_agente) {
        console.warn('Formato de respuesta inesperado, intentando adaptar:', response.data);

        // Si la respuesta es un string, asumimos que es el mensaje del agente
        if (typeof response.data === 'string') {
          return {
            mensaje_agente: response.data
          };
        }

        // Si la respuesta tiene un campo 'message', lo usamos como mensaje del agente
        if (response.data.message) {
          return {
            mensaje_agente: response.data.message,
            data: response.data.data || {},
            action: response.data.action || null
          };
        }

        throw new Error('Formato de respuesta inválido desde n8n');
      }

      return response.data;
    } catch (error: any) {
      console.log('=== ERROR EN LA COMUNICACIÓN CON N8N ===');
      console.error('Error al comunicarse con n8n:', error);

      // Mostrar detalles del error para depuración
      if (error.response) {
        // La solicitud fue realizada y el servidor respondió con un código de estado
        // que cae fuera del rango 2xx
        console.error('Error de respuesta:');
        console.error('- Status:', error.response.status);
        console.error('- Status Text:', error.response.statusText);
        console.error('- Headers:', JSON.stringify(error.response.headers, null, 2));
        console.error('- Data:', JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        // La solicitud fue realizada pero no se recibió respuesta
        console.error('Error de solicitud (sin respuesta):');
        console.error('- Request:', error.request);
        console.error('- Config:', JSON.stringify(error.config, null, 2));
      } else {
        // Algo ocurrió al configurar la solicitud que desencadenó un error
        console.error('Error de configuración:', error.message);
        console.error('- Stack:', error.stack);
      }

      // Intentar con una solicitud fetch como alternativa
      try {
        console.log('Intentando con fetch como alternativa...');
        // Token ficticio para desarrollo (mismo que arriba)
        const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6Imp1YW5wZXJleiIsImVtYWlsIjoianVhbi5wZXJlekBleGFtcGxlLmNvbSIsImlhdCI6MTY0MzI5MjQ4MH0.6Y5BHO-n1pTLJcYuRyKU9OqZ4XNR5kJtNmm6z3YS8';

        const userData = {
          type: 'mensaje_chat',
          token: demoToken,
          data: {
            nombre_usuario: username,
            mensaje: message
          }
        };

        const fetchResponse = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(userData)
        });

        console.log('Respuesta fetch:', fetchResponse.status, fetchResponse.statusText);

        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          console.log('Datos de fetch:', JSON.stringify(data, null, 2));

          // Verificar si la respuesta tiene el nuevo formato (success, message, data)
          if (data.success !== undefined) {
            console.log('Detectado formato de respuesta n8n nuevo (fetch)');

            // Verificar si la operación fue exitosa
            if (!data.success) {
              throw new Error(`Error desde n8n (fetch): ${data.message}`);
            }

            // Verificar si hay datos en la respuesta
            if (!data.data) {
              throw new Error('Respuesta sin datos desde n8n (fetch)');
            }

            // Devolver los datos del agente
            return data.data;
          }

          // Manejar el caso donde la respuesta tiene un campo 'output' que es un string JSON
          if (data.output && typeof data.output === 'string') {
            try {
              console.log('Detectado campo output con string JSON en fetch, intentando parsear...');

              // Limpiar el string de marcadores Markdown si existen
              let outputStr = data.output;

              // Eliminar marcadores de código Markdown al inicio
              outputStr = outputStr.replace(/^```json\s*\n/, '');

              // Eliminar marcadores de código Markdown al final
              outputStr = outputStr.replace(/\n```\s*$/, '');

              console.log('String limpio para parsear (fetch):', outputStr);

              const parsedOutput = JSON.parse(outputStr);
              console.log('Output de fetch parseado correctamente:', parsedOutput);

              // Verificar si es el nuevo formato de respuesta
              if (parsedOutput.success !== undefined) {
                if (!parsedOutput.success) {
                  throw new Error(`Error desde n8n (fetch): ${parsedOutput.message}`);
                }
                return parsedOutput.data;
              }

              // Formato antiguo
              if (parsedOutput.mensaje_agente) {
                return parsedOutput;
              }
            } catch (parseError) {
              console.error('Error al parsear el campo output en fetch:', parseError);
              console.log('String que causó el error (fetch):', data.output);

              // Intento de extracción manual del mensaje del agente
              try {
                const matchMensaje = data.output.match(/"mensaje_agente"\s*:\s*"([^"]+)"/);
                if (matchMensaje && matchMensaje[1]) {
                  console.log('Extracción manual del mensaje del agente exitosa (fetch)');
                  return {
                    mensaje_agente: matchMensaje[1],
                    data: {},
                    action: null
                  };
                }
              } catch (extractError) {
                console.error('Error en la extracción manual (fetch):', extractError);
              }
            }
          }

          return data;
        } else {
          console.error('Error en fetch:', fetchResponse.status, fetchResponse.statusText);
        }
      } catch (fetchError) {
        console.error('Error al usar fetch:', fetchError);
      }

      console.log('=== FIN DEL ERROR ===');

      // Devolver una respuesta de error para mostrar al usuario
      return {
        mensaje_agente: `Lo siento, estoy teniendo problemas para procesar tu mensaje. Error: Network Error. Por favor, intenta de nuevo más tarde.`
      };
    }
  }
};

export default n8nService;
