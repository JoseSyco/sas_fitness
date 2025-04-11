import { useState, useEffect } from 'react';
import ExerciseHistoryModal from './ExerciseHistoryModal';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { workoutService } from '../../services/api';
import jsonDataService from '../../services/jsonDataService';

// Mock exercise images for demo
const exerciseImages: Record<string, string> = {
  'chest': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
  'back': 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80',
  'legs': 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1746&q=80',
  'shoulders': 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
  'arms': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
  'core': 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1738&q=80',
  'cardio': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
  'default': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
};

const getExerciseImage = (muscleGroup: string) => {
  const group = muscleGroup.toLowerCase();
  for (const key of Object.keys(exerciseImages)) {
    if (group.includes(key)) {
      return exerciseImages[key];
    }
  }
  return exerciseImages.default;
};

interface ExercisesByMuscleGroup {
  [key: string]: any[];
}

interface ExerciseProgress {
  date: string;
  completed: boolean;
  sets_completed: number;
  reps_completed: number;
  weight_used: number;
  notes: string;
}

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
      id={`exercise-tabpanel-${index}`}
      aria-labelledby={`exercise-tab-${index}`}
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

interface ExercisesViewProps {
  planId?: number;
}

const ExercisesView = ({ planId }: ExercisesViewProps) => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [exercisesByMuscle, setExercisesByMuscle] = useState<ExercisesByMuscleGroup>({});
  const [loading, setLoading] = useState(true);
  const [expandedMuscleGroup, setExpandedMuscleGroup] = useState<string | false>(false);
  const [tabValue, setTabValue] = useState(0);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [openProgressDialog, setOpenProgressDialog] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [progressData, setProgressData] = useState<ExerciseProgress>({
    date: new Date().toISOString().split('T')[0],
    completed: false,
    sets_completed: 0,
    reps_completed: 0,
    weight_used: 0,
    notes: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenProgressDialog = (exercise: any) => {
    setSelectedExercise(exercise);
    setOpenProgressDialog(true);
  };

  const handleCloseProgressDialog = () => {
    setOpenProgressDialog(false);
  };

  const handleOpenHistoryModal = (exercise: any) => {
    console.log('Abriendo modal de detalles en ExercisesView:', { exercise });
    setSelectedExercise(exercise);
    setOpenHistoryModal(true);
  };

  const handleCloseHistoryModal = () => {
    setOpenHistoryModal(false);
  };

  const handleSaveProgress = () => {
    // Aquí se guardaría el progreso en la base de datos
    // Por ahora solo mostramos en consola
    console.log('Guardando progreso para ejercicio:', selectedExercise?.name);
    console.log('Datos de progreso:', progressData);

    // Cerrar el diálogo
    handleCloseProgressDialog();

    // Reiniciar el formulario
    setProgressData({
      date: new Date().toISOString().split('T')[0],
      completed: false,
      sets_completed: 0,
      reps_completed: 0,
      weight_used: 0,
      notes: ''
    });
  };

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);

        // Si hay un planId, intentar obtener los ejercicios específicos para ese plan
        if (planId) {
          try {
            // Primero intentamos obtener el plan de entrenamiento
            const workoutPlan = await jsonDataService.getWorkoutPlanById(planId);
            console.log('Plan de entrenamiento obtenido:', workoutPlan);

            // Guardar el plan activo en el estado
            setActivePlan(workoutPlan);
            console.log('Plan activo establecido:', workoutPlan);
            console.log('Nombre del plan:', workoutPlan?.plan_name);

            if (workoutPlan && workoutPlan.sessions) {
              // Extraer todos los ejercicios de todas las sesiones del plan
              const planExercises: any[] = [];
              const exerciseIds = new Set();

              // Recorrer todas las sesiones y recopilar los IDs de ejercicios únicos
              workoutPlan.sessions.forEach((session: any) => {
                if (session.exercises && Array.isArray(session.exercises)) {
                  session.exercises.forEach((exercise: any) => {
                    if (exercise.exercise_id && !exerciseIds.has(exercise.exercise_id)) {
                      exerciseIds.add(exercise.exercise_id);
                    }
                  });
                }
              });

              // Obtener los detalles completos de cada ejercicio
              const exercisesWithDetails = await Promise.all(
                Array.from(exerciseIds).map(async (id: any) => {
                  try {
                    const exerciseDetails = await jsonDataService.getExerciseById(id);
                    return exerciseDetails;
                  } catch (error) {
                    console.error(`Error al obtener detalles del ejercicio ${id}:`, error);
                    return null;
                  }
                })
              );

              // Filtrar los ejercicios nulos y agruparlos por grupo muscular
              const filteredExercises = exercisesWithDetails.filter(ex => ex !== null);
              setExercises(filteredExercises);

              // Agrupar por grupo muscular
              const groupedExercises: ExercisesByMuscleGroup = {};
              filteredExercises.forEach((exercise: any) => {
                const muscleGroup = exercise.muscle_group || 'Sin categoría';
                if (!groupedExercises[muscleGroup]) {
                  groupedExercises[muscleGroup] = [];
                }
                groupedExercises[muscleGroup].push(exercise);
              });

              setExercisesByMuscle(groupedExercises);
              setLoading(false);
              return;
            }
          } catch (planError) {
            console.error('Error al obtener ejercicios del plan:', planError);
          }
        }

        // Si no hay planId o hubo un error, intentar obtener todos los ejercicios del backend
        try {
          const response = await workoutService.getExercises();
          console.log('Exercises response:', response);

          if (response.data && Array.isArray(response.data.exercises)) {
            setExercises(response.data.exercises);

            // Group exercises by muscle group
            const groupedExercises: ExercisesByMuscleGroup = {};
            response.data.exercises.forEach((exercise: any) => {
              if (!groupedExercises[exercise.muscle_group]) {
                groupedExercises[exercise.muscle_group] = [];
              }
              groupedExercises[exercise.muscle_group].push(exercise);
            });

            setExercisesByMuscle(groupedExercises);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('Usando datos JSON como fallback para ejercicios:', apiError);
        }

        // Si falla la llamada al backend, usar datos JSON
        try {
          const jsonExercises = await jsonDataService.getExercises();
          console.log('Exercises from JSON:', jsonExercises);

          // Verificar que los datos JSON tienen el formato correcto
          if (Array.isArray(jsonExercises)) {
            setExercises(jsonExercises);

            // Group exercises by muscle group
            const groupedExercises: ExercisesByMuscleGroup = {};
            jsonExercises.forEach((exercise: any) => {
              const muscleGroup = exercise.muscle_group || 'Sin categoría';
              if (!groupedExercises[muscleGroup]) {
                groupedExercises[muscleGroup] = [];
              }
              groupedExercises[muscleGroup].push(exercise);
            });

            setExercisesByMuscle(groupedExercises);
          } else {
            console.error('Formato de datos JSON inesperado:', jsonExercises);
            setExercises([]);
            setExercisesByMuscle({});
          }
        } catch (jsonError) {
          console.error('Error al cargar datos JSON de ejercicios:', jsonError);
          setExercises([]);
          setExercisesByMuscle({});
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setExercises([]);
        setExercisesByMuscle({});
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [planId]);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedMuscleGroup(isExpanded ? panel : false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (exercises.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No hay ejercicios disponibles
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Usa el chat para solicitar información sobre ejercicios específicos
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Ejercicios - {activePlan ? activePlan.plan_name : 'Plan Activo'}
        </Typography>
      </Box>

      <TabPanel value={0} index={0}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Explora los ejercicios disponibles para este plan. Encuentra información detallada, instrucciones y consejos para cada ejercicio.
          </Typography>
        </Box>

        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 3, mb: 2 }}>
          Ejercicios por Grupo Muscular
        </Typography>

      {/* Exercises by muscle group */}
      {Object.keys(exercisesByMuscle).map((muscleGroup) => (
        <Accordion
          key={muscleGroup}
          expanded={expandedMuscleGroup === muscleGroup}
          onChange={handleAccordionChange(muscleGroup)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${muscleGroup}-content`}
            id={`${muscleGroup}-header`}
          >
            <Typography variant="h6">{muscleGroup}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {exercisesByMuscle[muscleGroup].map((exercise) => (
                <Grid item xs={12} sm={6} md={4} key={exercise.exercise_id}>
                  <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={getExerciseImage(exercise.muscle_group)}
                      alt={exercise.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {exercise.name}
                      </Typography>

                      <Chip
                        label={exercise.difficulty_level}
                        size="small"
                        color={
                          exercise.difficulty_level === 'beginner' ? 'success' :
                          exercise.difficulty_level === 'intermediate' ? 'warning' : 'error'
                        }
                        sx={{ mb: 2 }}
                      />

                      <Typography variant="body2" color="text.secondary">
                        {exercise.description}
                      </Typography>

                      {exercise.equipment_needed && (
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          <strong>Equipo necesario:</strong> {exercise.equipment_needed}
                        </Typography>
                      )}

                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => {
                            console.log('Ejercicio seleccionado para ver detalles en biblioteca:', exercise);
                            // Asegurarse de que el ejercicio tenga todos los detalles
                            if (exercise.exercise_id) {
                              jsonDataService.getExerciseById(exercise.exercise_id)
                                .then(fullExercise => {
                                  if (fullExercise) {
                                    console.log('Ejercicio completo obtenido:', fullExercise);
                                    handleOpenHistoryModal(fullExercise);
                                  } else {
                                    handleOpenHistoryModal(exercise);
                                  }
                                })
                                .catch(error => {
                                  console.error('Error al obtener ejercicio completo:', error);
                                  handleOpenHistoryModal(exercise);
                                });
                            } else {
                              handleOpenHistoryModal(exercise);
                            }
                          }}
                        >
                          Ver detalles
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      </TabPanel>

      {/* Dialog for viewing exercise progress history */}
      <Dialog open={openProgressDialog} onClose={handleCloseProgressDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Historial de Progreso: {selectedExercise?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Historial de Seguimiento
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              El sistema registra automáticamente tu progreso para este ejercicio. Aquí puedes ver el historial completo.
            </Typography>

            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'white' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">12</Typography>
                  <Typography variant="body2">Sesiones</Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">4</Typography>
                  <Typography variant="body2">Series promedio</Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">10</Typography>
                  <Typography variant="body2">Reps promedio</Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ textAlign: 'center' }}>
                  <Typography variant="h4">75kg</Typography>
                  <Typography variant="body2">Peso máximo</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="h6" gutterBottom>
              Historial de Sesiones
            </Typography>

            <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
              <List>
                {/* Datos de ejemplo - en una implementación real vendrían de la base de datos */}
                {[
                  { date: '2023-04-10', sets: 4, reps: 12, weight: 70, notes: 'Buena sesión, aumenté el peso' },
                  { date: '2023-04-03', sets: 4, reps: 10, weight: 65, notes: 'Sesión normal' },
                  { date: '2023-03-27', sets: 3, reps: 12, weight: 65, notes: 'Un poco cansado hoy' },
                  { date: '2023-03-20', sets: 4, reps: 10, weight: 60, notes: 'Primera vez con este peso' },
                  { date: '2023-03-13', sets: 3, reps: 12, weight: 55, notes: 'Empezando con este ejercicio' }
                ].map((session, index) => (
                  <Paper key={index} elevation={0} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={2}>
                        <Typography variant="subtitle2">{session.date}</Typography>
                      </Grid>
                      <Grid item xs={4} sm={1}>
                        <Typography variant="body2">{session.sets} series</Typography>
                      </Grid>
                      <Grid item xs={4} sm={1}>
                        <Typography variant="body2">{session.reps} reps</Typography>
                      </Grid>
                      <Grid item xs={4} sm={1}>
                        <Typography variant="body2">{session.weight} kg</Typography>
                      </Grid>
                      <Grid item xs={12} sm={7}>
                        <Typography variant="body2" color="text.secondary">{session.notes}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </List>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              El seguimiento es gestionado automáticamente basado en tus rutinas completadas
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProgressDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal para mostrar el historial detallado */}
      <ExerciseHistoryModal
        open={openHistoryModal}
        onClose={handleCloseHistoryModal}
        exercise={selectedExercise}
        session={null}
      />
    </Box>
  );
};

export default ExercisesView;
