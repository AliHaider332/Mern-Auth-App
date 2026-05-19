import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { BeatLoader } from 'react-spinners';
import { Eye, EyeOff } from 'lucide-react';
import { axiosInstance } from '../Config/axios';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setUser } from '../Store/Slices/User.Slice';
import { useDispatch } from 'react-redux';
import GoogleAuth from '../Components/GoogleAuth';
// Define the form schema with Zod
const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(50, 'Full name must be less than 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Infer the TypeScript type from the schema
type SignupFormData = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const res = await axiosInstance.post('/signup', {
        name: data.fullName,
        email: data.email,
        password: data.password,
      });
      console.log(res.data);
      

      toast.success(res.data.message);
      dispatch(setUser(res.data.data));
      navigate('/');

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Signup failed';
        toast.error(message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Something went wrong');
      }
    }
    // Simulate API call
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-5">
      
      <div className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-md">
        
        {/* Heading */}
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Create Account
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Join us and get started
        </p>
  
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
  
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600">
              Full Name
            </label>
            <input
              type="text"
              {...register('fullName')}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="text-xs text-red-500">
                {errors.fullName.message}
              </p>
            )}
          </div>
  
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>
  
          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
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
            {errors.password && (
              <p className="text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
  
          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-600">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 pr-10 transition"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
  
          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="
              mt-2 py-3 px-4 text-sm font-semibold text-white 
              rounded-lg transition-all duration-200
              flex items-center justify-center gap-2
              disabled:cursor-not-allowed
              bg-blue-500 hover:bg-blue-600 active:scale-[0.98]
              disabled:bg-gray-400
            "
          >
            {isSubmitting ? (
              <BeatLoader size={8} color="#ffffff" />
            ) : (
              'Create Account'
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
  
        {/* Login Link */}
        <div className="text-center mt-5">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-600 hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        </div>
  
      </div>
    </div>
  );
};

export default Signup;
