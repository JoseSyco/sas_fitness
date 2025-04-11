import { useState, useEffect } from 'react';
import { TrackingStatus } from '../../types/tracking';
import {
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Button,
  LinearProgress,
  Chip,
  Divider
} from '@mui/material';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { userService, workoutService } from '../../services/api';
import jsonDataService from '../../services/jsonDataService';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

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
      id={`progress-tabpanel-${index}`}
      aria-labelledby={`progress-tab-${index}`}
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

const ProgressView = () => {
  const [tabValue, setTabValue] = useState(0);
  const [nutritionTabValue, setNutritionTabValue] = useState(0);
  const [mealTabValue, setMealTabValue] = useState(0);
  const [workoutTabValue, setWorkoutTabValue] = useState(0);
  const [sessionTabValue, setSessionTabValue] = useState(0);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeasurement, setSelectedMeasurement] = useState<any>(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);

        // Intentar obtener datos del backend
        try {
          const [progressRes, workoutLogsRes, workoutPlansRes, nutritionPlansRes] = await Promise.all([
            userService.getProgressHistory(),
            workoutService.getWorkoutLogs(),
            workoutService.getPlans(1),
            userService.getNutritionPlans()
          ]);

          console.log('Progress data response:', progressRes);
          console.log('Workout logs response:', workoutLogsRes);
          console.log('Workout plans response:', workoutPlansRes);
          console.log('Nutrition plans response:', nutritionPlansRes);

          if (progressRes.data && Array.isArray(progressRes.data.progress) &&
              workoutLogsRes.data && Array.isArray(workoutLogsRes.data.logs) &&
              workoutPlansRes.data && Array.isArray(workoutPlansRes.data.plans) &&
              nutritionPlansRes.data && Array.isArray(nutritionPlansRes.data.plans)) {

            // Sort by date
            const sortedProgress = progressRes.data.progress.sort(
              (a: any, b: any) => new Date(a.tracking_date).getTime() - new Date(b.tracking_date).getTime()
            );

            const sortedWorkoutLogs = workoutLogsRes.data.logs.sort(
              (a: any, b: any) => new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime()
            );

            setProgressData(sortedProgress);
            setWorkoutLogs(sortedWorkoutLogs);
            setWorkoutPlans(workoutPlansRes.data.plans);
            setNutritionPlans(nutritionPlansRes.data.plans);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('Usando datos JSON como fallback para progreso:', apiError);
        }

        // Si falla la llamada al backend, usar datos JSON
        try {
          const jsonProgress = await jsonDataService.getProgress();
          const jsonWorkoutLogs = jsonDataService.getWorkoutLogs();
          const jsonWorkoutPlans = await jsonDataService.getWorkoutPlans();
          const jsonNutritionPlans = await jsonDataService.getNutritionPlans();

          console.log('Progress data from JSON:', jsonProgress);
          console.log('Workout logs from JSON:', jsonWorkoutLogs);
          console.log('Workout plans from JSON:', jsonWorkoutPlans);
          console.log('Nutrition plans from JSON:', jsonNutritionPlans);

          // Verificar que los datos JSON tienen el formato correcto
          if (Array.isArray(jsonProgress)) {
            // Sort by date
            const sortedProgress = jsonProgress.sort(
              (a: any, b: any) => new Date(a.tracking_date).getTime() - new Date(b.tracking_date).getTime()
            );
            setProgressData(sortedProgress);
          } else {
            console.error('Formato de datos JSON inesperado para progreso:', jsonProgress);
            setProgressData([]);
          }

          if (Array.isArray(jsonWorkoutLogs)) {
            const sortedWorkoutLogs = jsonWorkoutLogs.sort(
              (a: any, b: any) => new Date(b.workout_date || '').getTime() - new Date(a.workout_date || '').getTime()
            );
            setWorkoutLogs(sortedWorkoutLogs);
          } else {
            console.error('Formato de datos JSON inesperado para logs de entrenamiento:', jsonWorkoutLogs);
            setWorkoutLogs([]);
          }

          if (Array.isArray(jsonWorkoutPlans)) {
            setWorkoutPlans(jsonWorkoutPlans);
          } else {
            console.error('Formato de datos JSON inesperado para planes de entrenamiento:', jsonWorkoutPlans);
            setWorkoutPlans([]);
          }

          if (Array.isArray(jsonNutritionPlans)) {
            setNutritionPlans(jsonNutritionPlans);
          } else {
            console.error('Formato de datos JSON inesperado para planes de nutrición:', jsonNutritionPlans);
            setNutritionPlans([]);
          }
        } catch (jsonError) {
          console.error('Error al cargar datos JSON de progreso:', jsonError);
          setProgressData([]);
          setWorkoutLogs([]);
          setWorkoutPlans([]);
          setNutritionPlans([]);
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setProgressData([]);
        setWorkoutLogs([]);
        setWorkoutPlans([]);
        setNutritionPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNutritionTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setNutritionTabValue(newValue);
    setMealTabValue(0); // Reset meal tab when changing nutrition plan
  };

  const handleMealTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setMealTabValue(newValue);
  };

  const handleWorkoutTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setWorkoutTabValue(newValue);
    setSessionTabValue(0); // Reset session tab when changing workout plan
  };

  const handleSessionTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSessionTabValue(newValue);
  };

  // Format data for charts
  const weightChartData = progressData.map(entry => ({
    date: new Date(entry.tracking_date).toLocaleDateString(),
    weight: entry.weight
  }));

  const bodyFatChartData = progressData
    .filter(entry => entry.body_fat_percentage)
    .map(entry => ({
      date: new Date(entry.tracking_date).toLocaleDateString(),
      bodyFat: entry.body_fat_percentage
    }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (progressData.length === 0 && workoutLogs.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No hay datos de progreso disponibles
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Usa el chat para registrar tu peso, medidas o entrenamientos
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="progress tabs">
          <Tab label="Progreso de Medidas" id="progress-tab-0" />
          <Tab label="Historial de Planes" id="progress-tab-1" />
          <Tab label="Historial de Nutrición" id="progress-tab-2" />
        </Tabs>
      </Box>

      {/* Progreso de Medidas Tab - Combinación de gráficos y tabla */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h6">Progreso de Medidas</Typography>
        </Box>

        {/* Gráfico y Detalles */}
        <Box sx={{ display: 'flex', flexDirection: 'row', mb: 4 }}>
          {/* Gráfica de Peso - 50% del ancho */}
          <Box sx={{ width: '50%', pr: 1.5 }}>
            {weightChartData.length > 0 && (
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Progreso de Peso
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={weightChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      onClick={(data) => {
                        if (data && data.activePayload && data.activePayload[0]) {
                          const clickedData = data.activePayload[0].payload;
                          const matchingEntry = progressData.find(
                            entry => new Date(entry.tracking_date).toLocaleDateString() === clickedData.date
                          );
                          setSelectedMeasurement(matchingEntry || null);
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        name="Peso (kg)"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            )}
          </Box>

          {/* Panel de detalles de la medida seleccionada (visible solo cuando se selecciona un punto) - 50% del ancho */}
          <Box sx={{ width: '50%', pl: 1.5 }}>
            {selectedMeasurement ? (
              <Paper elevation={2} sx={{ p: 2, height: '100%', minHeight: 300 }}>
                <Typography variant="h6" gutterBottom>
                  Detalles
                </Typography>
                <Box>
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: '120px' }}>
                        Grasa Corporal:
                      </Typography>
                      <Typography variant="body1">
                        {selectedMeasurement.body_fat_percentage || '-'}%
                      </Typography>
                    </Box>
                  </Box>

                  {selectedMeasurement.measurements && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Medidas:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pl: 2 }}>
                        <Typography variant="body2">
                          Cintura: {selectedMeasurement.measurements.waist}cm
                        </Typography>
                        <Typography variant="body2">
                          Pecho: {selectedMeasurement.measurements.chest}cm
                        </Typography>
                        {selectedMeasurement.measurements.arms && (
                          <Typography variant="body2">
                            Brazos: {selectedMeasurement.measurements.arms}cm
                          </Typography>
                        )}
                        {selectedMeasurement.measurements.legs && (
                          <Typography variant="body2">
                            Piernas: {selectedMeasurement.measurements.legs}cm
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  {selectedMeasurement.notes && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Notas:
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography variant="body2">
                          {selectedMeasurement.notes}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            ) : (
              <Box sx={{ height: '100%', minHeight: 300 }} />
            )}
          </Box>
        </Box>


      </TabPanel>

      {/* Historial de Planes Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Historial de Seguimiento de Rutinas
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Aquí puedes ver el historial detallado de seguimiento de tus planes de entrenamiento y sesiones.
          </Typography>

          {workoutPlans && workoutPlans.length > 0 ? (
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  value={workoutTabValue}
                  onChange={handleWorkoutTabChange}
                  aria-label="workout plans tabs"
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {workoutPlans.map((plan: any, index: number) => (
                    <Tab key={plan.plan_id} label={plan.plan_name} id={`workout-tab-${index}`} />
                  ))}
                </Tabs>
              </Box>

              {workoutPlans.map((plan: any, planIndex: number) => (
                <div
                  key={plan.plan_id}
                  role="tabpanel"
                  hidden={workoutTabValue !== planIndex}
                  id={`workout-tabpanel-${planIndex}`}
                  aria-labelledby={`workout-tab-${planIndex}`}
                >
                  {workoutTabValue === planIndex && (
                    <Box sx={{ p: 2 }}>
                      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          {plan.plan_name}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {plan.description}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2">Fecha Inicio:</Typography>
                            <Typography variant="body1">{plan.start_date || '01/01/2023'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2">Fecha Fin:</Typography>
                            <Typography variant="body1">{plan.end_date || '31/03/2023'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2">Días Programados:</Typography>
                            <Typography variant="body1">{plan.days_to_follow || 30} días</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2">Frecuencia:</Typography>
                            <Typography variant="body1">{plan.frequency || 'Lun, Mié, Vie'}</Typography>
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Tabs para las sesiones */}
                      {plan.sessions && plan.sessions.length > 0 && (
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                            <Tabs
                              value={sessionTabValue}
                              onChange={handleSessionTabChange}
                              aria-label="session tabs"
                              variant="scrollable"
                              scrollButtons="auto"
                            >
                              {plan.sessions.map((session: any, index: number) => (
                                <Tab key={session.session_id} label={`${session.day_of_week} - ${session.focus_area}`} id={`session-tab-${index}`} />
                              ))}
                            </Tabs>
                          </Box>

                          {plan.sessions.map((session: any, sessionIndex: number) => (
                            <div
                              key={session.session_id}
                              role="tabpanel"
                              hidden={sessionTabValue !== sessionIndex}
                              id={`session-tabpanel-${sessionIndex}`}
                              aria-labelledby={`session-tab-${sessionIndex}`}
                            >
                              {sessionTabValue === sessionIndex && (
                                <Box sx={{ p: 2 }}>
                                  <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                                    <Grid container spacing={3}>
                                      <Grid item xs={12} md={6}>
                                        <Typography variant="h6" gutterBottom>
                                          {session.focus_area}
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                          Día: {session.day_of_week}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                          <Chip icon={<AccessTimeIcon />} label={`${session.duration_minutes} min`} color="secondary" size="small" />
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </Paper>

                                  {/* Lista de ejercicios */}
                                  <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                                    <Typography variant="h6" gutterBottom color="primary">
                                      Ejercicios
                                    </Typography>
                                    <List dense>
                                      {session.exercises && session.exercises.map((exercise: any) => {
                                        // Usamos el nombre del ejercicio directamente del objeto exercise
                                        // ya que getExerciseById ahora es asíncrono
                                        const exerciseName = exercise.name || 'Ejercicio';

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
                                  </Paper>

                                  {/* Historial de seguimiento */}
                                  <Paper elevation={2} sx={{ p: 2 }}>
                                    <Typography variant="h6" gutterBottom color="primary">
                                      Historial de Seguimiento
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Fecha</TableCell>
                                            <TableCell>Día</TableCell>
                                            <TableCell>Estado</TableCell>
                                            <TableCell>Hora</TableCell>
                                            <TableCell>Notas</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {session.completion_tracking && session.completion_tracking.length > 0 ? (
                                            session.completion_tracking.map((tracking: any, index: number) => {
                                              let statusChip;
                                              switch(tracking.status) {
                                                case TrackingStatus.COMPLETED:
                                                  statusChip = <Chip icon={<CheckCircleIcon />} label="Completado" size="small" color="success" />;
                                                  break;
                                                case TrackingStatus.NOT_COMPLETED:
                                                default:
                                                  statusChip = <Chip icon={<CancelIcon />} label="No Completado" size="small" color="warning" />;
                                              }

                                              return (
                                                <TableRow key={index}>
                                                  <TableCell>{tracking.date}</TableCell>
                                                  <TableCell>{tracking.day_of_week}</TableCell>
                                                  <TableCell>{statusChip}</TableCell>
                                                  <TableCell>{tracking.completion_time || '-'}</TableCell>
                                                  <TableCell>{tracking.notes || '-'}</TableCell>
                                                </TableRow>
                                              );
                                            })
                                          ) : (
                                            <TableRow>
                                              <TableCell colSpan={5} align="center">
                                                <Typography variant="body2" color="text.secondary">
                                                  No hay registros de seguimiento disponibles.
                                                </Typography>
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Paper>
                                </Box>
                              )}
                            </div>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </div>
              ))}
            </Box>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No hay planes de entrenamiento disponibles.
              </Typography>
            </Box>
          )}
        </Box>
      </TabPanel>



      {/* Historial de Nutrición Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Historial de Seguimiento de Nutrición
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Aquí puedes ver el historial detallado de seguimiento de tus planes de nutrición y comidas.
          </Typography>

          {nutritionPlans && nutritionPlans.length > 0 ? (
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  value={nutritionTabValue}
                  onChange={handleNutritionTabChange}
                  aria-label="nutrition plans tabs"
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {nutritionPlans.map((plan: any, index: number) => (
                    <Tab key={plan.nutrition_plan_id} label={plan.plan_name} id={`nutrition-tab-${index}`} />
                  ))}
                </Tabs>
              </Box>

              {nutritionPlans.map((plan: any, planIndex: number) => (
                <div
                  key={plan.nutrition_plan_id}
                  role="tabpanel"
                  hidden={nutritionTabValue !== planIndex}
                  id={`nutrition-tabpanel-${planIndex}`}
                  aria-labelledby={`nutrition-tab-${planIndex}`}
                >
                  {nutritionTabValue === planIndex && (
                    <Box sx={{ p: 2 }}>
                      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          {plan.plan_name}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {plan.description}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2">Calorías Diarias:</Typography>
                            <Typography variant="body1">{plan.daily_calories} kcal</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2">Proteínas:</Typography>
                            <Typography variant="body1">{plan.protein_grams}g</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2">Carbohidratos:</Typography>
                            <Typography variant="body1">{plan.carbs_grams}g</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2">Grasas:</Typography>
                            <Typography variant="body1">{plan.fat_grams}g</Typography>
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Tabs para las comidas */}
                      {plan.meals && plan.meals.length > 0 && (
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                            <Tabs
                              value={mealTabValue}
                              onChange={handleMealTabChange}
                              aria-label="meal tabs"
                              variant="scrollable"
                              scrollButtons="auto"
                            >
                              {plan.meals.map((meal: any, index: number) => (
                                <Tab key={meal.meal_id} label={meal.meal_name} id={`meal-tab-${index}`} />
                              ))}
                            </Tabs>
                          </Box>

                          {plan.meals.map((meal: any, mealIndex: number) => (
                            <div
                              key={meal.meal_id}
                              role="tabpanel"
                              hidden={mealTabValue !== mealIndex}
                              id={`meal-tabpanel-${mealIndex}`}
                              aria-labelledby={`meal-tab-${mealIndex}`}
                            >
                              {mealTabValue === mealIndex && (
                                <Box sx={{ p: 2 }}>
                                  <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                                    <Grid container spacing={3}>
                                      <Grid item xs={12} md={6}>
                                        <Typography variant="h6" gutterBottom>
                                          {meal.meal_name}
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                          {meal.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                          <Chip label={`${meal.calories} kcal`} color="secondary" size="small" />
                                          <Chip label={`P: ${meal.protein_grams}g`} size="small" sx={{ backgroundColor: '#ffebee' }} />
                                          <Chip label={`C: ${meal.carbs_grams}g`} size="small" sx={{ backgroundColor: '#e3f2fd' }} />
                                          <Chip label={`G: ${meal.fat_grams}g`} size="small" sx={{ backgroundColor: '#fff8e1' }} />
                                        </Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Hora programada: {meal.scheduled_time}
                                        </Typography>
                                      </Grid>


                                    </Grid>
                                  </Paper>

                                  {/* Historial de seguimiento */}
                                  {(
                                    <Paper elevation={2} sx={{ p: 2 }}>
                                      <Typography variant="h6" gutterBottom color="primary">
                                        Historial de Seguimiento
                                      </Typography>
                                      <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                          <TableHead>
                                            <TableRow>
                                              <TableCell>Fecha</TableCell>
                                              <TableCell>Día</TableCell>
                                              <TableCell>Estado</TableCell>
                                              <TableCell>Hora</TableCell>
                                              <TableCell>Notas</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {meal.completion_tracking && meal.completion_tracking.length > 0 ? (
                                              meal.completion_tracking.map((tracking: any, index: number) => {
                                                let statusChip;
                                                switch(tracking.status) {
                                                  case TrackingStatus.COMPLETED:
                                                    statusChip = <Chip icon={<CheckCircleIcon />} label="Completado" size="small" color="success" />;
                                                    break;
                                                  case TrackingStatus.NOT_COMPLETED:
                                                  default:
                                                    statusChip = <Chip icon={<CancelIcon />} label="No Completado" size="small" color="warning" />;
                                                }

                                                return (
                                                  <TableRow key={index}>
                                                    <TableCell>{tracking.date}</TableCell>
                                                    <TableCell>{tracking.day_of_week}</TableCell>
                                                    <TableCell>{statusChip}</TableCell>
                                                    <TableCell>{tracking.completion_time || '-'}</TableCell>
                                                    <TableCell>{tracking.notes || '-'}</TableCell>
                                                  </TableRow>
                                                );
                                              })
                                            ) : (
                                              <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                  <Typography variant="body2" color="text.secondary">
                                                    No hay registros de seguimiento disponibles.
                                                  </Typography>
                                                </TableCell>
                                              </TableRow>
                                            )}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    </Paper>
                                  )}
                                </Box>
                              )}
                            </div>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </div>
              ))}
            </Box>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No hay planes de nutrición disponibles.
              </Typography>
            </Box>
          )}
        </Box>
      </TabPanel>
    </Box>
  );
};

export default ProgressView;
