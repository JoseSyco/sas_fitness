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
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { nutritionService, aiService } from '../services/api';

const NutritionPlans = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [aiFormData, setAiFormData] = useState({
    goal: 'weight_loss',
    dietary_restrictions: '',
    calories_target: '',
    meals_per_day: 3,
  });

  useEffect(() => {
    const fetchNutritionPlans = async () => {
      try {
        setLoading(true);
        const response = await nutritionService.getNutritionPlans();
        setPlans(response.data.plans);
      } catch (error) {
        console.error('Error fetching nutrition plans:', error);
        setErrorMessage('Failed to load nutrition plans');
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionPlans();
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

  const handleGenerateNutritionPlan = async () => {
    try {
      setGenerating(true);
      const response = await aiService.generateNutritionPlan(aiFormData);
      
      // Save the generated nutrition plan
      const nutritionPlan = response.data.nutrition_plan;
      await nutritionService.createNutritionPlan(nutritionPlan);
      
      // Refresh the list of nutrition plans
      const plansResponse = await nutritionService.getNutritionPlans();
      setPlans(plansResponse.data.plans);
      
      setSuccessMessage('Nutrition plan generated successfully');
      handleCloseDialog();
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
      setErrorMessage('Failed to generate nutrition plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewPlan = (planId: number) => {
    navigate(`/nutrition-plans/${planId}`);
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
          <RestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Nutrition Plans
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
            <Grid item xs={12} md={6} lg={4} key={plan.nutrition_plan_id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {plan.plan_name}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" gutterBottom>
                    {plan.daily_calories} calories per day
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Protein: {plan.protein_grams}g | Carbs: {plan.carbs_grams}g | Fat: {plan.fat_grams}g
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Created: {new Date(plan.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleViewPlan(plan.nutrition_plan_id)}
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
            You don't have any nutrition plans yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Generate a personalized nutrition plan based on your goals and dietary preferences.
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

      {/* AI Nutrition Plan Generation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Personalized Nutrition Plan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Our AI will create a customized nutrition plan based on your preferences.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Nutrition Goal"
                name="goal"
                value={aiFormData.goal}
                onChange={handleAiFormChange}
                margin="normal"
              >
                <MenuItem value="weight_loss">Weight Loss</MenuItem>
                <MenuItem value="muscle_gain">Muscle Gain</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="performance">Athletic Performance</MenuItem>
                <MenuItem value="health">General Health</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dietary Restrictions"
                name="dietary_restrictions"
                value={aiFormData.dietary_restrictions}
                onChange={handleAiFormChange}
                margin="normal"
                helperText="e.g., vegetarian, vegan, gluten-free, dairy-free, etc."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Calories (optional)"
                name="calories_target"
                type="number"
                value={aiFormData.calories_target}
                onChange={handleAiFormChange}
                margin="normal"
                helperText="Leave blank for AI recommendation"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Meals Per Day"
                name="meals_per_day"
                value={aiFormData.meals_per_day}
                onChange={handleAiFormChange}
                margin="normal"
              >
                <MenuItem value={2}>2 meals</MenuItem>
                <MenuItem value={3}>3 meals</MenuItem>
                <MenuItem value={4}>4 meals</MenuItem>
                <MenuItem value={5}>5 meals</MenuItem>
                <MenuItem value={6}>6 meals</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleGenerateNutritionPlan}
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

export default NutritionPlans;
