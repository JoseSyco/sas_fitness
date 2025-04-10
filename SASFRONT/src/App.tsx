import { useState, useEffect } from 'react';
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

// Auto-login for demo purposes
import './App.css';

// Components
import ChatInterface from './components/ChatInterface';
import SectionButtons from './components/SectionButtons';
import ConnectionStatus from './components/ConnectionStatus';
import EnhancedChatInterface from './components/EnhancedChatInterface';
// Componentes de AI Coach
import StandaloneAICoachChat from './components/AICoach/StandaloneAICoachChat';

// Context
import { AuthProvider } from './context/AuthContext';
import { ApiStatusProvider } from './components/ApiStatusProvider';

// Theme configuration

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const open = Boolean(anchorEl);

  // User preferences state
  const [receiveNotifications, setReceiveNotifications] = useState(() => {
    const value = userPreferencesService.getNotificationsPreference();
    console.log('[App] Initial notifications preference:', value);
    return value;
  });
  const [darkMode, setDarkMode] = useState(() => {
    const value = userPreferencesService.getDarkModePreference();
    console.log('[App] Initial dark mode preference:', value);
    return value;
  });

  // User data from context
  const user = {
    first_name: 'Juan',
    last_name: 'Pérez',
    username: 'juanperez',
    email: 'juan.perez@example.com',
    avatar: '',
    membership: 'Premium'
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

        const darkModeValue = userPreferencesService.getDarkModePreference();
        console.log('[App] Setting dark mode preference:', darkModeValue);
        setDarkMode(darkModeValue);

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
      <ApiStatusProvider>
        <AuthProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* App Bar / Logo Area */}
          <AppBar position="static" color="primary" elevation={0}>
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
                    window.location.reload();
                  }}>Cerrar Sesión</MenuItem>
                </Menu>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Main Content */}
          <Container maxWidth="lg" sx={{ mt: 4, mb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Chat Interface */}
            {/* Descomentar la línea deseada para cambiar entre interfaces */}
            {/* <ChatInterface /> */}
            <EnhancedChatInterface />

            {/* AI Coach Chat Interface (Versión Independiente) */}
            {/* <StandaloneAICoachChat /> */}

            {/* Section Buttons - Fixed at bottom */}
            <Box sx={{ mt: 'auto', mb: 1 }}>
              <SectionButtons />
            </Box>
          </Container>

          {/* Configuration Modal */}
          <Dialog
            open={showConfigModal}
            onClose={() => setShowConfigModal(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
              Configuración de Perfil
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Información Personal</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    value={user.first_name}
                    margin="normal"
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Apellido"
                    value={user.last_name}
                    margin="normal"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Nombre de usuario"
                    value={user.username}
                    margin="normal"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Correo electrónico"
                    value={user.email}
                    margin="normal"
                    variant="outlined"
                    disabled
                  />
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Preferencias</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={receiveNotifications}
                      onChange={(e) => setReceiveNotifications(e.target.checked)}
                    />
                  }
                  label="Recibir notificaciones"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                    />
                  }
                  label="Modo oscuro"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowConfigModal(false)}>Cancelar</Button>
              <Button variant="contained" color="primary" onClick={() => {
                console.log('[App] Saving preferences:', { receiveNotifications, darkMode });

                // Save preferences using the service
                userPreferencesService.savePreferences(receiveNotifications, darkMode);

                // Show success message
                console.log('[App] Preferences saved successfully');
                alert('Preferencias guardadas correctamente');
                setShowConfigModal(false);
              }}>
                Guardar Cambios
              </Button>
            </DialogActions>
          </Dialog>

          {/* Connection Status */}
          <ConnectionStatus />

          {/* Footer */}
          <Box component="footer" sx={{ py: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} SAS Fitness AI - Powered by DeepSeek
            </Typography>
          </Box>
        </Box>
      </AuthProvider>
      </ApiStatusProvider>
    </ThemeProvider>
  );
}

export default App;
