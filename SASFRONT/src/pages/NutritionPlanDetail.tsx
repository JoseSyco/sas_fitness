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
  List,
  ListItem,
  ListItemText,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { nutritionService } from '../services/api';

const NutritionPlanDetail = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNutritionPlanDetails = async () => {
      try {
        setLoading(true);
        if (!planId) return;
        
        const response = await nutritionService.getNutritionPlan(parseInt(planId));
        setPlan(response.data.plan);
        setMeals(response.data.meals || []);
      } catch (error) {
        console.error('Error fetching nutrition plan details:', error);
        setError('Failed to load nutrition plan details');
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionPlanDetails();
  }, [planId]);

  const handleGoBack = () => {
    navigate('/nutrition-plans');
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
            Nutrition plan not found
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ mt: 2 }}
          >
            Back to Nutrition Plans
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
        Back to Nutrition Plans
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <RestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {plan.plan_name}
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

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Nutrition Targets
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  <strong>Calories:</strong> {plan.daily_calories} kcal
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Protein:</strong> {plan.protein_grams} g
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Carbohydrates:</strong> {plan.carbs_grams} g
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Fat:</strong> {plan.fat_grams} g
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Macronutrient Breakdown
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="primary">
                      {Math.round((plan.protein_grams * 4 / plan.daily_calories) * 100)}%
                    </Typography>
                    <Typography variant="body2">Protein</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="secondary">
                      {Math.round((plan.carbs_grams * 4 / plan.daily_calories) * 100)}%
                    </Typography>
                    <Typography variant="body2">Carbs</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="error">
                      {Math.round((plan.fat_grams * 9 / plan.daily_calories) * 100)}%
                    </Typography>
                    <Typography variant="body2">Fat</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Meal Plan
      </Typography>

      {meals.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Meal</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Calories</TableCell>
                <TableCell align="right">Protein</TableCell>
                <TableCell align="right">Carbs</TableCell>
                <TableCell align="right">Fat</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meals.map((meal) => (
                <TableRow key={meal.meal_id}>
                  <TableCell component="th" scope="row">
                    <Typography variant="subtitle2">{meal.meal_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{meal.description || 'No description'}</Typography>
                  </TableCell>
                  <TableCell align="right">{meal.calories} kcal</TableCell>
                  <TableCell align="right">{meal.protein_grams} g</TableCell>
                  <TableCell align="right">{meal.carbs_grams} g</TableCell>
                  <TableCell align="right">{meal.fat_grams} g</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography variant="subtitle1">Daily Total</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2">{plan.daily_calories} kcal</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2">{plan.protein_grams} g</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2">{plan.carbs_grams} g</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2">{plan.fat_grams} g</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body1" align="center">
              No meals found for this nutrition plan.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default NutritionPlanDetail;
