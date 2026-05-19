// ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { axiosInstance } from '../Config/axios';
import axios from 'axios';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axiosInstance.get(`/verifyToken/${token}`);
        setIsValidToken(true);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || 'Login failed';
          toast.error(message);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Something went wrong');
        }
        navigate('/');
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsResetting(true);
    try {
      await axiosInstance.post(`/resetPassword/${token}`, {
        password: data.password,
      });

      toast.success(
        'Password reset successful! Please login with your new password'
      );

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || 'Failed to reset password';
        toast.error(message);
      } else {
        toast.error('Something went wrong');
      }
      navigate('/');
    } finally {
      setIsResetting(false);
    }
  };

  // Loading state
  if (isValidToken === null) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
        <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md text-center">
          <BeatLoader size={12} color="#3B82F6" />
          <p className="mt-4 text-gray-600">Verifying Reset link...</p>
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

  // Success state after reset
  if (isResetting && !isSubmitting) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
        <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Password Reset Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting you to login page...
          </p>
        </div>
      </div>
    );
  }

  const password = watch('password');

  // Valid token - show reset password form
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
      <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Reset Password
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Create a new password for your account
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-600"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                placeholder="Enter new password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}

            {/* Password strength indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  <div
                    className={`h-1 flex-1 rounded ${
                      password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded ${
                      /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded ${
                      /[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded ${
                      /[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded ${
                      /[^A-Za-z0-9]/.test(password)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Password must contain at least 8 characters, uppercase,
                  lowercase, number, and special character
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-600"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                placeholder="Confirm new password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              mt-2 py-3 px-4 text-base font-semibold text-white 
              rounded-md transition-all duration-200
              flex items-center justify-center gap-2
              disabled:cursor-not-allowed
              bg-blue-500 hover:bg-blue-600
              disabled:bg-gray-400
            "
          >
            {isSubmitting ? (
              <BeatLoader size={8} color="#ffffff" />
            ) : (
              'Reset Password'
            )}
          </button>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
