import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Componente simplificado de chat para interactuar con el entrenador de IA
 */
const SimpleAICoachChat: React.FC = () => {
  return (
    <Box sx={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        FitCoach - Tu Entrenador Personal (Versión Simplificada)
      </Typography>
      
      <Paper
        elevation={3}
        sx={{
          height: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 2,
          p: 4
        }}
      >
        <Typography variant="h6" gutterBottom>
          Bienvenido a FitCoach
        </Typography>
        <Typography variant="body1" align="center">
          Esta es una versión simplificada del chat con el entrenador de IA.
          Estamos trabajando para solucionar los problemas con la versión completa.
        </Typography>
      </Paper>
      
      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
        FitCoach utiliza IA para proporcionar recomendaciones personalizadas. Consulta siempre con un profesional de la salud antes de iniciar un nuevo régimen de ejercicio o dieta.
      </Typography>
    </Box>
  );
};

export default SimpleAICoachChat;
