import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import n8nService from '../services/n8nService';

/**
 * Componente para probar la conexión con n8n
 */
const N8nTester: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log('Enviando mensaje de prueba a n8n:', message);
      const result = await n8nService.sendUserMessage('usuario_test', message);
      console.log('Respuesta recibida de n8n:', result);
      setResponse(result);
    } catch (err: any) {
      console.error('Error al probar n8n:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        SAS FITNESS AI
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Mensaje de prueba"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          margin="normal"
          variant="outlined"
          placeholder="Escribe un mensaje para enviar a n8n..."
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleTest}
          disabled={loading || !message.trim()}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Enviar mensaje de prueba'}
        </Button>
      </Box>

      {message && response && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Mensaje de prueba
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {message}
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            Respuesta:
          </Typography>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body1" component="pre" sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
            }}>
              {JSON.stringify({
                mensaje_agente: response.mensaje_agente || "No se recibió respuesta"
              }, null, 2)}
            </Typography>
          </Box>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Mensaje del agente:
          </Typography>
          <Typography variant="body1">
            {response.mensaje_agente || "No se recibió respuesta"}
          </Typography>
        </Paper>
      )}

      {error && (
        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#fff0f0' }}>
          <Typography variant="subtitle1" color="error" gutterBottom>
            Error:
          </Typography>
          <Typography color="error">
            {error}
          </Typography>
        </Paper>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        URL del webhook: {import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.synapticalhub.com/webhook/sas'}
      </Typography>
    </Box>
  );
};

export default N8nTester;
