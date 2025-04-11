import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Divider from '@mui/material/Divider';
import jsonDataService from '../../services/jsonDataService';

interface ExerciseHistoryModalProps {
  open: boolean;
  onClose: () => void;
  exercise: any;
  session?: any;
}

const ExerciseHistoryModal = ({ open, onClose, exercise, session }: ExerciseHistoryModalProps) => {
  const [exerciseDetails, setExerciseDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (exercise && open) {
      setLoading(true);
      console.log('Modal abierto con ejercicio:', exercise);

      // Cargar los datos de ejercicios
      jsonDataService.getExercises()
        .then(data => {
          console.log('Datos de ejercicios cargados:', data);
          // Buscar el ejercicio por nombre o ID
          let foundExercise = null;

          if (exercise.exercise_id) {
            foundExercise = data.find((e: any) => e.exercise_id === exercise.exercise_id);
          }

          if (!foundExercise && exercise.name) {
            foundExercise = data.find((e: any) => e.name === exercise.name);
          }

          console.log('Ejercicio encontrado:', foundExercise);

          if (foundExercise) {
            setExerciseDetails(foundExercise);
          } else {
            // Si no se encuentra, usar el ejercicio proporcionado
            setExerciseDetails(exercise);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error al cargar los detalles del ejercicio:', error);
          setExerciseDetails(exercise);
          setLoading(false);
        });
    }
  }, [exercise, open]);

  console.log('Renderizando modal con estado:', { open, exercise, exerciseDetails, loading });

  // Si no hay ejercicio o el modal no está abierto, no renderizar nada
  if (!exercise || !open) {
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
              Detalles del Ejercicio: {exerciseDetails?.name || exercise?.name || 'Ejercicio'}
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
        <Box sx={{ mb: 3 }}>
          {session && (
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Detalles de la Sesión
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Día:
                  </Typography>
                  <Typography variant="body1">
                    {session.day_of_week}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Área de enfoque:
                  </Typography>
                  <Typography variant="body1">
                    {session.focus_area}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Detalles del Ejercicio
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Nombre:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {exerciseDetails?.name || exercise?.name || 'Ejercicio'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Grupo muscular:
                </Typography>
                <Typography variant="body1">
                  {exerciseDetails?.muscle_group || exercise?.muscle_group || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Nivel de dificultad:
                </Typography>
                <Typography variant="body1">
                  {exerciseDetails?.difficulty_level === 'beginner' ? 'Principiante' :
                   exerciseDetails?.difficulty_level === 'intermediate' ? 'Intermedio' :
                   exerciseDetails?.difficulty_level === 'advanced' ? 'Avanzado' :
                   exercise?.difficulty_level || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Equipo necesario:
                </Typography>
                <Typography variant="body1">
                  {exerciseDetails?.equipment_needed || exercise?.equipment_needed || 'Ninguno'}
                </Typography>
              </Grid>
              {(exerciseDetails?.description || exercise?.description) && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Descripción:
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {exerciseDetails?.description || exercise?.description}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Divider sx={{ my: 1.5 }} />
              </Grid>
              {(exerciseDetails?.instructions || exercise?.instructions) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>
                    Instrucciones:
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {typeof (exerciseDetails?.instructions || exercise?.instructions) === 'string' ? (
                      <Typography variant="body1">
                        {exerciseDetails?.instructions || exercise?.instructions}
                      </Typography>
                    ) : (
                      <List dense sx={{ pl: 2, pt: 0 }}>
                        {(exerciseDetails?.instructions || exercise?.instructions)?.map((instruction: string, index: number) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <Typography variant="body2">{index + 1}. {instruction}</Typography>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>

          {(exerciseDetails?.benefits || exercise?.benefits) && (
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Beneficios
              </Typography>
              <Box>
                {typeof (exerciseDetails?.benefits || exercise?.benefits) === 'string' ? (
                  <Typography variant="body1">
                    {exerciseDetails?.benefits || exercise?.benefits}
                  </Typography>
                ) : (
                  <List dense sx={{ pl: 2, pt: 0 }}>
                    {(exerciseDetails?.benefits || exercise?.benefits)?.map((benefit: string, index: number) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <Typography variant="body2">• {benefit}</Typography>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          )}

          {(exerciseDetails?.variations || exercise?.variations) && (
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Variaciones
              </Typography>
              <Box>
                {typeof (exerciseDetails?.variations || exercise?.variations) === 'string' ? (
                  <Typography variant="body1">
                    {exerciseDetails?.variations || exercise?.variations}
                  </Typography>
                ) : (
                  <List dense sx={{ pl: 2, pt: 0 }}>
                    {(exerciseDetails?.variations || exercise?.variations)?.map((variation: string, index: number) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <Typography variant="body2">• {variation}</Typography>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          )}

          {(exerciseDetails?.tips || exercise?.tips) && (
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Consejos
              </Typography>
              <Box>
                {typeof (exerciseDetails?.tips || exercise?.tips) === 'string' ? (
                  <Typography variant="body1">
                    {exerciseDetails?.tips || exercise?.tips}
                  </Typography>
                ) : (
                  <List dense sx={{ pl: 2, pt: 0 }}>
                    {(exerciseDetails?.tips || exercise?.tips)?.map((tip: string, index: number) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <Typography variant="body2">• {tip}</Typography>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          )}
        </Box>


      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExerciseHistoryModal;
