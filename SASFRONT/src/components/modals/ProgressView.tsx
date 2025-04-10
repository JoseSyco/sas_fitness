import { useState, useEffect } from 'react';
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
  LinearProgress
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
  const [progressData, setProgressData] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          <Tab label="Gráficos" id="progress-tab-0" />
          <Tab label="Historial de Medidas" id="progress-tab-1" />
          <Tab label="Historial de Entrenamientos" id="progress-tab-2" />
          <Tab label="Historial de Planes" id="progress-tab-3" />
        </Tabs>
      </Box>

      {/* Charts Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {weightChartData.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Progreso de Peso
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={weightChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
            </Grid>
          )}

          {bodyFatChartData.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Progreso de Grasa Corporal
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={bodyFatChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="bodyFat"
                        name="Grasa Corporal (%)"
                        stroke="#82ca9d"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Measurements History Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" color="primary">
            Registrar Nueva Medida
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="measurements table">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Peso (kg)</TableCell>
                <TableCell align="right">Grasa Corporal (%)</TableCell>
                <TableCell>Medidas</TableCell>
                <TableCell>Notas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {progressData.map((entry) => (
                <TableRow
                  key={entry.progress_id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {new Date(entry.tracking_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">{entry.weight}</TableCell>
                  <TableCell align="right">{entry.body_fat_percentage || '-'}</TableCell>
                  <TableCell>
                    {entry.measurements ? (
                      <Typography variant="body2">
                        Cintura: {entry.measurements.waist}cm,
                        Pecho: {entry.measurements.chest}cm
                      </Typography>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{entry.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Workout Logs Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Historial de Entrenamientos</Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            Registrar Nuevo Entrenamiento
          </Button>
        </Box>

        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" color="primary" gutterBottom>
            Resumen de Actividad Reciente
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="h4">{workoutLogs.length}</Typography>
                <Typography variant="body2">Entrenamientos Totales</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'white' }}>
                <Typography variant="h4">
                  {workoutLogs.reduce((total, log) => total + (log.duration_minutes || 0), 0)}
                </Typography>
                <Typography variant="body2">Minutos Totales</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                <Typography variant="h4">
                  {workoutLogs.reduce((total, log) => total + (log.calories_burned || 0), 0)}
                </Typography>
                <Typography variant="body2">Calorías Quemadas</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="workout logs table">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Rutina</TableCell>
                <TableCell align="right">Duración (min)</TableCell>
                <TableCell align="right">Calorías</TableCell>
                <TableCell align="right">Ejercicios</TableCell>
                <TableCell>Notas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workoutLogs.length > 0 ? (
                workoutLogs.map((log) => (
                  <TableRow
                    key={log.log_id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {new Date(log.workout_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{log.plan_name || '-'}</TableCell>
                    <TableCell align="right">{log.duration_minutes || '-'}</TableCell>
                    <TableCell align="right">{log.calories_burned || '-'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" color="primary">
                        Ver Ejercicios
                      </Button>
                    </TableCell>
                    <TableCell>{log.notes || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay registros de entrenamientos disponibles.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Historial de Planes Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Planes de Entrenamiento
              </Typography>

              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="workout plans table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre del Plan</TableCell>
                      <TableCell>Fecha Inicio</TableCell>
                      <TableCell>Fecha Fin</TableCell>
                      <TableCell>Días Programados</TableCell>
                      <TableCell>Progreso</TableCell>
                      <TableCell>Detalles</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workoutPlans && workoutPlans.length > 0 ? (
                      workoutPlans.map((plan: any) => (
                        <TableRow
                          key={plan.plan_id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {plan.plan_name}
                          </TableCell>
                          <TableCell>{plan.start_date || '01/01/2023'}</TableCell>
                          <TableCell>{plan.end_date || '31/03/2023'}</TableCell>
                          <TableCell>{plan.days_to_follow || 30} días</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={plan.progress || 65}
                                  color="primary"
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                              <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {plan.progress || 65}%
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Button size="small" color="primary">
                              Ver Sesiones
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No hay planes de entrenamiento disponibles.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Planes de Nutrición
              </Typography>

              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="nutrition plans table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre del Plan</TableCell>
                      <TableCell>Fecha Inicio</TableCell>
                      <TableCell>Fecha Fin</TableCell>
                      <TableCell>Días Programados</TableCell>
                      <TableCell>Calorías</TableCell>
                      <TableCell>Detalles</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nutritionPlans && nutritionPlans.length > 0 ? (
                      nutritionPlans.map((plan: any) => (
                        <TableRow
                          key={plan.nutrition_plan_id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {plan.plan_name}
                          </TableCell>
                          <TableCell>{plan.start_date || '01/01/2023'}</TableCell>
                          <TableCell>{plan.end_date || '31/03/2023'}</TableCell>
                          <TableCell>{plan.days_to_follow || 90} días</TableCell>
                          <TableCell>{plan.daily_calories} kcal</TableCell>
                          <TableCell>
                            <Button size="small" color="primary">
                              Ver Comidas
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No hay planes de nutrición disponibles.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Registros de Seguimiento
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary">
                  Detalles de Seguimiento de Planes
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Aquí puedes ver el historial detallado de seguimiento de tus planes de entrenamiento y nutrición.
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                      <Typography variant="h4">{workoutPlans.length + nutritionPlans.length}</Typography>
                      <Typography variant="body2">Planes Totales</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'white' }}>
                      <Typography variant="h4">
                        {workoutPlans.reduce((total, plan) => total + (plan.sessions?.length || 0), 0)}
                      </Typography>
                      <Typography variant="body2">Sesiones Programadas</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                      <Typography variant="h4">
                        {nutritionPlans.reduce((total, plan) => total + (plan.meals?.length || 0), 0)}
                      </Typography>
                      <Typography variant="body2">Comidas Programadas</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                      <Typography variant="h4">
                        {workoutLogs.length}
                      </Typography>
                      <Typography variant="body2">Registros Completados</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default ProgressView;
