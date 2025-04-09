import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';
import axios from 'axios';
import logger from '../utils/logger';
import localStorageService from '../services/localStorageService';
import { ApiStatusContext } from '../services/api';

interface ApiStatusProviderProps {
  children: React.ReactNode;
}

export const ApiStatusProvider: React.FC<ApiStatusProviderProps> = ({ children }) => {
  const [isBackendAvailable, setBackendAvailable] = useState<boolean>(true);
  const [showFallbackNotification, setShowFallbackNotification] = useState<boolean>(false);
  const [showSyncNotification, setShowSyncNotification] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [previousAvailability, setPreviousAvailability] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Import syncService dynamically to avoid circular dependency
  const syncData = async () => {
    try {
      setIsSyncing(true);
      // Dynamic import to avoid circular dependency
      const { syncService } = await import('../services/syncService');
      const result = await syncService.syncAll();
      setSyncMessage(result.message);
      setShowSyncNotification(true);
    } catch (error) {
      logger.error('Error syncing data', error);
      setSyncMessage('Error al sincronizar datos');
      setShowSyncNotification(true);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Check if backend is available on mount
    const checkBackendAvailability = async () => {
      try {
        await axios.get('http://localhost:5000/api', { timeout: 3000 });
        const wasOffline = localStorage.getItem('backendAvailable') === 'false';

        setBackendAvailable(true);
        localStorage.setItem('backendAvailable', 'true');

        // If we were offline before and now we're online, offer to sync
        if (wasOffline && previousAvailability === false) {
          const pendingRequests = localStorageService.getPendingRequests();
          if (pendingRequests.length > 0) {
            setSyncMessage(`Conexión restablecida. Hay ${pendingRequests.length} cambios pendientes de sincronizar.`);
            setShowSyncNotification(true);
          }
        }
      } catch (error) {
        setBackendAvailable(false);
        setShowFallbackNotification(true);
        localStorage.setItem('backendAvailable', 'false');
      }

      // Update previous availability
      setPreviousAvailability(localStorage.getItem('backendAvailable') === 'true');
    };

    checkBackendAvailability();

    // Check periodically
    const interval = setInterval(checkBackendAvailability, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, [previousAvailability]);

  const dismissFallbackNotification = () => {
    setShowFallbackNotification(false);
  };

  const dismissSyncNotification = () => {
    setShowSyncNotification(false);
  };

  return (
    <ApiStatusContext.Provider
      value={{
        isBackendAvailable,
        setBackendAvailable,
        isUsingMockData: !isBackendAvailable,
        showFallbackNotification,
        dismissFallbackNotification
      }}
    >
      {children}
      <Snackbar
        open={showFallbackNotification}
        autoHideDuration={10000}
        onClose={dismissFallbackNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={dismissFallbackNotification}>
          Conectando directamente con DeepSeek. Los cambios se guardarán localmente hasta que se restablezca la conexión con el servidor.
        </Alert>
      </Snackbar>

      <Snackbar
        open={showSyncNotification}
        autoHideDuration={syncMessage.includes('Error') ? 10000 : null}
        onClose={dismissSyncNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={syncMessage}
        action={
          !syncMessage.includes('completada') && !syncMessage.includes('Error') ? (
            <Button
              color="primary"
              size="small"
              onClick={syncData}
              disabled={isSyncing}
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          ) : (
            <Button color="primary" size="small" onClick={dismissSyncNotification}>
              Cerrar
            </Button>
          )
        }
      />
    </ApiStatusContext.Provider>
  );
};
