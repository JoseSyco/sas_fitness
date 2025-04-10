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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EggIcon from '@mui/icons-material/Egg';
import GrainIcon from '@mui/icons-material/Grain';
import OilBarrelIcon from '@mui/icons-material/OilBarrel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
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
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

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
          // Asegurarse de que cada comida tenga todos los campos necesarios
          const plansWithFullDetails = jsonPlans.map(plan => ({
            ...plan,
            meals: plan.meals.map(meal => ({
              ...meal,
              detailed_description: meal.detailed_description || meal.description,
              preparation_instructions: meal.preparation_instructions || 'Instrucciones no disponibles'
            }))
          }));
          setNutritionPlans(plansWithFullDetails);
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

  const handleOpenMealDialog = (meal: any) => {
    console.log('Opening meal dialog with meal:', meal);
    setSelectedMeal(meal);
    setOpenMealDialog(true);
  };

  const handleCloseMealDialog = () => {
    setOpenMealDialog(false);
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
    <>
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

                    {/* Información de duración del plan */}
                    <Box sx={{ mt: 2, mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Duración del Plan
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Fecha inicio:
                          </Typography>
                          <Typography variant="body2">
                            {plan.start_date || '01/01/2023'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Fecha fin:
                          </Typography>
                          <Typography variant="body2">
                            {plan.end_date || '31/03/2023'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Días programados:
                          </Typography>
                          <Typography variant="body2">
                            {plan.days_to_follow || 90} días
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Frecuencia:
                          </Typography>
                          <Typography variant="body2">
                            {Array.isArray(plan.frequency)
                              ? plan.frequency.join(', ')
                              : plan.frequency || 'Todos los días'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

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

                <Grid container spacing={2}>
                  {plan.meals && plan.meals.map((meal: any) => (
                    <Grid item xs={12} sm={6} md={6} lg={4} key={meal.meal_id}>
                      <Paper elevation={1} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {meal.meal_name}
                            </Typography>
                            <Chip
                              label={`${meal.calories} kcal`}
                              size="small"
                              color="secondary"
                            />
                          </Box>

                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {meal.description}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
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
                        </Box>

                        {/* Botón para ver detalles */}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleOpenMealDialog(meal)}
                            fullWidth
                          >
                            Ver detalles
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      ))}
      </Box>

      {/* Diálogo de detalle de comida */}
    <Dialog
      open={openMealDialog}
      onClose={handleCloseMealDialog}
      maxWidth="md"
      fullWidth
    >
      {selectedMeal && (
        <>
          <DialogTitle sx={{ m: 0, p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">{selectedMeal.meal_name}</Typography>
              <IconButton
                aria-label="close"
                onClick={handleCloseMealDialog}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Descripción Detallada
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedMeal.detailed_description || selectedMeal.description}
                </Typography>

                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                  Instrucciones de Preparación
                </Typography>
                {selectedMeal.preparation_instructions && selectedMeal.preparation_instructions.includes('\n') ? (
                  <Box component="div" sx={{ pl: 2 }}>
                    {selectedMeal.preparation_instructions.split('\n').map((instruction, index) => (
                      <Typography key={index} variant="body1" paragraph>
                        {instruction}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" paragraph>
                    {selectedMeal.preparation_instructions || 'Lava y prepara todos los ingredientes. Cocina siguiendo las proporciones indicadas y sirve inmediatamente para disfrutar de todos los nutrientes.'}
                  </Typography>
                )}
              </Grid>

              {/* Tablas en formato horizontal */}
              <Grid item xs={12} container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Información Nutricional
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Calorías:
                        </Typography>
                        <Typography variant="body1">
                          {selectedMeal.calories} kcal
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Proteínas:
                        </Typography>
                        <Typography variant="body1">
                          {selectedMeal.protein_grams}g
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Carbohidratos:
                        </Typography>
                        <Typography variant="body1">
                          {selectedMeal.carbs_grams}g
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Grasas:
                        </Typography>
                        <Typography variant="body1">
                          {selectedMeal.fat_grams}g
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                      Alimentos Incluidos
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ height: 'calc(100% - 40px)' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Alimento</TableCell>
                            <TableCell>Porción</TableCell>
                            <TableCell align="right">Calorías</TableCell>
                            <TableCell align="right">Proteínas</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedMeal.foods && selectedMeal.foods.length > 0 ? (
                            selectedMeal.foods.map((food: any) => (
                              <TableRow key={food.food_id}>
                                <TableCell component="th" scope="row">
                                  {food.food_name}
                                </TableCell>
                                <TableCell>{food.portion}</TableCell>
                                <TableCell align="right">{food.calories} kcal</TableCell>
                                <TableCell align="right">{food.protein_grams}g</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                <Typography variant="body2" color="text.secondary">
                                  No hay detalles de alimentos disponibles
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Grid>
              </Grid>


            </Grid>
          </DialogContent>

        </>
      )}
    </Dialog>
    </>
  );
};

export default NutritionPlansView;
