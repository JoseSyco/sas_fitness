import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Paper, 
  Avatar, 
  CircularProgress,
  IconButton,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// Tipos para los mensajes
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Respuestas predefinidas para simulación
const AI_RESPONSES = [
  "¡Claro! Puedo ayudarte a crear un plan de entrenamiento personalizado. ¿Cuáles son tus objetivos principales?",
  "Para una dieta equilibrada, te recomendaría aumentar tu ingesta de proteínas y reducir los carbohidratos refinados. ¿Te gustaría un plan nutricional más detallado?",
  "Basado en tu progreso actual, estás en buen camino para alcanzar tus objetivos. Has perdido 2kg en el último mes, lo cual es un ritmo saludable.",
  "Para mejorar tu resistencia cardiovascular, te recomendaría incluir 3-4 sesiones de cardio por semana, alternando entre intensidad moderada y alta.",
  "Recuerda que el descanso es tan importante como el entrenamiento. Asegúrate de dormir al menos 7-8 horas cada noche para una recuperación óptima.",
  "¡Excelente pregunta! Para fortalecer tu core, te recomendaría ejercicios como planchas, mountain climbers y russian twists. ¿Te gustaría una rutina específica?"
];

// Estilos personalizados
const ChatContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '70vh',
  maxHeight: '70vh',
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isUser'
})<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: '80%',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  backgroundColor: isUser 
    ? theme.palette.primary.main 
    : theme.palette.mode === 'dark' 
      ? theme.palette.grey[800] 
      : theme.palette.grey[200],
  color: isUser 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.primary,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    bottom: 0,
    [isUser ? 'right' : 'left']: -8,
    borderWidth: '8px 8px 0 0',
    borderColor: `${isUser 
      ? theme.palette.primary.main 
      : theme.palette.mode === 'dark' 
        ? theme.palette.grey[800] 
        : theme.palette.grey[200]} transparent transparent transparent`,
    transform: isUser ? 'scaleX(-1)' : 'none',
  }
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const MessageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
}));

const MessageTimestamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  marginLeft: theme.spacing(1),
}));

/**
 * Componente de chat independiente para interactuar con el entrenador de IA
 * Esta versión no depende de servicios externos y utiliza respuestas predefinidas
 */
const StandaloneAICoachChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // Mensaje de bienvenida al cargar el componente
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: '¡Hola! Soy tu entrenador personal de fitness. ¿En qué puedo ayudarte hoy? Puedo crear planes de entrenamiento, darte consejos nutricionales o ayudarte a hacer seguimiento de tu progreso.',
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Scroll automático al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Manejar envío de mensaje
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simular tiempo de respuesta
    setTimeout(() => {
      // Seleccionar una respuesta aleatoria
      const randomIndex = Math.floor(Math.random() * AI_RESPONSES.length);
      const responseText = AI_RESPONSES[randomIndex];

      // Agregar respuesta del AI
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  // Manejar tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Formatear timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FitnessCenterIcon /> FitCoach - Tu Entrenador Personal (Modo Independiente)
      </Typography>
      
      <ChatContainer elevation={3}>
        <MessagesContainer>
          {messages.map((message) => (
            <Box key={message.id} sx={{ width: '100%' }}>
              <MessageHeader>
                {message.sender === 'ai' ? (
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.secondary.main,
                      width: 28,
                      height: 28
                    }}
                  >
                    <FitnessCenterIcon fontSize="small" />
                  </Avatar>
                ) : null}
                <Typography variant="caption" color="textSecondary">
                  {message.sender === 'ai' ? 'FitCoach' : 'Tú'}
                </Typography>
                <MessageTimestamp>
                  {formatTimestamp(message.timestamp)}
                </MessageTimestamp>
              </MessageHeader>
              
              <MessageBubble isUser={message.sender === 'user'}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.text}
                </Typography>
              </MessageBubble>
            </Box>
          ))}
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </MessagesContainer>
        
        <Divider />
        
        <InputContainer>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Escribe tu mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            multiline
            maxRows={3}
            size="small"
            sx={{ mr: 1 }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputValue.trim()}
          >
            <SendIcon />
          </IconButton>
        </InputContainer>
      </ChatContainer>
      
      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
        FitCoach utiliza IA para proporcionar recomendaciones personalizadas. Consulta siempre con un profesional de la salud antes de iniciar un nuevo régimen de ejercicio o dieta.
      </Typography>
    </Box>
  );
};

export default StandaloneAICoachChat;
