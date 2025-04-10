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
  Button
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
            <Typography variant="h5" gutterBottom>
              {plan.plan_name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {plan.description}
            </Typography>

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

                  {/* Seguimiento de completado */}
                  {session.completion_tracking && session.completion_tracking.length > 0 ? (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Último completado:
                      </Typography>
                      {session.completion_tracking.slice(-1).map((tracking: any, idx: number) => (
                        <Chip
                          key={idx}
                          icon={<CheckCircleIcon />}
                          label={`${tracking.date} - ${tracking.completion_time || 'Completado'}`}
                          color="success"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      sx={{ mt: 2 }}
                    >
                      Marcar como completado
                    </Button>
                  )}
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
