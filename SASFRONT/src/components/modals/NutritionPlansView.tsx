import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Button
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EggIcon from '@mui/icons-material/Egg';
import GrainIcon from '@mui/icons-material/Grain';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { nutritionService } from '../../services/api';
import jsonDataService from '../../services/jsonDataService';

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
      id={`nutrition-tabpanel-${index}`}
      aria-labelledby={`nutrition-tab-${index}`}
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

const MacroProgressBar = ({ value, max, label, color }: { value: number, max: number, label: string, color: string }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2">{value}g / {max}g</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color
          }
        }}
      />
    </Box>
  );
};

const NutritionPlansView = () => {
  const [value, setValue] = useState(0);
  const [nutritionPlans, setNutritionPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNutritionPlans = async () => {
      try {
        setLoading(true);
        console.log('Fetching nutrition plans...');

        // Cargar directamente desde JSON para simplificar
        const jsonPlans = await jsonDataService.getNutritionPlans();
        console.log('Nutrition plans from JSON:', jsonPlans);

        if (Array.isArray(jsonPlans) && jsonPlans.length > 0) {
          console.log('Setting nutrition plans:', jsonPlans);
          setNutritionPlans(jsonPlans);
        } else {
          console.log('No nutrition plans found in JSON, trying backend...');

          // Intentar obtener datos del backend como fallback
          try {
            const response = await nutritionService.getPlans(1);
            console.log('Nutrition plans response from backend:', response);

            if (response.data && Array.isArray(response.data.plans)) {
              setNutritionPlans(response.data.plans);
            } else {
              console.error('No nutrition plans found in backend');
              setNutritionPlans([]);
            }
          } catch (apiError) {
            console.error('Error fetching from backend:', apiError);
            setNutritionPlans([]);
          }
        }
      } catch (error) {
        console.error('Error fetching nutrition plans:', error);
        setNutritionPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionPlans();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (nutritionPlans.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No tienes planes de nutrición activos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Usa el chat para crear un nuevo plan de nutrición
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="nutrition plans tabs">
          {nutritionPlans.map((plan, index) => (
            <Tab key={plan.nutrition_plan_id} label={plan.plan_name} id={`nutrition-tab-${index}`} />
          ))}
        </Tabs>
      </Box>

      {nutritionPlans.map((plan, index) => (
        <TabPanel key={plan.nutrition_plan_id} value={value} index={index}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {plan.plan_name}
            </Typography>

          </Box>

          <Grid container spacing={3}>
            <Grid md={4} lg={4} sm={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Macronutrientes Diarios
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h4" gutterBottom align="center">
                      {plan.daily_calories} kcal
                    </Typography>

                    <Box sx={{ mt: 3 }}>
                      <MacroProgressBar
                        value={plan.protein_grams}
                        max={plan.protein_grams}
                        label="Proteínas"
                        color="#ff5722"
                      />
                      <MacroProgressBar
                        value={plan.carbs_grams}
                        max={plan.carbs_grams}
                        label="Carbohidratos"
                        color="#2196f3"
                      />
                      <MacroProgressBar
                        value={plan.fat_grams}
                        max={plan.fat_grams}
                        label="Grasas"
                        color="#ffc107"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid md={8} lg={8} sm={12}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Comidas del Día
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {plan.meals && plan.meals.map((meal: any) => (
                  <Box key={meal.meal_id} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {meal.meal_name}
                      </Typography>
                      <Chip
                        label={`${meal.calories} kcal`}
                        size="small"
                        color="secondary"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                      {meal.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        icon={<EggIcon />}
                        label={`P: ${meal.protein_grams}g`}
                        size="small"
                        sx={{ backgroundColor: '#ffebee' }}
                      />
                      <Chip
                        icon={<GrainIcon />}
                        label={`C: ${meal.carbs_grams}g`}
                        size="small"
                        sx={{ backgroundColor: '#e3f2fd' }}
                      />
                      <Chip
                        icon={<OilBarrelIcon />}
                        label={`G: ${meal.fat_grams}g`}
                        size="small"
                        sx={{ backgroundColor: '#fff8e1' }}
                      />
                    </Box>

                    {/* Seguimiento de completado - Gestionado automáticamente por IA */}
                    <Box sx={{ mt: 2, mb: 2 }}>
                      {meal.completion_tracking && meal.completion_tracking.length > 0 ? (
                        <Box>
                          <Chip
                            icon={<CheckCircleIcon />}
                            label={`Última comida: ${meal.completion_tracking[meal.completion_tracking.length - 1].date}`}
                            color="success"
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            <SmartToyIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                            Seguimiento automático por IA - {meal.completion_tracking.length} registros
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <Chip
                            icon={<AutorenewIcon />}
                            label="Pendiente de seguimiento"
                            color="primary"
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            <SmartToyIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                            La IA registrará automáticamente cuando se consuma
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Divider sx={{ mt: 1 }} />
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      ))}
    </Box>
  );
};

export default NutritionPlansView;
