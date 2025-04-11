import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Avatar,
  IconButton,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import n8nService from '../services/n8nService';
import TypingIndicator from './TypingIndicator';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const WELCOME_MESSAGE = '¡Hola! Soy tu entrenador virtual. ¿En qué puedo ayudarte hoy? ¿Quieres hablar sobre ejercicios, nutrición o seguir tu progreso?';

interface SimpleChatInterfaceProps {
  onRef?: (ref: { clearChatHistory: () => void }) => void;
}

const SimpleChatInterface: React.FC<SimpleChatInterfaceProps> = ({ onRef }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeShown, setWelcomeShown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Show welcome message on first load
  useEffect(() => {
    // Always show welcome message on component mount
    if (messages.length === 0) {
      // Add AI welcome message
      const welcomeMessage: Message = {
        id: 1,
        text: WELCOME_MESSAGE,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages([welcomeMessage]);
      setWelcomeShown(true);
    }
  }, []);

  // Expose clearChatHistory function to parent component
  useEffect(() => {
    if (onRef) {
      onRef({ clearChatHistory });
    }
  }, [onRef]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message directly to n8n service
      console.log('Enviando mensaje a n8n:', input);
      const result = await n8nService.sendUserMessage('usuario_test', input);
      console.log('Respuesta recibida de n8n:', result);

      // Add AI response
      const aiMessage: Message = {
        id: messages.length + 2,
        text: result.mensaje_agente || "No se recibió respuesta",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error al comunicarse con n8n:', error);

      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        text: `Error: ${error.message || "Error desconocido"}`,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to clear chat history (can be called when user logs out)
  const clearChatHistory = () => {
    // Clear messages first
    setMessages([]);
    setWelcomeShown(false);

    // Show welcome message again
    const welcomeMessage: Message = {
      id: 1,
      text: WELCOME_MESSAGE,
      sender: 'ai',
      timestamp: new Date()
    };

    // Set the welcome message after a small delay to ensure state update
    setTimeout(() => {
      setMessages([welcomeMessage]);
    }, 100);
  };

  return (
    <Box className="chat-container" sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%', padding: 0, boxSizing: 'border-box' }}>
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '60vh',
          borderRadius: 0,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          overflow: 'hidden',
          mt: 0,
          width: '100%',
          boxSizing: 'border-box'
        }}
      >

        {/* Messages area */}
        <Box sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              {message.sender === 'ai' && (
                <Avatar
                  sx={{
                    bgcolor: '#e91e63',
                    width: 36,
                    height: 36,
                    mr: 1
                  }}
                >
                  <SmartToyIcon fontSize="small" />
                </Avatar>
              )}

              <Box
                sx={{
                  maxWidth: '70%',
                  position: 'relative'
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: message.sender === 'user' ? '#e3f2fd' : 'white',
                    borderTopLeftRadius: message.sender === 'ai' ? 0 : 2,
                    borderTopRightRadius: message.sender === 'user' ? 0 : 2,
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                </Paper>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    color: 'text.secondary',
                    textAlign: message.sender === 'user' ? 'right' : 'left'
                  }}
                >
                  {formatTime(message.timestamp)}
                </Typography>
              </Box>

              {message.sender === 'user' && (
                <Avatar
                  sx={{
                    bgcolor: '#2196f3',
                    width: 36,
                    height: 36,
                    ml: 1
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Avatar>
              )}
            </Box>
          ))}

          {isLoading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                mb: 2
              }}
            >
              <Avatar
                sx={{
                  bgcolor: '#e91e63',
                  width: 36,
                  height: 36,
                  mr: 1
                }}
              >
                <SmartToyIcon fontSize="small" />
              </Avatar>

              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'white',
                  borderTopLeftRadius: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 80,
                  minHeight: 40
                }}
              >
                <TypingIndicator />
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input area */}
        <Box sx={{
          p: 2,
          bgcolor: 'white',
          borderTop: '1px solid #e0e0e0',
          display: 'flex'
        }}>
          <TextField
            fullWidth
            placeholder="Escribe tu mensaje aquí..."
            variant="outlined"
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              mr: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 4
              }
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            sx={{ bgcolor: '#2196f3', color: 'white', '&:hover': { bgcolor: '#1976d2' } }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Eliminado el texto del webhook */}
    </Box>
  );
};

export default SimpleChatInterface;
