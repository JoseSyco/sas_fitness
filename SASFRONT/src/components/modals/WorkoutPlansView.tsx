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
  CircularProgress
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { workoutService } from '../../services/api';

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
        const response = await workoutService.getPlans(1); // Usando el ID de usuario 1 para desarrollo
        setWorkoutPlans(response.data.plans);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
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
            <Tab key={plan.plan_id} label={plan.plan_name} id={`workout-tab-${index}`} />
          ))}
        </Tabs>
      </Box>

      {workoutPlans.map((plan, index) => (
        <TabPanel key={plan.plan_id} value={value} index={index}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {plan.plan_name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {plan.description}
            </Typography>
            {plan.is_ai_generated && (
              <Chip
                label="Generado por IA"
                color="primary"
                size="small"
                sx={{ mb: 2 }}
              />
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
                    {session.exercises && session.exercises.map((exercise: any) => (
                      <ListItem key={exercise.workout_exercise_id}>
                        <ListItemIcon>
                          <FitnessCenterIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={exercise.name}
                          secondary={`${exercise.sets} series × ${exercise.reps || '-'} reps | Descanso: ${exercise.rest_seconds || '-'} seg`}
                        />
                      </ListItem>
                    ))}
                  </List>
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
