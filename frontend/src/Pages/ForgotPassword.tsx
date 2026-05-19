// ForgotPassword.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft } from 'lucide-react';
import { axiosInstance } from '../Config/axios';


const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // Backend sends an email with a reset link containing token
      await axiosInstance.post('/forgetPassword', data);
      
      setEmail(data.email);
      setIsSubmitted(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      // Don't reveal if email exists or not
      console.error('Password reset request failed:', error);
      toast.success('If an account exists, you will receive a reset link shortly');
      setEmail(data.email);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
        <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-600">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Click the link in the email to reset your password
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Back to Login
            </button>

            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full py-2 px-4 text-blue-500 hover:text-blue-600"
            >
              Try another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
      <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md">
        <button
          onClick={() => navigate('/login')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          <span>Back to Login</span>
        </button>

        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Forgot Password?
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Enter your email and we'll send you a link to reset your password
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-600">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full pl-10 pr-3 py-2.5 text-base border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              py-3 px-4 text-base font-semibold text-white 
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
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/signup" className="text-sm text-blue-500 hover:text-blue-600">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;