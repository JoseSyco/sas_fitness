import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { workoutService, aiService } from '../services/api';

const WorkoutPlans = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [aiFormData, setAiFormData] = useState({
    goal: 'weight_loss',
    fitness_level: 'beginner',
    days_per_week: 3,
    equipment_available: '',
    focus_areas: '',
    duration_minutes: 60,
  });

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        setLoading(true);
        const response = await workoutService.getWorkoutPlans();
        setPlans(response.data.plans);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
        setErrorMessage('Failed to load workout plans');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlans();
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAiFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAiFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateWorkoutPlan = async () => {
    try {
      setGenerating(true);
      const response = await aiService.generateWorkoutPlan(aiFormData);
      
      // Save the generated workout plan
      const workoutPlan = response.data.workout_plan;
      await workoutService.createWorkoutPlan(workoutPlan);
      
      // Refresh the list of workout plans
      const plansResponse = await workoutService.getWorkoutPlans();
      setPlans(plansResponse.data.plans);
      
      setSuccessMessage('Workout plan generated successfully');
      handleCloseDialog();
    } catch (error) {
      console.error('Error generating workout plan:', error);
      setErrorMessage('Failed to generate workout plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewPlan = (planId: number) => {
    navigate(`/workout-plans/${planId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          <FitnessCenterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Workout Plans
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Generate New Plan
        </Button>
      </Box>

      {plans.length > 0 ? (
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} md={6} lg={4} key={plan.plan_id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {plan.plan_name}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {plan.description || 'No description available'}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Created: {new Date(plan.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleViewPlan(plan.plan_id)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You don't have any workout plans yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Generate a personalized workout plan based on your fitness goals and preferences.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Generate New Plan
          </Button>
        </Paper>
      )}

      {/* AI Workout Plan Generation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Personalized Workout Plan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Our AI will create a customized workout plan based on your preferences.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Fitness Goal"
                name="goal"
                value={aiFormData.goal}
                onChange={handleAiFormChange}
                margin="normal"
              >
                <MenuItem value="weight_loss">Weight Loss</MenuItem>
                <MenuItem value="muscle_gain">Muscle Gain</MenuItem>
                <MenuItem value="strength">Strength</MenuItem>
                <MenuItem value="endurance">Endurance</MenuItem>
                <MenuItem value="general_fitness">General Fitness</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Fitness Level"
                name="fitness_level"
                value={aiFormData.fitness_level}
                onChange={handleAiFormChange}
                margin="normal"
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Days Per Week"
                name="days_per_week"
                value={aiFormData.days_per_week}
                onChange={handleAiFormChange}
                margin="normal"
              >
                <MenuItem value={2}>2 days</MenuItem>
                <MenuItem value={3}>3 days</MenuItem>
                <MenuItem value={4}>4 days</MenuItem>
                <MenuItem value={5}>5 days</MenuItem>
                <MenuItem value={6}>6 days</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Workout Duration (minutes)"
                name="duration_minutes"
                type="number"
                value={aiFormData.duration_minutes}
                onChange={handleAiFormChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Available Equipment"
                name="equipment_available"
                value={aiFormData.equipment_available}
                onChange={handleAiFormChange}
                margin="normal"
                helperText="e.g., dumbbells, barbell, resistance bands, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Focus Areas (optional)"
                name="focus_areas"
                value={aiFormData.focus_areas}
                onChange={handleAiFormChange}
                margin="normal"
                helperText="e.g., arms, legs, core, etc."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleGenerateWorkoutPlan}
            variant="contained"
            color="primary"
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Plan'}
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

export default WorkoutPlans;
