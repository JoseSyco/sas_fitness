import { useState } from 'react';
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
      component: <ExercisesView key={`exercises-${refreshKey}`} />
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
      <Grid container spacing={1}>
        {sections.map((section) => (
          <Grid item xs={3} key={section.id}>
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
                boxShadow: 3
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
          <DialogActions>
            <Button onClick={handleCloseModal}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      ))}
    </>
  );
};

export default SectionButtons;
