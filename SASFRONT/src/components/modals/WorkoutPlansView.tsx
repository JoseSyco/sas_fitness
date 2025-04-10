import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Button,
  LinearProgress,
  Tooltip
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { workoutService } from '../../services/api';
import jsonDataService from '../../services/jsonDataService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`workout-tabpanel-${index}`}
      aria-labelledby={`workout-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const WorkoutPlansView = () => {
  const [value, setValue] = useState(0);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [planStatus, setPlanStatus] = useState<{[key: string]: {status: 'active' | 'paused' | 'completed', progress: number, daysCompleted: number, totalDays: number}}>({});

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        setLoading(true);
        console.log('Fetching workout plans...');

        // Cargar directamente desde JSON para simplificar
        const jsonPlans = await jsonDataService.getWorkoutPlans();
        console.log('Workout plans from JSON:', jsonPlans);

        if (Array.isArray(jsonPlans) && jsonPlans.length > 0) {
          console.log('Setting workout plans:', jsonPlans);
          setWorkoutPlans(jsonPlans);

          // Inicializar el estado de los planes
          const initialStatus: {[key: string]: {status: 'active' | 'paused' | 'completed', progress: number, daysCompleted: number, totalDays: number}} = {};

          jsonPlans.forEach((plan: any) => {
            // Calcular días totales contando las sesiones únicas por día de la semana
            const uniqueDays = new Set();
            plan.sessions.forEach((session: any) => {
              uniqueDays.add(session.day_of_week);
            });

            // Calcular días completados basados en el seguimiento
            let daysCompleted = 0;
            plan.sessions.forEach((session: any) => {
              if (session.completion_tracking && session.completion_tracking.length > 0) {
                daysCompleted++;
              }
            });

            const totalDays = uniqueDays.size;
            const progress = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0;

            // Determinar estado basado en progreso
            let status: 'active' | 'paused' | 'completed' = 'active';
            if (progress >= 100) {
              status = 'completed';
            } else if (plan.status === 'paused') {
              status = 'paused';
            }

            initialStatus[plan.plan_id] = {
              status,
              progress,
              daysCompleted,
              totalDays
            };
          });

          setPlanStatus(initialStatus);
        } else {
          console.log('No workout plans found in JSON, trying backend...');

          // Intentar obtener datos del backend como fallback
          try {
            const response = await workoutService.getPlans(1);
            console.log('Workout plans response from backend:', response);

            if (response.data && Array.isArray(response.data.plans)) {
              setWorkoutPlans(response.data.plans);
            } else {
              console.error('No workout plans found in backend');
              setWorkoutPlans([]);
            }
          } catch (apiError) {
            console.error('Error fetching from backend:', apiError);
            setWorkoutPlans([]);
          }
        }
      } catch (error) {
        console.error('Error fetching workout plans:', error);
        setWorkoutPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlans();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (workoutPlans.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No tienes planes de entrenamiento activos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Usa el chat para crear un nuevo plan de entrenamiento
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="workout plans tabs">
          {workoutPlans.map((plan, index) => (
            <Tab
              key={`tab-${index}-${plan.plan_id || Math.random().toString(36).substr(2, 9)}`}
              label={plan.plan_name || `Plan ${index + 1}`}
              id={`workout-tab-${index}`}
            />
          ))}
        </Tabs>
      </Box>

      {workoutPlans.map((plan, index) => (
        <TabPanel
          key={`panel-${index}-${plan.plan_id || Math.random().toString(36).substr(2, 9)}`}
          value={value}
          index={index}
        >
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h5" gutterBottom>
                {plan.plan_name}
              </Typography>

              {planStatus[plan.plan_id] && (
                <Tooltip title={`${planStatus[plan.plan_id].daysCompleted}/${planStatus[plan.plan_id].totalDays} días completados`}>
                  <Chip
                    icon={
                      planStatus[plan.plan_id].status === 'completed' ? <DoneAllIcon /> :
                      planStatus[plan.plan_id].status === 'paused' ? <PauseCircleIcon /> :
                      <PlayCircleIcon />
                    }
                    label={
                      planStatus[plan.plan_id].status === 'completed' ? 'Completado' :
                      planStatus[plan.plan_id].status === 'paused' ? 'Pausado' :
                      'Activo'
                    }
                    color={
                      planStatus[plan.plan_id].status === 'completed' ? 'success' :
                      planStatus[plan.plan_id].status === 'paused' ? 'warning' :
                      'primary'
                    }
                    size="small"
                  />
                </Tooltip>
              )}
            </Box>

            <Typography variant="body1" color="text.secondary" paragraph>
              {plan.description}
            </Typography>

            {/* Información de duración del plan */}
            <Box sx={{ mt: 2, mb: 3, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Fecha inicio:
                  </Typography>
                  <Typography variant="body2">
                    {plan.start_date || '01/01/2023'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Fecha fin:
                  </Typography>
                  <Typography variant="body2">
                    {plan.end_date || '31/03/2023'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Días programados:
                  </Typography>
                  <Typography variant="body2">
                    {plan.days_to_follow || 30} días
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Frecuencia:
                  </Typography>
                  <Typography variant="body2">
                    {plan.frequency || 'Lun, Mié, Vie'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {planStatus[plan.plan_id] && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progreso: {Math.round(planStatus[plan.plan_id].progress)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {planStatus[plan.plan_id].daysCompleted}/{planStatus[plan.plan_id].totalDays} días
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={planStatus[plan.plan_id].progress}
                  color={
                    planStatus[plan.plan_id].status === 'completed' ? 'success' :
                    planStatus[plan.plan_id].status === 'paused' ? 'warning' :
                    'primary'
                  }
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Seguimiento automático de progreso
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {plan.sessions && plan.sessions.map((session: any) => (
              <Grid item xs={12} md={6} key={session.session_id}>
                <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {session.day_of_week}
                    </Typography>
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={`${session.duration_minutes} min`}
                      size="small"
                      color="secondary"
                    />
                  </Box>

                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {session.focus_area}
                  </Typography>

                  <List dense>
                    {session.exercises && session.exercises.map((exercise: any) => {
                      // Obtener detalles del ejercicio si está disponible
                      const exerciseDetails = jsonDataService.getExerciseById(exercise.exercise_id);
                      const exerciseName = exerciseDetails ? exerciseDetails.name : exercise.name || 'Ejercicio';

                      return (
                        <ListItem key={exercise.workout_exercise_id}>
                          <ListItemIcon>
                            <FitnessCenterIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={exerciseName}
                            secondary={`${exercise.sets} series × ${exercise.reps || '-'} reps | Descanso: ${exercise.rest_seconds || '-'} seg`}
                          />
                        </ListItem>
                      );
                    })}
                  </List>

                  {/* Seguimiento de completado - Gestionado automáticamente por IA */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Estado de seguimiento:
                    </Typography>
                    {session.completion_tracking && session.completion_tracking.length > 0 ? (
                      <Box>
                        <Chip
                          icon={<CheckCircleIcon />}
                          label={`Último: ${session.completion_tracking.slice(-1)[0].date} - ${session.completion_tracking.slice(-1)[0].completion_time || 'Completado'}`}
                          color="success"
                          size="small"
                          sx={{ mt: 1, mb: 1 }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                          Seguimiento automático - {session.completion_tracking.length} sesiones registradas
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Chip
                          icon={<PlayCircleIcon />}
                          label={`Programado para ${session.day_of_week}`}
                          color="primary"
                          size="small"
                          sx={{ mt: 1, mb: 1 }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                          Se registrará automáticamente cuando se complete
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      ))}
    </Box>
  );
};

export default WorkoutPlansView;
