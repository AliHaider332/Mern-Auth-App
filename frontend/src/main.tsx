import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router';
import { routes } from './Routes/Routes';
import { ToastContainer } from 'react-toastify';
import { Provider } from 'react-redux';
import { store } from './Store/configureStore';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH}>
      <Provider store={store}>
        <ToastContainer />
        <RouterProvider router={routes} />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);
