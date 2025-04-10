import { useState, useEffect } from 'react';
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
  Button
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

const ExercisesView = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [exercisesByMuscle, setExercisesByMuscle] = useState<ExercisesByMuscleGroup>({});
  const [loading, setLoading] = useState(true);
  const [expandedMuscleGroup, setExpandedMuscleGroup] = useState<string | false>(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);

        // Intentar obtener datos del backend
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
  }, []);

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
        <Typography variant="h5" gutterBottom>
          Biblioteca de Ejercicios
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Biblioteca completa de ejercicios para tus rutinas de entrenamiento
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

                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          fullWidth
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

      <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Ejercicios Destacados
      </Typography>

      {/* Featured exercises */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Ejercicios recomendados para tus objetivos actuales
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List>
          {exercises.slice(0, 5).map((exercise) => (
            <ListItem key={exercise.exercise_id}>
              <ListItemIcon>
                <FitnessCenterIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={exercise.name}
                secondary={`${exercise.muscle_group} | ${exercise.difficulty_level}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default ExercisesView;
