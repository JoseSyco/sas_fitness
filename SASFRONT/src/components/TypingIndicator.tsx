import React from 'react';
import { Box, keyframes } from '@mui/material';

const bounce = keyframes`
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  40% {
    transform: translateY(-5px);
    opacity: 1;
  }
`;

const TypingIndicator: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 10,
            height: 10,
            bgcolor: '#e91e63',
            borderRadius: '50%',
            animation: `${bounce} 1.4s ease-in-out ${i * 0.16}s infinite both`,
          }}
        />
      ))}
    </Box>
  );
};

export default TypingIndicator;
