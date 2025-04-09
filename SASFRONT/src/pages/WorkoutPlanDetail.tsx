import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { workoutService } from '../services/api';

const WorkoutPlanDetail = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [openLogDialog, setOpenLogDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [logData, setLogData] = useState({
    workout_date: new Date().toISOString().split('T')[0],
    session_id: '',
    duration_minutes: '',
    calories_burned: '',
    rating: 5,
    notes: '',
  });

  useEffect(() => {
    const fetchWorkoutPlanDetails = async () => {
      try {
        setLoading(true);
        if (!planId) return;
        
        const response = await workoutService.getWorkoutPlan(parseInt(planId));
        setPlan(response.data.plan);
        setSessions(response.data.sessions || []);
      } catch (error) {
        console.error('Error fetching workout plan details:', error);
        setErrorMessage('Failed to load workout plan details');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlanDetails();
  }, [planId]);

  const handleOpenLogDialog = (sessionId: string) => {
    setLogData((prev) => ({
      ...prev,
      session_id: sessionId,
    }));
    setOpenLogDialog(true);
  };

  const handleCloseLogDialog = () => {
    setOpenLogDialog(false);
  };

  const handleLogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLogData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogWorkout = async () => {
    try {
      setSaving(true);
      if (!planId) return;
      
      const logDataToSubmit = {
        ...logData,
        plan_id: parseInt(planId),
        session_id: parseInt(logData.session_id),
        duration_minutes: parseInt(logData.duration_minutes),
        calories_burned: parseInt(logData.calories_burned),
        rating: parseInt(logData.rating.toString()),
      };
      
      await workoutService.logWorkout(logDataToSubmit);
      setSuccessMessage('Workout logged successfully');
      handleCloseLogDialog();
    } catch (error) {
      console.error('Error logging workout:', error);
      setErrorMessage('Failed to log workout');
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    navigate('/workout-plans');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!plan) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Workout plan not found
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ mt: 2 }}
          >
            Back to Workout Plans
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleGoBack}
        sx={{ mb: 3 }}
      >
        Back to Workout Plans
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <FitnessCenterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {plan.plan_name}
        </Typography>
        <Typography variant="body1" paragraph>
          {plan.description || 'No description available'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={plan.is_ai_generated ? 'AI Generated' : 'Custom Plan'}
            color={plan.is_ai_generated ? 'primary' : 'default'}
            size="small"
          />
          <Chip
            label={`Created: ${new Date(plan.created_at).toLocaleDateString()}`}
            size="small"
            variant="outlined"
          />
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Workout Sessions
      </Typography>

      {sessions.length > 0 ? (
        sessions.map((session) => (
          <Accordion key={session.session_id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ width: '33%', flexShrink: 0 }}>
                {session.day_of_week}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                {session.focus_area} ({session.duration_minutes} min)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Exercise</TableCell>
                      <TableCell align="right">Sets</TableCell>
                      <TableCell align="right">Reps</TableCell>
                      <TableCell align="right">Rest</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {session.exercises && session.exercises.map((exercise: any) => (
                      <TableRow key={exercise.workout_exercise_id}>
                        <TableCell component="th" scope="row">
                          {exercise.name}
                        </TableCell>
                        <TableCell align="right">{exercise.sets}</TableCell>
                        <TableCell align="right">{exercise.reps || '-'}</TableCell>
                        <TableCell align="right">
                          {exercise.rest_seconds ? `${exercise.rest_seconds}s` : '-'}
                        </TableCell>
                        <TableCell>{exercise.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => handleOpenLogDialog(session.session_id)}
              >
                Log This Workout
              </Button>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body1" align="center">
              No workout sessions found for this plan.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Log Workout Dialog */}
      <Dialog open={openLogDialog} onClose={handleCloseLogDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Log Your Workout</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                name="workout_date"
                type="date"
                value={logData.workout_date}
                onChange={handleLogChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                name="duration_minutes"
                type="number"
                value={logData.duration_minutes}
                onChange={handleLogChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Calories Burned"
                name="calories_burned"
                type="number"
                value={logData.calories_burned}
                onChange={handleLogChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Rating"
                name="rating"
                value={logData.rating}
                onChange={handleLogChange}
                margin="normal"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value} {value === 1 ? 'Star' : 'Stars'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={logData.notes}
                onChange={handleLogChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLogDialog}>Cancel</Button>
          <Button
            onClick={handleLogWorkout}
            variant="contained"
            color="primary"
            disabled={saving || !logData.duration_minutes}
          >
            {saving ? 'Saving...' : 'Log Workout'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default WorkoutPlanDetail;
