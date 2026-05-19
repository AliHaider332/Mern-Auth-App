// Routes/Routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../Pages/HomePage';
import App from '../App';
import Login from '../Pages/Login';
import Signup from '../Pages/Signup';
import ForgotPassword from '../Pages/ForgotPassword';
import ResetPassword from '../Pages/ResetPassword';
import VerifyEmail from '../Pages/VerifyEmail';
import PublicRoute from './PublicRoute'; // import PublicRoute
import ProtectedRoute from './ProtectedRoutes';
export const routes = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: '/signup',
        element: (
          <PublicRoute>
            <Signup />
          </PublicRoute>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <PublicRoute>
            <ProtectedRoute>
              <ForgotPassword />
            </ProtectedRoute>
          </PublicRoute>
        ),
      },
      {
        path: '/reset-password/:token',
        element: (
          <PublicRoute>
            
              <ResetPassword />
           
          </PublicRoute>
        ),
      },
      {
        path: '/verifyEmail/:token',
        element: (
          <PublicRoute>
              <VerifyEmail />
          </PublicRoute>
        ),
      },
    ],
  },
]);
