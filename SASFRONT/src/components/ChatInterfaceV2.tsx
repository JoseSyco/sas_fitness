import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  Container
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { aiService } from '../services/api';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatInterfaceV2: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Entiendo tu consulta. Para ayudarte mejor, ¿podrías especificar si está relacionada con tu entrenamiento, nutrición o seguimiento de progreso? Así podré darte información más precisa y útil para tus objetivos.',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      // Get AI response
      const response = await aiService.sendChatMessage(input);
      
      // Add AI response
      const aiMessage: Message = {
        id: messages.length + 2,
        text: response.data.message || "Lo siento, no pude procesar tu mensaje.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Lo siento, estoy teniendo problemas para procesar tu mensaje. Error: Network Error. Por favor, intenta de nuevo más tarde.",
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

  return (
    <Container maxWidth="md" sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '70vh',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          bgcolor: '#2196f3', 
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}>
          <SmartToyIcon sx={{ mr: 1 }} />
          <Typography variant="h6">SAS FITNESS AI</Typography>
        </Box>
        
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
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'white',
                  borderTopLeftRadius: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 100
                }}
              >
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2">Escribiendo...</Typography>
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
      
      <Typography 
        variant="caption" 
        color="text.secondary" 
        align="center"
        sx={{ mt: 2 }}
      >
        Pregunta sobre rutinas, nutrición, ejercicios o tu progreso. También puedes pedir sugerencias o registrar información.
      </Typography>
    </Container>
  );
};

export default ChatInterfaceV2;
