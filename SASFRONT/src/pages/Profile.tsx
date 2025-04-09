import { useState, useEffect, useContext } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import AuthContext from '../context/AuthContext';
import { userService } from '../services/api';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState<any>({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activity_level: '',
    fitness_level: '',
  });
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoal, setNewGoal] = useState({
    goal_type: 'weight_loss',
    target_value: '',
    start_date: new Date().toISOString().split('T')[0],
    target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [profileRes, goalsRes] = await Promise.all([
          userService.getProfile(),
          userService.getGoals(),
        ]);

        if (profileRes.data.profile) {
          setProfile(profileRes.data.profile);
        }
        setGoals(goalsRes.data.goals);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setErrorMessage('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewGoal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await userService.updateProfile(profile);
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddGoal = async () => {
    try {
      setSaving(true);
      const response = await userService.createGoal(newGoal);
      setGoals([...goals, response.data.goal]);
      setNewGoal({
        goal_type: 'weight_loss',
        target_value: '',
        start_date: new Date().toISOString().split('T')[0],
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setSuccessMessage('Goal added successfully');
    } catch (error) {
      console.error('Error adding goal:', error);
      setErrorMessage('Failed to add goal');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGoalStatus = async (goalId: number, status: string) => {
    try {
      setSaving(true);
      const goalToUpdate = goals.find((g) => g.goal_id === goalId);
      if (!goalToUpdate) return;

      const updatedGoal = { ...goalToUpdate, status };
      await userService.updateGoal(goalId, updatedGoal);

      setGoals(goals.map((g) => (g.goal_id === goalId ? { ...g, status } : g)));
      setSuccessMessage('Goal status updated');
    } catch (error) {
      console.error('Error updating goal status:', error);
      setErrorMessage('Failed to update goal status');
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Your Profile
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {user?.first_name} {user?.last_name} ({user?.email})
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="Personal Information" />
            <Tab label="Fitness Goals" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={profile.age || ''}
                onChange={handleProfileChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={profile.gender || ''}
                onChange={handleProfileChange}
                margin="normal"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Height (cm)"
                name="height"
                type="number"
                value={profile.height || ''}
                onChange={handleProfileChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                name="weight"
                type="number"
                value={profile.weight || ''}
                onChange={handleProfileChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Activity Level"
                name="activity_level"
                value={profile.activity_level || ''}
                onChange={handleProfileChange}
                margin="normal"
              >
                <MenuItem value="sedentary">Sedentary</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="very_active">Very Active</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Fitness Level"
                name="fitness_level"
                value={profile.fitness_level || ''}
                onChange={handleProfileChange}
                margin="normal"
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Current Goals
          </Typography>
          {goals.length > 0 ? (
            <Grid container spacing={2}>
              {goals.map((goal) => (
                <Grid item xs={12} key={goal.goal_id}>
                  <Paper sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1">
                          {goal.goal_type.replace('_', ' ')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Target: {goal.target_value}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2">
                          Start: {new Date(goal.start_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          Target: {new Date(goal.target_date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Status"
                          value={goal.status}
                          onChange={(e) => handleUpdateGoalStatus(goal.goal_id, e.target.value)}
                        >
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="abandoned">Abandoned</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ my: 2 }}>
              You haven't set any fitness goals yet.
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Add New Goal
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Goal Type"
                name="goal_type"
                value={newGoal.goal_type}
                onChange={handleNewGoalChange}
                margin="normal"
              >
                <MenuItem value="weight_loss">Weight Loss</MenuItem>
                <MenuItem value="muscle_gain">Muscle Gain</MenuItem>
                <MenuItem value="endurance">Endurance</MenuItem>
                <MenuItem value="strength">Strength</MenuItem>
                <MenuItem value="flexibility">Flexibility</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Value"
                name="target_value"
                type="number"
                value={newGoal.target_value}
                onChange={handleNewGoalChange}
                margin="normal"
                helperText="e.g., target weight in kg or target running distance in km"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="start_date"
                type="date"
                value={newGoal.start_date}
                onChange={handleNewGoalChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Date"
                name="target_date"
                type="date"
                value={newGoal.target_date}
                onChange={handleNewGoalChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddGoal}
                disabled={saving || !newGoal.target_value}
              >
                {saving ? 'Adding...' : 'Add Goal'}
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

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

export default Profile;
