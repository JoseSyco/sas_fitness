import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
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

interface SessionExercisesModalProps {
  open: boolean;
  onClose: () => void;
  session: any;
}

const SessionExercisesModal = ({ open, onClose, session }: SessionExercisesModalProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && open) {
      setLoading(true);
      console.log('Modal de sesión abierto con sesión:', session);

      // Obtener los detalles completos de cada ejercicio
      const fetchExerciseDetails = async () => {
        if (!session.exercises || session.exercises.length === 0) {
          setExercises([]);
          setLoading(false);
          return;
        }

        try {
          const exercisesWithDetails = await Promise.all(
            session.exercises.map(async (exercise: any) => {
              if (exercise.exercise_id) {
                try {
                  const fullExercise = await jsonDataService.getExerciseById(exercise.exercise_id);
                  if (fullExercise) {
                    // Combinar los detalles del ejercicio con la información de la sesión
                    return {
                      ...fullExercise,
                      sets: exercise.sets,
                      reps: exercise.reps,
                      rest_seconds: exercise.rest_seconds
                    };
                  }
                } catch (error) {
                  console.error('Error al obtener detalles del ejercicio:', error);
                }
              }
              return exercise;
            })
          );

          console.log('Ejercicios con detalles:', exercisesWithDetails);
          setExercises(exercisesWithDetails);
        } catch (error) {
          console.error('Error al cargar detalles de ejercicios:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchExerciseDetails();
    }
  }, [session, open]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Si no hay sesión o el modal no está abierto, no renderizar nada
  if (!session || !open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ zIndex: 1500 }} // Asegurar que el modal esté por encima de otros elementos
    >
      <DialogTitle sx={{ m: 0, p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FitnessCenterIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Detalles de Ejercicios: {session.focus_area || session.day_of_week || 'Sesión'}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Cargando detalles de ejercicios...</Typography>
          </Box>
        ) : exercises.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No hay ejercicios disponibles para esta sesión
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="exercise tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                {exercises.map((exercise, index) => (
                  <Tab
                    key={`tab-${index}`}
                    label={exercise.name || `Ejercicio ${index + 1}`}
                    id={`exercise-tab-${index}`}
                    aria-controls={`exercise-tabpanel-${index}`}
                  />
                ))}
              </Tabs>
            </Box>

            {exercises.map((exercise, index) => (
              <TabPanel key={`panel-${index}`} value={tabValue} index={index}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {exercise.name || `Ejercicio ${index + 1}`}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Grupo muscular:
                      </Typography>
                      <Typography variant="body2">
                        {exercise.muscle_group || 'No especificado'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Nivel de dificultad:
                      </Typography>
                      <Typography variant="body2">
                        {exercise.difficulty_level || 'No especificado'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Equipo necesario:
                      </Typography>
                      <Typography variant="body2">
                        {exercise.equipment_needed || 'Ninguno'}
                      </Typography>
                    </Box>
                  </Box>

                  {exercise.instructions && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        Instrucciones:
                      </Typography>
                      {Array.isArray(exercise.instructions) ? (
                        <ol>
                          {exercise.instructions.map((instruction: string, i: number) => (
                            <li key={i}>
                              <Typography variant="body2">{instruction}</Typography>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <Typography variant="body2">{exercise.instructions}</Typography>
                      )}
                    </Box>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Series:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {exercise.sets || '-'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Repeticiones:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {exercise.reps || '-'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Descanso:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {exercise.rest_seconds ? `${exercise.rest_seconds} seg` : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </TabPanel>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExercisesModal;
