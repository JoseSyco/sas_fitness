import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { userService, workoutService } from '../services/api';

const ProgressTracking = () => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [newProgress, setNewProgress] = useState({
    tracking_date: new Date().toISOString().split('T')[0],
    weight: '',
    body_fat_percentage: '',
    notes: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const [progressRes, workoutLogsRes] = await Promise.all([
          userService.getProgressHistory(),
          workoutService.getWorkoutLogs(),
        ]);

        setProgressData(progressRes.data.progress);
        setWorkoutLogs(workoutLogsRes.data.logs);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setErrorMessage('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProgress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTrackProgress = async () => {
    try {
      setSaving(true);
      
      // Validate inputs
      if (!newProgress.weight) {
        setErrorMessage('Weight is required');
        setSaving(false);
        return;
      }

      const progressToSubmit = {
        ...newProgress,
        weight: parseFloat(newProgress.weight),
        body_fat_percentage: newProgress.body_fat_percentage 
          ? parseFloat(newProgress.body_fat_percentage) 
          : null,
      };

      const response = await userService.trackProgress(progressToSubmit);
      
      // Add the new progress to the list
      setProgressData([response.data.progress, ...progressData]);
      
      // Reset form
      setNewProgress({
        tracking_date: new Date().toISOString().split('T')[0],
        weight: '',
        body_fat_percentage: '',
        notes: '',
      });
      
      setSuccessMessage('Progress tracked successfully');
    } catch (error) {
      console.error('Error tracking progress:', error);
      setErrorMessage('Failed to track progress');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Calculate weight change if there are at least 2 entries
  const weightChange = progressData.length >= 2
    ? (progressData[0].weight - progressData[progressData.length - 1].weight).toFixed(1)
    : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        <ShowChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Progress Tracking
      </Typography>

      <Grid container spacing={3}>
        {/* Track New Progress Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Track New Progress
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  name="tracking_date"
                  type="date"
                  value={newProgress.tracking_date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={newProgress.weight}
                  onChange={handleInputChange}
                  inputProps={{ step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Body Fat %"
                  name="body_fat_percentage"
                  type="number"
                  value={newProgress.body_fat_percentage}
                  onChange={handleInputChange}
                  inputProps={{ step: 0.1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={newProgress.notes}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleTrackProgress}
                  disabled={saving || !newProgress.weight}
                >
                  {saving ? 'Saving...' : 'Track Progress'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Progress Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Progress Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {progressData.length > 0 ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Current Weight
                      </Typography>
                      <Typography variant="h4">
                        {progressData[0].weight} kg
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {weightChange !== null && (
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Weight Change
                        </Typography>
                        <Typography 
                          variant="h4" 
                          color={parseFloat(weightChange) < 0 ? 'success.main' : parseFloat(weightChange) > 0 ? 'error.main' : 'text.primary'}
                        >
                          {weightChange > 0 ? '+' : ''}{weightChange} kg
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {progressData[0].body_fat_percentage && (
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          Current Body Fat
                        </Typography>
                        <Typography variant="h4">
                          {progressData[0].body_fat_percentage}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Entries
                      </Typography>
                      <Typography variant="h4">
                        {progressData.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body1" align="center">
                No progress data available yet. Start tracking to see your progress!
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Progress History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Progress History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {progressData.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Weight (kg)</TableCell>
                      <TableCell align="right">Body Fat %</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {progressData.map((entry) => (
                      <TableRow key={entry.progress_id}>
                        <TableCell>
                          {new Date(entry.tracking_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">{entry.weight}</TableCell>
                        <TableCell align="right">
                          {entry.body_fat_percentage || '-'}
                        </TableCell>
                        <TableCell>{entry.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" align="center">
                No progress data available yet.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Workouts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Workouts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {workoutLogs.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Workout</TableCell>
                      <TableCell align="right">Duration (min)</TableCell>
                      <TableCell align="right">Calories Burned</TableCell>
                      <TableCell align="right">Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workoutLogs.slice(0, 5).map((log) => (
                      <TableRow key={log.log_id}>
                        <TableCell>
                          {new Date(log.workout_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{log.plan_name || 'Custom Workout'}</TableCell>
                        <TableCell align="right">{log.duration_minutes}</TableCell>
                        <TableCell align="right">{log.calories_burned || '-'}</TableCell>
                        <TableCell align="right">{log.rating}/5</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" align="center">
                No workout logs available yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
      >
        <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProgressTracking;
