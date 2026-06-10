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
import { setUser } from '../Store/Slices/User.Slice';
import { useDispatch } from 'react-redux';

// Enhanced password schema with strength requirements
const resetPasswordSchema = z
  .object({
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Password Strength Indicator Component
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const criteria = [
    { label: '8+ characters', test: (p: string) => p.length >= 8 },
    { label: 'Uppercase', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Lowercase', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  const strength = criteria.filter(c => c.test(password)).length;
  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {criteria.map((criterion, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 rounded transition-all duration-300 ${
              criterion.test(password) ? getStrengthColor() : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        Password strength: {strength}/{criteria.length} criteria met
      </p>
      <div className="mt-1">
        <p className="text-xs text-gray-500">
          Password must contain: {criteria.map(c => c.label).join(', ')}
        </p>
      </div>
    </div>
  );
};

// Loading Component
const LoadingState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
    <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md text-center">
      <BeatLoader size={12} color="#3B82F6" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

// Invalid Token Component
const InvalidTokenState: React.FC = () => (
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

// Success Component
const SuccessState: React.FC = () => {
  const navigate = useNavigate();
  const dispatch=useDispatch()
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
      dispatch(setUser({}));
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
      <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Password Reset Successful!
        </h2>
        <p className="text-gray-600 mb-4">
          Your password has been reset successfully.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting you to login page in 5 seconds...
        </p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium"
        >
          Click here to login now
        </button>
      </div>
    </div>
  );
};

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useParams<{ token: string }>();
  
  // State management
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange', // Validate on change for better UX
  });

  const password = watch('password');

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setIsVerifying(false);
        toast.error('No reset token provided');
        navigate('/forgot-password');
        return;
      }

      try {
        await axiosInstance.get(`/verifyToken/${token}`);
        setIsValidToken(true);
      } catch (error: unknown) {
        setIsValidToken(false);
        if (error instanceof Error) {
          toast.error(error.message || 'Invalid or expired reset link');
        } else {
          toast.error('Unable to verify reset link');
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    // Rate limiting check (5 seconds cooldown)
    const now = Date.now();
    if (now - lastAttempt < 5000) {
      toast.error('Please wait 5 seconds before trying again');
      return;
    }
    setLastAttempt(now);

    setIsResetting(true);
    
    try {
      const response = await axiosInstance.post(`/resetPassword/${token}`, {
        password: data.password,
      });

      if (response.data.success) {
        setResetSuccess(true);
        toast.success('Password reset successful! Redirecting to login...');
        
        // If the API returns user data, dispatch it
        if (response.data.data) {
          dispatch(setUser(response.data.data));
        }
        
        // Reset form
        reset();
      } else {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (error: unknown) {
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as any;
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      toast.error(errorMessage);
      
      // If token is invalid/expired, redirect to forgot password
      if (errorMessage.toLowerCase().includes('invalid') || 
          errorMessage.toLowerCase().includes('expired')) {
        setTimeout(() => {
          navigate('/forgot-password');
        }, 2000);
      }
    } finally {
      setIsResetting(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return <LoadingState message="Verifying reset link..." />;
  }

  // Invalid token state
  if (isValidToken === false) {
    return <InvalidTokenState />;
  }

  // Success state
  if (resetSuccess) {
    return <SuccessState />;
  }

  // Valid token - show reset password form
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-5">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Reset Password
            </h1>
            <p className="text-gray-600 mt-2">
              Create a new password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full px-3 py-2.5 text-base border rounded-md outline-none focus:ring-2 transition-all pr-10
                    ${errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  placeholder="Enter new password"
                  disabled={isSubmitting || isResetting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1 animate-shake">
                  {errors.password.message}
                </p>
              )}
              
              {/* Password strength indicator */}
              <PasswordStrengthIndicator password={password} />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-gray-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className={`w-full px-3 py-2.5 text-base border rounded-md outline-none focus:ring-2 transition-all pr-10
                    ${errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  placeholder="Confirm new password"
                  disabled={isSubmitting || isResetting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1 animate-shake">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Password requirements summary */}
            <div className="bg-blue-50 rounded-md p-3 text-xs text-blue-800">
              <p className="font-semibold mb-1">Password requirements:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
                <li>Contains at least one special character</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isResetting || !isValidToken}
              className="
                mt-2 py-3 px-4 text-base font-semibold text-white 
                rounded-md transition-all duration-200
                flex items-center justify-center gap-2
                disabled:cursor-not-allowed
                bg-blue-600 hover:bg-blue-700
                disabled:bg-gray-400
                transform hover:scale-[1.02] active:scale-[0.98]
              "
            >
              {(isSubmitting || isResetting) ? (
                <>
                  <BeatLoader size={8} color="#ffffff" />
                  <span>Resetting Password...</span>
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <div className="text-center mt-4 pt-4 border-t border-gray-200">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                ← Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;