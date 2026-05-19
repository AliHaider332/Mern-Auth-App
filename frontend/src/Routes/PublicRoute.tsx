// components/PublicRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../Store/configureStore';
import { BeatLoader } from 'react-spinners';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { authorized, loading } = useSelector((state: RootState) => state.user);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
        <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md text-center">
          <BeatLoader size={12} color="#3B82F6" />
        </div>
      </div>
    ); // or a spinner
  // If user is authorized, redirect to home page
  if (authorized) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>; // else render the public page
};

export default PublicRoute;
