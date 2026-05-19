import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { axiosInstance } from '../Config/axios';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router';
import { BeatLoader } from 'react-spinners';
import { Shield } from 'lucide-react';
import { setUser } from '../Store/Slices/User.Slice';
import { useDispatch } from 'react-redux';
const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    console.log(token);

    const verifyToken = async () => {
      try {
        const res = await axiosInstance.get(`/verifyEmail/${token}`);
        console.log(res.data);

        setIsValidToken(true);
        navigate('/');
        dispatch(setUser(res.data.data));
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || 'Login failed';
          navigate('/');
          toast.error(message);
        } else if (error instanceof Error) {
          navigate('/');
          toast.error(error.message);
        } else {
          navigate('/');
          toast.error('Something went wrong');
        }
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  // Loading state
  if (isValidToken === null) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
        <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md text-center">
          <BeatLoader size={12} color="#3B82F6" />
          <p className="mt-4 text-gray-600">Verifying Email...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (isValidToken === false) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
        <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Request New Reset Link
          </Link>
          <Link
            to="/login"
            className="inline-block w-full mt-3 py-2 px-4 text-blue-500 hover:text-blue-600"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }
};

export default VerifyEmail;
