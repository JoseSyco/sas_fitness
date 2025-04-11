import { useState, useEffect } from 'react';
import {
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SportsIcon from '@mui/icons-material/Sports';
import ShowChartIcon from '@mui/icons-material/ShowChart';

// Import services
import jsonDataService from '../services/jsonDataService';

// Import section content components
import WorkoutPlansView from './modals/WorkoutPlansView';
import NutritionPlansView from './modals/NutritionPlansView';
import ExercisesView from './modals/ExercisesView';
import ProgressView from './modals/ProgressView';

const SectionButtons = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleOpenModal = (section: string) => {
    setOpenModal(section);
    // Forzar recarga de datos al abrir el modal
    setRefreshKey(prev => prev + 1);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  // Escuchar eventos personalizados para cerrar el modal actual y abrir el modal de Progreso
  useEffect(() => {
    const handleCloseCurrentModal = () => {
      setOpenModal(null);
    };

    const handleOpenProgressModal = () => {
      setOpenModal('progress');
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('closeCurrentModal', handleCloseCurrentModal);
    window.addEventListener('openProgressModal', handleOpenProgressModal);

    return () => {
      window.removeEventListener('closeCurrentModal', handleCloseCurrentModal);
      window.removeEventListener('openProgressModal', handleOpenProgressModal);
    };
  }, []);

  // Estado para almacenar el ID del plan activo
  const [activePlanId, setActivePlanId] = useState<number | undefined>(undefined);

  // Efecto para obtener el primer plan de entrenamiento disponible
  useEffect(() => {
    const fetchFirstPlan = async () => {
      try {
        const plans = await jsonDataService.getWorkoutPlans();
        if (Array.isArray(plans) && plans.length > 0) {
          setActivePlanId(plans[0].plan_id);
          console.log('Plan activo establecido:', plans[0].plan_id);
        }
      } catch (error) {
        console.error('Error al obtener planes de entrenamiento:', error);
      }
    };

    fetchFirstPlan();
  }, [refreshKey]);

  const sections = [
    {
      id: 'workouts',
      title: 'RUTINAS',
      icon: <FitnessCenterIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      component: <WorkoutPlansView key={`workout-${refreshKey}`} />
    },
    {
      id: 'nutrition',
      title: 'NUTRICIÓN',
      icon: <RestaurantIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      component: <NutritionPlansView key={`nutrition-${refreshKey}`} />
    },
    {
      id: 'exercises',
      title: 'EJERCICIOS',
      icon: <SportsIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      component: <ExercisesView key={`exercises-${refreshKey}`} planId={activePlanId} />
    },
    {
      id: 'progress',
      title: 'PROGRESO',
      icon: <ShowChartIcon sx={{ fontSize: 40 }} />,
      color: '#f50057',
      component: <ProgressView key={`progress-${refreshKey}`} />
    }
  ];

  return (
    <>
      <Grid container spacing={0} sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', margin: 0, padding: 0, boxSizing: 'border-box' }}>
        {sections.map((section) => (
          <Grid item xs={3} key={section.id} sx={{ flex: '1 1 25%', maxWidth: '25%', width: '25%', boxSizing: 'border-box', padding: '0 2px' }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleOpenModal(section.id)}
              sx={{
                height: { xs: '80px', sm: '100px' },
                borderRadius: 2,
                backgroundColor: section.color,
                '&:hover': {
                  backgroundColor: section.color,
                  opacity: 0.9
                },
                display: 'flex',
                flexDirection: 'column',
                textTransform: 'none',
                boxShadow: 3,
                width: '100%'
              }}
            >
              {section.icon}
              <Typography
                variant="subtitle1"
                sx={{
                  mt: 0.5,
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  fontWeight: 'bold'
                }}
              >
                {section.title}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Modal for each section */}
      {sections.map((section) => (
        <Dialog
          key={section.id}
          open={openModal === section.id}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ m: 0, p: 2, backgroundColor: section.color, color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {section.icon}
              <Typography variant="h6" sx={{ ml: 1 }}>
                {section.title}
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'white'
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            {section.component}
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
};

export default SectionButtons;
