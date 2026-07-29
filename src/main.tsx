import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { ConfiguracionProvider } from './modulos/configuracion/ConfiguracionProvider';
import './estilos.css';

const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <QueryClientProvider client={clienteConsultas}>
      <BrowserRouter>
        <ConfiguracionProvider>
          <App />
        </ConfiguracionProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
