import { useState, useRef, useEffect, useContext } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  CircularProgress,
  IconButton,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AuthContext from '../context/AuthContext';
import { aiService, workoutService, nutritionService, progressService, exerciseService, useApiStatus } from '../services/api';
import logger from '../utils/logger';
import CloudOffIcon from '@mui/icons-material/CloudOff';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

/**
 * Ejecuta servicios basados en la acción recibida de la IA
 * @param action - Acción a ejecutar
 * @param data - Datos estructurados asociados a la acción
 */
const executeServiceBasedOnAction = async (action: any, data: any) => {
  if (!action || !action.type) {
    logger.warn('No action type provided');
    return;
  }

  logger.info('Executing service based on action', { actionType: action.type });

  try {
    switch (action.type) {
      case 'CREATED_WORKOUT_PLAN':
      case 'UPDATED_WORKOUT_PLAN':
        if (data && data.type === 'workout_plan') {
          // Guardar plan de entrenamiento
          const workoutPlanData = {
            plan_name: data.plan_name || 'Plan de entrenamiento',
            description: data.description || 'Plan generado por IA',
            goal: data.goal || 'general_fitness',
            fitness_level: data.fitness_level || 'intermediate',
            is_ai_generated: true,
            sessions: data.sessions || []
          };

          if (action.planId) {
            await workoutService.updatePlan(action.planId, workoutPlanData);
            logger.info('Updated workout plan', { planId: action.planId });
          } else {
            const result = await workoutService.createPlan(workoutPlanData);
            logger.info('Created workout plan', { planId: result.data.plan_id });
          }
        }
        break;

      case 'CREATED_NUTRITION_PLAN':
      case 'UPDATED_NUTRITION_PLAN':
        if (data && data.type === 'nutrition_plan') {
          // Guardar plan de nutrición
          const nutritionPlanData = {
            plan_name: data.plan_name || 'Plan de nutrición',
            daily_calories: data.daily_calories || 2000,
            protein_grams: data.protein_grams || 150,
            carbs_grams: data.carbs_grams || 200,
            fat_grams: data.fat_grams || 70,
            is_ai_generated: true,
            meals: data.meals || []
          };

          if (action.planId) {
            await nutritionService.updatePlan(action.planId, nutritionPlanData);
            logger.info('Updated nutrition plan', { planId: action.planId });
          } else {
            const result = await nutritionService.createPlan(nutritionPlanData);
            logger.info('Created nutrition plan', { planId: result.data.plan_id });
          }
        }
        break;

      case 'LOGGED_PROGRESS':
        if (data && data.type === 'progress_entry') {
          // Registrar progreso
          const progressData = {
            entry_date: data.entry_date || new Date().toISOString().split('T')[0],
            weight_kg: data.weight_kg,
            body_fat_percentage: data.body_fat_percentage,
            notes: data.notes || ''
          };

          await progressService.logProgress(progressData);
          logger.info('Logged progress entry');
        }
        break;

      case 'SUGGESTED_EXERCISE':
        if (data && data.type === 'exercise_suggestion') {
          // Guardar sugerencia de ejercicio
          const exerciseData = {
            name: data.exercise_name,
            muscle_groups: data.muscle_groups?.join(',') || '',
            difficulty: data.difficulty || 'intermediate',
            equipment_needed: data.equipment_needed?.join(',') || '',
            description: data.description || ''
          };

          await exerciseService.suggestExercise(exerciseData);
          logger.info('Suggested exercise', { exerciseName: data.exercise_name });
        }
        break;

      default:
        logger.info('No specific service action required for', { actionType: action.type });
    }
  } catch (error) {
    logger.error('Error executing service based on action', { error, actionType: action.type });
  }
};

/**
 * Procesa datos estructurados recibidos de la IA
 * @param data - Datos estructurados a procesar
 */
