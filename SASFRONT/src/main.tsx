import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './global.css'
import App from './App.tsx'

// Eliminar cualquier padding o margen del elemento root
document.documentElement.style.margin = '0';
document.documentElement.style.padding = '0';
document.documentElement.style.width = '100%';
document.documentElement.style.boxSizing = 'border-box';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
