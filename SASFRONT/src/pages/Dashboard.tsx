import { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AuthContext from '../context/AuthContext';
import { workoutService, nutritionService, userService } from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [workoutRes, nutritionRes, goalsRes, progressRes] = await Promise.all([
          workoutService.getWorkoutPlans(),
          nutritionService.getNutritionPlans(),
          userService.getGoals(),
          userService.getProgressHistory(),
        ]);

        setWorkoutPlans(workoutRes.data.plans);
        setNutritionPlans(nutritionRes.data.plans);
        setGoals(goalsRes.data.goals);
        setProgress(progressRes.data.progress);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
              Welcome, {user?.first_name}!
            </Typography>
            <Typography variant="body1">
              Track your fitness journey, manage your workout and nutrition plans, and monitor your progress all in one place.
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <FitnessCenterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Workouts
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                You have {workoutPlans.length} workout plan(s)
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                component={RouterLink}
                to="/workout-plans"
              >
                View Plans
              </Button>
              <Button
                size="small"
                component={RouterLink}
                to="/workout-plans"
                color="primary"
              >
                Create New
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <RestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Nutrition
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                You have {nutritionPlans.length} nutrition plan(s)
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                component={RouterLink}
                to="/nutrition-plans"
              >
                View Plans
              </Button>
              <Button
                size="small"
                component={RouterLink}
                to="/nutrition-plans"
                color="primary"
              >
                Create New
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ShowChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Progress
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                You have {progress.length} progress entries
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                component={RouterLink}
                to="/progress"
              >
                View Progress
              </Button>
              <Button
                size="small"
                component={RouterLink}
                to="/progress"
                color="primary"
              >
                Track New
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Goals Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Your Fitness Goals
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {goals.length > 0 ? (
              <List>
                {goals.slice(0, 3).map((goal: any) => (
                  <ListItem key={goal.goal_id}>
                    <ListItemIcon>
                      <CheckCircleIcon color={goal.status === 'completed' ? 'success' : 'action'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${goal.goal_type}: ${goal.target_value}`}
                      secondary={`Target date: ${new Date(goal.target_date).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                You haven't set any fitness goals yet.
              </Typography>
            )}
            <Button
              component={RouterLink}
              to="/profile"
              sx={{ alignSelf: 'flex-end', mt: 1 }}
            >
              Manage Goals
            </Button>
          </Paper>
        </Grid>

        {/* Recent Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Recent Progress
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {progress.length > 0 ? (
              <List>
                {progress.slice(0, 3).map((entry: any) => (
                  <ListItem key={entry.progress_id}>
                    <ListItemText
                      primary={`Weight: ${entry.weight} kg`}
                      secondary={`Date: ${new Date(entry.tracking_date).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                You haven't tracked any progress yet.
              </Typography>
            )}
            <Button
              component={RouterLink}
              to="/progress"
              sx={{ alignSelf: 'flex-end', mt: 1 }}
            >
              View All Progress
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
