import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useApiStatus } from '../services/api';

const ConnectionStatus: React.FC = () => {
  const { isBackendAvailable, isUsingMockData } = useApiStatus();

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      <Tooltip
        title={isBackendAvailable
          ? "Conectado al servidor"
          : "Conectando directamente con DeepSeek AI. Los datos se guardarán localmente y se sincronizarán cuando se restablezca la conexión."
        }
      >
        <Chip
          icon={isBackendAvailable ? <CloudDoneIcon /> : <SmartToyIcon />}
          label={isBackendAvailable ? "Conectado" : "DeepSeek AI"}
          color={isBackendAvailable ? "success" : "info"}
          size="small"
          sx={{
            boxShadow: 2,
            '&:hover': {
              boxShadow: 3
            }
          }}
        />
      </Tooltip>
    </Box>
  );
};

export default ConnectionStatus;
