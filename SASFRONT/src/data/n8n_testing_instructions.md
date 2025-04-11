# Instrucciones para probar la conexión con n8n

Este documento proporciona instrucciones para probar la conexión entre la aplicación SAS Fitness y n8n.

## Opción 1: Usar la interfaz de chat de la aplicación

1. Abre la aplicación SAS Fitness en el navegador
2. Escribe un mensaje en el chat (por ejemplo, "Hola, ¿cómo estás?")
3. Presiona Enter o haz clic en el botón de enviar
4. Observa la consola del navegador (F12) para ver los logs de la comunicación con n8n

## Opción 2: Usar la página de prueba HTML

1. Abre el archivo `src/scripts/test_n8n.html` directamente en el navegador
2. Verifica que la URL del webhook sea `https://n8n.synapticalhub.com/webhook/sas`
3. Escribe un mensaje de prueba
4. Haz clic en el botón "Enviar mensaje"
5. Observa la respuesta recibida

## Opción 3: Usar el script de Node.js

1. Abre una terminal en la carpeta del proyecto
2. Ejecuta el siguiente comando:
   ```
   node src/scripts/test_n8n.js
   ```
3. Observa la respuesta en la consola

## Verificación en n8n

Para verificar que n8n está recibiendo las solicitudes:

1. Accede a la interfaz de n8n en `https://n8n.synapticalhub.com`
2. Ve al flujo de trabajo "SAS Fitness Chat"
3. Haz clic en el nodo "Webhook"
4. Verifica las últimas ejecuciones para ver si las solicitudes están llegando correctamente

## Formato de la solicitud

La solicitud debe tener el siguiente formato:

```json
{
  "nombre_usuario": "usuario",
  "mensaje": "Mensaje del usuario"
}
```

## Formato de la respuesta esperada

La respuesta debe tener el siguiente formato:

```json
{
  "mensaje_agente": "Respuesta del agente",
  "data": {
    "tipo": "tipo_de_respuesta",
    "contenido": {}
  },
  "action": {
    "type": "ACCIÓN_SUGERIDA",
    "params": {}
  }
}
```

## Solución de problemas

Si encuentras problemas de conexión:

1. Verifica que la URL del webhook sea correcta
2. Asegúrate de que n8n esté en ejecución
3. Verifica que no haya problemas de CORS
4. Revisa los logs en la consola del navegador para ver errores específicos
