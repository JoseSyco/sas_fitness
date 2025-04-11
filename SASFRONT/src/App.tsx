import { useState, useEffect, useRef } from 'react';
import userPreferencesService from './services/userPreferencesService';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './theme';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { mockProfile } from './services/mockData';

// Auto-login for demo purposes
import './App.css';

// Components
import SectionButtons from './components/SectionButtons';
// Componente de chat simple para pruebas con n8n
import SimpleChatInterface from './components/SimpleChatInterface';

// Context
import { AuthProvider } from './context/AuthContext';
// ApiStatusProvider removed

// Theme configuration

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const open = Boolean(anchorEl);

  // Reference to chat interface for clearing history
  const chatInterfaceRef = useRef<{ clearChatHistory: () => void } | null>(null);

  // User preferences state
  const [receiveNotifications, setReceiveNotifications] = useState(() => {
    const value = userPreferencesService.getNotificationsPreference();
    console.log('[App] Initial notifications preference:', value);
    return value;
  });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [nutritionReminders, setNutritionReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const value = userPreferencesService.getDarkModePreference();
    console.log('[App] Initial dark mode preference:', value);
    return value;
  });
  const [language, setLanguage] = useState('es');
  const [units, setUnits] = useState('metric');

  // User data from context
  const user = {
    first_name: 'Juan',
    last_name: 'Pérez',
    username: 'juanperez',
    email: 'juan.perez@example.com',
    avatar: '',
    membership: 'Premium'
  };

  // User profile data
  const [userProfile, setUserProfile] = useState(mockProfile);

  // Manejador para actualizar campos del perfil
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejador para actualizar arrays en el perfil (como fitness_goals)
  const handleArrayFieldChange = (field: string, index: number, value: string) => {
    setUserProfile(prev => {
      const newArray = [...(prev[field as keyof typeof prev] as string[] || [])];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    // Auto-login for demo purposes
    const autoLogin = async () => {
      try {
        console.log('[App] Starting auto-login process');

        // Set a demo token
        if (!localStorage.getItem('token')) {
          console.log('[App] Setting demo token');
          localStorage.setItem('token', 'demo-token');
        } else {
          console.log('[App] Token already exists');
        }

        // Initialize user preferences if not set
        console.log('[App] Initializing user preferences');
        userPreferencesService.initializePreferences();

        const notificationsValue = userPreferencesService.getNotificationsPreference();
        console.log('[App] Setting notifications preference:', notificationsValue);
        setReceiveNotifications(notificationsValue);

        const emailNotificationsValue = userPreferencesService.getEmailNotificationsPreference();
        console.log('[App] Setting email notifications preference:', emailNotificationsValue);
        setEmailNotifications(emailNotificationsValue);

        const pushNotificationsValue = userPreferencesService.getPushNotificationsPreference();
        console.log('[App] Setting push notifications preference:', pushNotificationsValue);
        setPushNotifications(pushNotificationsValue);

        const workoutRemindersValue = userPreferencesService.getWorkoutRemindersPreference();
        console.log('[App] Setting workout reminders preference:', workoutRemindersValue);
        setWorkoutReminders(workoutRemindersValue);

        const nutritionRemindersValue = userPreferencesService.getNutritionRemindersPreference();
        console.log('[App] Setting nutrition reminders preference:', nutritionRemindersValue);
        setNutritionReminders(nutritionRemindersValue);

        const darkModeValue = userPreferencesService.getDarkModePreference();
        console.log('[App] Setting dark mode preference:', darkModeValue);
        setDarkMode(darkModeValue);

        const languageValue = userPreferencesService.getLanguagePreference();
        console.log('[App] Setting language preference:', languageValue);
        setLanguage(languageValue);

        const unitsValue = userPreferencesService.getUnitsPreference();
        console.log('[App] Setting units preference:', unitsValue);
        setUnits(unitsValue);

        console.log('[App] Auto-login completed');
        setIsLoading(false);
      } catch (error) {
        console.error('[App] Auto-login failed:', error);
        setIsLoading(false);
      }
    };

    autoLogin();
  }, []);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>;
  }

  // Select theme based on dark mode preference
  const theme = darkMode ? darkTheme : lightTheme;
  console.log('[App] Using theme:', darkMode ? 'dark' : 'light');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box className="app-container" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '75%', mx: 'auto', padding: 0, maxWidth: '75%', boxSizing: 'border-box', margin: '0 auto' }}>
          {/* App Bar / Logo Area */}
          <AppBar position="static" color="primary" elevation={0} sx={{ borderTopLeftRadius: 4, borderTopRightRadius: 4, width: '100%', boxSizing: 'border-box' }}>
            <Toolbar>
              <FitnessCenterIcon sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                SAS FITNESS AI
              </Typography>

              {/* User info */}
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <IconButton
                  onClick={handleClick}
                  size="medium"
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  sx={{ color: 'white' }}
                >
                  {user.avatar ?
                    <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} /> :
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>{user.first_name.charAt(0)}</Avatar>
                  }
                </IconButton>

                <Menu
                  id="account-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  slotProps={{
                    paper: {
                      'aria-labelledby': 'account-button',
                    }
                  }}
                >
                  <MenuItem onClick={handleClose}>
                    <Typography variant="body2">{user.first_name} {user.last_name}</Typography>
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleClose();
                    setShowConfigModal(true);
                  }}>Configuración</MenuItem>
                  <MenuItem onClick={() => {
                    handleClose();
                    // Implement logout
                    localStorage.removeItem('token');

                    // Clear chat history if reference exists
                    if (chatInterfaceRef.current) {
                      chatInterfaceRef.current.clearChatHistory();
                    }
                  }}>Cerrar Sesión</MenuItem>
                </Menu>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Main Content */}
          <Box sx={{ mt: 0, mb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0, width: '100%', padding: 0 }}>
            {/* Interfaz de chat simple para pruebas con n8n */}
            <SimpleChatInterface onRef={(ref) => (chatInterfaceRef.current = ref)} />

            {/* Section Buttons - Fixed at bottom */}
            <Box sx={{ mt: 2, mb: 1, width: '100%' }}>
              <SectionButtons />
            </Box>
          </Box>

          {/* Configuration Modal */}
          <Dialog
            open={showConfigModal}
            onClose={() => setShowConfigModal(false)}
            maxWidth="sm"
            fullWidth
            scroll="paper"
            PaperProps={{
              sx: { maxHeight: '90vh' }
            }}
          >
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
              Configuración de Perfil
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ p: 2, overflowY: 'auto' }}>
                <Typography variant="h6" gutterBottom>Información Personal</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Nombre</Typography>
                  <TextField
                    fullWidth
                    value={user.first_name}
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Apellido</Typography>
                  <TextField
                    fullWidth
                    value={user.last_name}
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Nombre de usuario</Typography>
                  <TextField
                    fullWidth
                    value={user.username}
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Correo electrónico</Typography>
                  <TextField
                    fullWidth
                    value={user.email}
                    variant="outlined"
                    disabled
                  />
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Datos Físicos</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Edad</Typography>
                  <TextField
                    fullWidth
                    name="age"
                    type="number"
                    value={userProfile?.age || ''}
                    onChange={handleProfileChange}
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Género</Typography>
                  <TextField
                    fullWidth
                    select
                    name="gender"
                    value={userProfile?.gender || ''}
                    onChange={handleProfileChange}
                    variant="outlined"
                  >
                    <MenuItem value="male">Masculino</MenuItem>
                    <MenuItem value="female">Femenino</MenuItem>
                    <MenuItem value="other">Otro</MenuItem>
                  </TextField>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Altura (cm)</Typography>
                  <TextField
                    fullWidth
                    name="height"
                    type="number"
                    value={userProfile?.height || ''}
                    onChange={handleProfileChange}
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Peso (kg)</Typography>
                  <TextField
                    fullWidth
                    name="weight"
                    type="number"
                    value={userProfile?.weight || ''}
                    onChange={handleProfileChange}
                    variant="outlined"
                  />
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Información Fitness</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Nivel de Actividad</Typography>
                  <TextField
                    fullWidth
                    select
                    name="activity_level"
                    value={userProfile?.activity_level || ''}
                    onChange={handleProfileChange}
                    variant="outlined"
                  >
                    <MenuItem value="sedentary">Sedentario</MenuItem>
                    <MenuItem value="light">Ligero</MenuItem>
                    <MenuItem value="moderate">Moderado</MenuItem>
                    <MenuItem value="active">Activo</MenuItem>
                    <MenuItem value="very_active">Muy Activo</MenuItem>
                  </TextField>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Nivel de Fitness</Typography>
                  <TextField
                    fullWidth
                    select
                    name="fitness_level"
                    value={userProfile?.fitness_level || ''}
                    onChange={handleProfileChange}
                    variant="outlined"
                  >
                    <MenuItem value="beginner">Principiante</MenuItem>
                    <MenuItem value="intermediate">Intermedio</MenuItem>
                    <MenuItem value="advanced">Avanzado</MenuItem>
                  </TextField>
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Objetivos y Condiciones</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Objetivo de Fitness</Typography>
                  <TextField
                    fullWidth
                    select
                    name="fitness_goals"
                    value={userProfile?.fitness_goals?.[0] || ''}
                    onChange={(e) => handleArrayFieldChange('fitness_goals', 0, e.target.value)}
                    variant="outlined"
                  >
                    <MenuItem value="weight_loss">Pérdida de Peso</MenuItem>
                    <MenuItem value="muscle_tone">Tonificación Muscular</MenuItem>
                    <MenuItem value="muscle_gain">Ganancia Muscular</MenuItem>
                    <MenuItem value="endurance">Resistencia</MenuItem>
                    <MenuItem value="flexibility">Flexibilidad</MenuItem>
                  </TextField>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Condiciones de Salud</Typography>
                  <TextField
                    fullWidth
                    name="health_conditions"
                    value={userProfile?.health_conditions?.[0] || 'none'}
                    onChange={(e) => handleArrayFieldChange('health_conditions', 0, e.target.value)}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Restricciones Dietéticas</Typography>
                  <TextField
                    fullWidth
                    name="dietary_restrictions"
                    value={userProfile?.dietary_restrictions?.[0] || 'none'}
                    onChange={(e) => handleArrayFieldChange('dietary_restrictions', 0, e.target.value)}
                    variant="outlined"
                  />
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Preferencias</Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Recibir notificaciones</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={receiveNotifications}
                        onChange={(e) => setReceiveNotifications(e.target.checked)}
                      />
                    }
                    label={receiveNotifications ? "Activado" : "Desactivado"}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Notificaciones por email</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                      />
                    }
                    label={emailNotifications ? "Activado" : "Desactivado"}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Notificaciones push</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                      />
                    }
                    label={pushNotifications ? "Activado" : "Desactivado"}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Recordatorios de entrenamiento</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={workoutReminders}
                        onChange={(e) => setWorkoutReminders(e.target.checked)}
                      />
                    }
                    label={workoutReminders ? "Activado" : "Desactivado"}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Recordatorios de nutrición</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={nutritionReminders}
                        onChange={(e) => setNutritionReminders(e.target.checked)}
                      />
                    }
                    label={nutritionReminders ? "Activado" : "Desactivado"}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Modo oscuro</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                      />
                    }
                    label={darkMode ? "Activado" : "Desactivado"}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Idioma</Typography>
                  <TextField
                    fullWidth
                    select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    variant="outlined"
                  >
                    <MenuItem value="es">Español</MenuItem>
                    <MenuItem value="en">Inglés</MenuItem>
                  </TextField>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Unidades</Typography>
                  <TextField
                    fullWidth
                    select
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    variant="outlined"
                  >
                    <MenuItem value="metric">Métrico (kg, cm)</MenuItem>
                    <MenuItem value="imperial">Imperial (lb, in)</MenuItem>
                  </TextField>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowConfigModal(false)}>Cancelar</Button>
              <Button variant="contained" color="primary" onClick={() => {
                console.log('[App] Saving preferences:', {
                  receiveNotifications,
                  emailNotifications,
                  pushNotifications,
                  workoutReminders,
                  nutritionReminders,
                  darkMode,
                  language,
                  units
                });
                console.log('[App] Saving profile:', userProfile);

                // Save preferences using the service
                userPreferencesService.savePreferences(
                  receiveNotifications,
                  emailNotifications,
                  pushNotifications,
                  workoutReminders,
                  nutritionReminders,
                  darkMode,
                  language,
                  units
                );

                // En un caso real, aquí guardaríamos los cambios del perfil en la base de datos
                // Por ahora, solo actualizamos el estado local
                setUserProfile(userProfile);

                // Show success message
                console.log('[App] Profile and preferences saved successfully');
                alert('Perfil y preferencias guardados correctamente');
                setShowConfigModal(false);
              }}>
                Guardar Cambios
              </Button>
            </DialogActions>
          </Dialog>

          {/* Connection Status - Eliminado */}

          {/* Footer */}
          <Box component="footer" sx={{ py: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} SAS Fitness AI - Powered by DeepSeek
            </Typography>
          </Box>
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
