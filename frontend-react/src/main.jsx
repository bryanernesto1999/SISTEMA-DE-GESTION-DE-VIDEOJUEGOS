import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@tabler/icons-webfont/tabler-icons.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/estilos.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);