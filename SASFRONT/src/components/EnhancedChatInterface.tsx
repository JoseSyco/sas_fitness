import { useState, useRef, useEffect, useContext } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  CircularProgress,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Grid
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InfoIcon from '@mui/icons-material/Info';
import AuthContext from '../context/AuthContext';
import { aiService, workoutService, nutritionService, progressService, exerciseService, useApiStatus } from '../services/api';
import logger from '../utils/logger';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import jsonDataService from '../services/jsonDataService';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  data?: any; // Datos estructurados asociados al mensaje
  action?: any; // Acción asociada al mensaje
}

/**
 * Componente de chat mejorado que utiliza datos JSON
 */
const EnhancedChatInterface = () => {
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
  const [showDataCard, setShowDataCard] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useContext(AuthContext);
  const { isUsingMockData } = useApiStatus();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Función para manejar acciones basadas en datos estructurados
  const handleAction = (action: any, data: any) => {
    if (!action || !action.type) return;

    logger.info('Handling action', { actionType: action.type });
    console.log('[EnhancedChatInterface] Handling action:', action);

    // Mostrar tarjeta de datos según el tipo de acción
    setCurrentData({ action, data });
    setShowDataCard(true);
  };

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
      console.log('[EnhancedChatInterface] Sending message to AI:', input);

      let response;
      
      // Intentar usar el servicio AI real
      try {
        response = await aiService.sendChatMessage(input);
        logger.debug('Received AI response', {
          responseLength: response.data.message?.length || 0,
          action: response.data.action
        });
        console.log('[EnhancedChatInterface] Received AI response:', response.data);
      } catch (apiError) {
        logger.warn('Error with AI service, falling back to JSON data', { error: apiError });
        console.warn('[EnhancedChatInterface] Falling back to JSON data:', apiError);
        
        // Usar el servicio JSON como fallback
        const simulatedResponse = jsonDataService.simulateAIResponse(input);
        response = { data: simulatedResponse };
        
        logger.debug('Generated simulated response', {
          responseLength: simulatedResponse.message?.length || 0,
          action: simulatedResponse.action
        });
        console.log('[EnhancedChatInterface] Generated simulated response:', simulatedResponse);
      }

      // Add AI response
      const aiMessage: Message = {
        id: messages.length + 2,
        text: response.data.message || "Lo siento, no pude procesar tu mensaje.",
        sender: 'ai',
        timestamp: new Date(),
        data: response.data.data,
        action: response.data.action
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle action if present
      if (response.data.action) {
        handleAction(response.data.action, response.data.data);
      }
    } catch (error) {
      logger.error('Error processing message:', error);
      console.error('[EnhancedChatInterface] Error:', error);

      // Mensaje de error
      const aiMessage: Message = {
        id: messages.length + 2,
        text: "Lo siento, estoy teniendo problemas para procesar tu solicitud en este momento.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
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

  // Renderizar tarjeta de datos según el tipo
  const renderDataCard = () => {
    if (!currentData || !currentData.action) return null;

    const { action, data } = currentData;

    switch (action.type) {
      case 'SHOW_WORKOUT_PLAN':
      case 'CREATED_WORKOUT_PLAN':
        // Obtener plan de entrenamiento
        const workoutPlan = jsonDataService.getWorkoutPlanById(action.planId);
        
        if (!workoutPlan) return null;
        
        return (
          <Card sx={{ mb: 2, mt: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FitnessCenterIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{workoutPlan.plan_name}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {workoutPlan.description}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                Sesiones:
              </Typography>
              {workoutPlan.sessions.slice(0, 3).map(session => (
                <Box key={session.session_id} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{session.day_of_week}</strong> - {session.focus_area} ({session.duration_minutes} min)
                  </Typography>
                </Box>
              ))}
              {workoutPlan.sessions.length > 3 && (
                <Typography variant="body2" color="text.secondary">
                  Y {workoutPlan.sessions.length - 3} sesiones más...
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">Ver Plan Completo</Button>
              <Button size="small">Cerrar</Button>
            </CardActions>
          </Card>
        );
        
      case 'SHOW_NUTRITION_PLAN':
      case 'CREATED_NUTRITION_PLAN':
        // Obtener plan de nutrición
        const nutritionPlan = jsonDataService.getNutritionPlanById(action.planId);
        
        if (!nutritionPlan) return null;
        
        return (
          <Card sx={{ mb: 2, mt: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <RestaurantIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{nutritionPlan.plan_name}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {nutritionPlan.description}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Typography variant="body2" align="center">
                    <strong>{nutritionPlan.daily_calories}</strong>
                    <br />calorías
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" align="center">
                    <strong>{nutritionPlan.protein_grams}g</strong>
                    <br />proteínas
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" align="center">
                    <strong>{nutritionPlan.carbs_grams}g</strong>
                    <br />carbohidratos
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" align="center">
                    <strong>{nutritionPlan.fat_grams}g</strong>
                    <br />grasas
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                Comidas:
              </Typography>
              {nutritionPlan.meals.slice(0, 3).map(meal => (
                <Box key={meal.meal_id} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{meal.meal_name}</strong> - {meal.scheduled_time} ({meal.calories} cal)
                  </Typography>
                </Box>
              ))}
              {nutritionPlan.meals.length > 3 && (
                <Typography variant="body2" color="text.secondary">
                  Y {nutritionPlan.meals.length - 3} comidas más...
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">Ver Plan Completo</Button>
              <Button size="small" onClick={() => setShowDataCard(false)}>Cerrar</Button>
            </CardActions>
          </Card>
        );
        
      case 'SHOW_EXERCISE':
        // Obtener ejercicio
        const exercise = jsonDataService.getExerciseById(action.exerciseId);
        
        if (!exercise) return null;
        
        return (
          <Card sx={{ mb: 2, mt: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FitnessCenterIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{exercise.name}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {exercise.description}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2">
                    <strong>Grupo muscular:</strong><br />
                    {exercise.muscle_group}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">
                    <strong>Dificultad:</strong><br />
                    {exercise.difficulty_level}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2">
                    <strong>Equipo:</strong><br />
                    {exercise.equipment_needed}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">Ver Detalles</Button>
              <Button size="small" onClick={() => setShowDataCard(false)}>Cerrar</Button>
            </CardActions>
          </Card>
        );
        
      case 'SHOW_PROGRESS':
        // Obtener datos de progreso
        const progressEntries = jsonDataService.getProgress();
        
        if (progressEntries.length === 0) return null;
        
        const latestEntry = progressEntries[progressEntries.length - 1];
        
        return (
          <Card sx={{ mb: 2, mt: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShowChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Progreso</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Datos de progreso del {new Date(latestEntry.tracking_date).toLocaleDateString()}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" align="center">
                    <strong>{latestEntry.weight} kg</strong>
                    <br />peso
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" align="center">
                    <strong>{latestEntry.body_fat_percentage}%</strong>
                    <br />grasa corporal
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" align="center">
                    <strong>{latestEntry.measurements.waist} cm</strong>
                    <br />cintura
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">Ver Progreso Completo</Button>
              <Button size="small" onClick={() => setShowDataCard(false)}>Cerrar</Button>
            </CardActions>
          </Card>
        );
        
      default:
        return (
          <Card sx={{ mb: 2, mt: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InfoIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Información</Typography>
              </Box>
              <Typography variant="body2">
                Se ha recibido información adicional. Puedes preguntar más detalles sobre este tema.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => setShowDataCard(false)}>Cerrar</Button>
            </CardActions>
          </Card>
        );
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
                  
                  {/* Mostrar indicador si hay datos estructurados */}
                  {message.data && message.sender === 'ai' && (
                    <Chip 
                      label="Datos disponibles" 
                      size="small" 
                      color="info" 
                      onClick={() => {
                        setCurrentData({ action: message.action, data: message.data });
                        setShowDataCard(true);
                      }}
                      sx={{ mt: 1, fontSize: '0.7rem' }}
                    />
                  )}
                </Paper>
              </Box>
            </ListItem>
          ))}
          
          {/* Mostrar tarjeta de datos si es necesario */}
          {showDataCard && (
            <ListItem sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              {renderDataCard()}
            </ListItem>
          )}
          
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
          zIndex: 1
        }}
      >
        {isUsingMockData && (
          <Chip
            icon={<CloudOffIcon />}
            label="Usando datos JSON locales"
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
            onKeyDown={handleKeyPress}
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

export default EnhancedChatInterface;
