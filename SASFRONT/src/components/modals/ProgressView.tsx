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
  Tab
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const [progressRes, workoutLogsRes] = await Promise.all([
          userService.getProgressHistory(),
          workoutService.getWorkoutLogs()
        ]);
        
        // Sort by date
        const sortedProgress = progressRes.data.progress.sort(
          (a: any, b: any) => new Date(a.tracking_date).getTime() - new Date(b.tracking_date).getTime()
        );
        
        const sortedWorkoutLogs = workoutLogsRes.data.logs.sort(
          (a: any, b: any) => new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime()
        );
        
        setProgressData(sortedProgress);
        setWorkoutLogs(sortedWorkoutLogs);
      } catch (error) {
        console.error('Error fetching progress data:', error);
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
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="measurements table">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Peso (kg)</TableCell>
                <TableCell align="right">Grasa Corporal (%)</TableCell>
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
                  <TableCell>{entry.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Workout Logs Tab */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="workout logs table">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Rutina</TableCell>
                <TableCell align="right">Duración (min)</TableCell>
                <TableCell align="right">Calorías</TableCell>
                <TableCell align="right">Valoración</TableCell>
                <TableCell>Notas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workoutLogs.map((log) => (
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
                  <TableCell align="right">{log.rating ? `${log.rating}/5` : '-'}</TableCell>
                  <TableCell>{log.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Box>
  );
};

export default ProgressView;