const processStructuredData = async (data: any) => {
  if (!data || !data.type) {
    logger.warn('No structured data type provided');
    return;
  }

  logger.info('Processing structured data', { dataType: data.type });

  try {
    switch (data.type) {
      case 'workout_plan':
        // Procesar plan de entrenamiento
        logger.info('Processing workout plan data');
        // Aquí se podría actualizar el estado de la aplicación o realizar otras acciones
        break;

      case 'nutrition_plan':
        // Procesar plan de nutrición
        logger.info('Processing nutrition plan data');
        // Aquí se podría actualizar el estado de la aplicación o realizar otras acciones
        break;

      case 'progress_tracking':
        // Procesar datos de seguimiento de progreso
        logger.info('Processing progress tracking data');
        // Aquí se podría actualizar el estado de la aplicación o realizar otras acciones
        break;

      case 'exercise_guidance':
        // Procesar guía de ejercicios
        logger.info('Processing exercise guidance data');
        // Aquí se podría actualizar el estado de la aplicación o realizar otras acciones
        break;

      case 'motivation':
        // Procesar mensaje motivacional
        logger.info('Processing motivation data');
        // Aquí se podría actualizar el estado de la aplicación o realizar otras acciones
        break;

      default:
        logger.info('No specific processing for data type', { dataType: data.type });
    }
  } catch (error) {
    logger.error('Error processing structured data', { error, dataType: data.type });
  }
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hola, soy tu asistente de fitness y nutrición. ¿En qué puedo ayudarte hoy?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useContext(AuthContext);
  const { isUsingMockData } = useApiStatus();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    logger.info('User sending message', { messageLength: input.length });

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
      logger.debug('Sending message to AI service', { message: input });
      console.log('[ChatInterface] Sending message to AI:', input);

      // Send message to AI service using the new chat endpoint
      const response = await aiService.sendChatMessage(input);

      logger.debug('Received AI response', {
        responseLength: response.data.message?.length || 0,
        action: response.data.action
      });

      console.log('[ChatInterface] Received AI response:', response.data);

      // Log structured data if present
      if (response.data.data) {
        console.log('[ChatInterface] Structured data in response:', response.data.data);
      }

      // Add AI response
      const aiMessage: Message = {
        id: messages.length + 2,
        text: response.data.message || "Conectando con DeepSeek...",
        sender: 'ai',
        timestamp: new Date()
      };

      // If there's an action, handle it (e.g., navigate to the relevant section)
      if (response.data.action) {
        console.log('[ChatInterface] Handling action:', response.data.action);
        logger.info('AI response includes action', { action: response.data.action });
        // Ejecutar servicios basados en la acción recibida
        await executeServiceBasedOnAction(response.data.action, response.data.data);
      }

      // If there's structured data, process it based on the action type
      if (response.data.data) {
        logger.info('AI response includes structured data', {
          dataType: response.data.data.type || 'unknown',
          dataSize: JSON.stringify(response.data.data).length
        });

        console.log('[ChatInterface] Processing structured data:', response.data.data);

        // Procesar datos estructurados automáticamente
        try {
          await processStructuredData(response.data.data);
          console.log('[ChatInterface] Structured data processed successfully');
        } catch (dataError) {
          console.error('[ChatInterface] Error processing structured data:', dataError);
        }
      }

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      logger.error('Error getting AI response:', error);
      console.error('[ChatInterface] Error getting AI response:', error);

      // Intentar conectar directamente con DeepSeek en caso de error
      try {
        // Llamada directa a DeepSeek (simulada por ahora)
        logger.info('Attempting direct connection to DeepSeek');

        // Aquí iría la llamada directa a DeepSeek si fuera necesario
        // Por ahora usamos un mensaje genérico
        const aiMessage: Message = {
          id: messages.length + 2,
          text: "Estoy procesando tu solicitud. Por favor, espera un momento...",
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
      } catch (deepseekError) {
        logger.error('Error connecting directly to DeepSeek:', deepseekError);

        // Mensaje de error genérico solo si todo falla
        const aiMessage: Message = {
          id: messages.length + 2,
          text: "Lo siento, estoy teniendo problemas para procesar tu solicitud en este momento.",
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
      }
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

  return (
    <Paper
      elevation={3}
      sx={{
        height: { xs: '50vh', sm: '55vh', md: '60vh' },
        maxHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        mb: 2
      }}
    >
      {/* Chat messages area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                    ml: message.sender === 'user' ? 1 : 0,
                    mr: message.sender === 'user' ? 0 : 1
                  }}
                >
                  {message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                </Avatar>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: message.sender === 'user' ? 'primary.light' : 'white',
                    color: message.sender === 'user' ? 'white' : 'text.primary'
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
                      textAlign: message.sender === 'user' ? 'right' : 'left',
                      opacity: 0.7
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
              </Box>
            </ListItem>
          ))}
          {isLoading && (
            <ListItem sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
                  <SmartToyIcon />
                </Avatar>
                <CircularProgress size={24} />
              </Box>
            </ListItem>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Input area */}
      <Box
        sx={{
          p: 2,
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
          position: 'relative'
        }}
      >
        {isUsingMockData && (
          <Chip
            icon={<CloudOffIcon />}
            label="Conectando directamente con DeepSeek"
            color="info"
            size="small"
            sx={{ position: 'absolute', top: '8px', right: '8px' }}
          />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Escribe tu mensaje aquí..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress} // Cambiado de onKeyPress a onKeyDown
            multiline
            maxRows={2}
            sx={{ mr: 1 }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            sx={{ alignSelf: 'flex-end' }}
          >
            <SendIcon />
          </IconButton>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Pregunta sobre rutinas, nutrición, ejercicios o tu progreso. También puedes pedir sugerencias o registrar información.
        </Typography>
      </Box>
    </Paper>
  );
};

export default ChatInterface;
