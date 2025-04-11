import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface SimpleMessageDisplayProps {
  userMessage: string;
  agentResponse: string;
}

/**
 * Componente simple para mostrar un mensaje del usuario y la respuesta del agente
 * sin ninguna interfaz adicional
 */
const SimpleMessageDisplay: React.FC<SimpleMessageDisplayProps> = ({ userMessage, agentResponse }) => {
  return (
    <Box sx={{ p: 2, maxWidth: '800px', margin: '0 auto' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Mensaje del usuario:
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {userMessage}
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          Respuesta:
        </Typography>
        <Typography variant="body1" component="pre" sx={{ 
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          backgroundColor: '#f5f5f5',
          p: 2,
          borderRadius: 1
        }}>
          {agentResponse}
        </Typography>
      </Paper>
    </Box>
  );
};

export default SimpleMessageDisplay;
