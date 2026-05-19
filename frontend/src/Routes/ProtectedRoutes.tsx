import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../Store/configureStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Correctly select user and loading state
  const { resetEmailState } = useSelector((state: RootState) => state.auth);
  if (!resetEmailState) {
    return <Navigate to="/login" replace />; // redirect if not authenticated
  }

  return <>{children}</>;
};

export default ProtectedRoute;
