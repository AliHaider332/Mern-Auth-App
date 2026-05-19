import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { BeatLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react';
import { axiosInstance } from '../Config/axios';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setEmailState } from '../Store/Slices/auth.support';
import { setUser } from '../Store/Slices/User.Slice';
import GoogleAuth from '../Components/GoogleAuth';
// Login Schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// OTP Schema
const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [userEmail, setUserEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  // Handle Login - Send OTP
  const onLogin = async (data: LoginFormData) => {
    try {
      const res = await axiosInstance.post('/login', data);

      setUserEmail(data.email);
      setStep('otp');
      toast.success(res.data.message);

      // Start resend cooldown
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (data: OTPFormData) => {
    try {
      const res = await axiosInstance.post(`/verifyOTP/${data.otp}`, {
        email: userEmail,
      });

      toast.success(res.data.message);
      dispatch(setUser(res.data.data));
      navigate('/');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log(error);

        const message = error.response?.data?.message || 'Invalid OTP';
        toast.error(message);
      } else {
        toast.error('Something went wrong');
      }
      navigate('/');
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    try {
      await axiosInstance.post('/send-otp', { email: userEmail });
      toast.success('New OTP sent to your email');

      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || 'Failed to reset password';
        toast.error(message);
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  // Login Form
  if (step === 'login') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-5">
        <div className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-md">
          {/* Heading */}
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Welcome Back
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            Login to continue your journey
          </p>

          <form
            onSubmit={loginForm.handleSubmit(onLogin)}
            className="flex flex-col gap-5"
          >
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                {...loginForm.register('email')}
                className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Enter your email"
              />
              {loginForm.formState.errors.email && (
                <p className="text-xs text-red-500">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-600">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...loginForm.register('password')}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 pr-10 transition"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {loginForm.formState.errors.password && (
                <p className="text-xs text-red-500">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-blue-500 hover:text-blue-600 hover:underline"
                onClick={() => dispatch(setEmailState())}
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="
                mt-2 py-3 px-4 text-sm font-semibold text-white 
                rounded-lg transition-all duration-200
                flex items-center justify-center gap-2
                disabled:cursor-not-allowed
                bg-blue-500 hover:bg-blue-600 active:scale-[0.98]
                disabled:bg-gray-400
              "
            >
              {loginForm.formState.isSubmitting ? (
                <BeatLoader size={8} color="#ffffff" />
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Google Auth */}
          <GoogleAuth />

          {/* Signup */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don’t have an account?{' '}
              <Link
                to="/signup"
                className="text-blue-500 hover:text-blue-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification Form
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
      <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md">
        <button
          onClick={() => {
            setStep('login');
            otpForm.reset();
          }}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          <span>Back to Login</span>
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code sent to <strong>{userEmail}</strong>
          </p>
        </div>

        <form
          onSubmit={otpForm.handleSubmit(handleVerifyOTP)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="otp" className="text-sm font-medium text-gray-600">
              OTP Code
            </label>
            <input
              id="otp"
              type="text"
              {...otpForm.register('otp')}
              className="px-3 py-2.5 text-base border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
            />
            {otpForm.formState.errors.otp && (
              <p className="text-xs text-red-500 mt-1">
                {otpForm.formState.errors.otp.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={otpForm.formState.isSubmitting}
            className="
              py-3 px-4 text-base font-semibold text-white 
              rounded-md transition-all duration-200
              flex items-center justify-center gap-2
              disabled:cursor-not-allowed
              bg-blue-500 hover:bg-blue-600
              disabled:bg-gray-400
            "
          >
            {otpForm.formState.isSubmitting ? (
              <BeatLoader size={8} color="#ffffff" />
            ) : (
              'Verify & Login'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0}
              className={`
                text-sm
                ${
                  resendCooldown > 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-500 hover:text-blue-600 hover:underline'
                }
              `}
            >
              {resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : 'Resend OTP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
