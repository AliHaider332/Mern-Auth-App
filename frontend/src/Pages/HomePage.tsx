import { useSelector } from 'react-redux';
import type { RootState } from '../Store/configureStore';

import { BeatLoader } from 'react-spinners';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { axiosInstance } from '../Config/axios';

const HomePage = () => {
  const { user, loading, authorized } = useSelector(
    (state: RootState) => state.user
  );
  const navigate = useNavigate();
  const handleVerification = async () => {
    try {
      const res = await axiosInstance.post('/send-verification-email-again', {
        email: user?.email,
      });
      toast.success(res.data.message);
    } catch (error) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
        <div className="bg-white rounded-lg p-10 shadow-md w-full max-w-md text-center">
          <BeatLoader size={12} color="#3B82F6" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {authorized && (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
                {/* Left Side */}
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      user?.isVerified
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {user?.isVerified ? 'Verified Account' : 'Not Verified'}
                  </span>

                  {!user?.isVerified && (
                    <span className="text-xs text-gray-500">
                      Please verify your account
                    </span>
                  )}
                </div>

                {/* Right Side */}
                {!user?.isVerified && (
                  <button
                    className="px-4 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-200 shadow-sm"
                    onClick={handleVerification}
                  >
                    Verify Now
                  </button>
                )}
              </div>
            )}

            {/* Welcome Section */}
            <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 mb-12">
              <div className="max-w-3xl">
                {authorized ? (
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Welcome back, {user?.name}! 👋
                  </h1>
                ) : (
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    👋 Hi Sir Please Register
                  </h1>
                )}
                <p className="text-blue-100 text-lg mb-6">
                  We're glad to see you again. Here's what's happening with your
                  account today.
                </p>
                <div className="flex gap-4">
                  <button className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                    Get Started
                  </button>
                  <button className="px-6 py-2 border border-white text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Visits
                  </h3>
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-800">1,234</p>
                <p className="text-sm text-gray-500 mt-2">
                  +12% from last week
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Active Sessions
                  </h3>
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-800">3</p>
                <p className="text-sm text-gray-500 mt-2">Currently active</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Completion Rate
                  </h3>
                  <svg
                    className="w-5 h-5 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-gray-800">87%</p>
                <p className="text-sm text-gray-500 mt-2">
                  +5% from last month
                </p>
              </div>
            </div>

            {/* Features Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Quick Actions
                  </h3>
                  <p className="text-gray-600">
                    Perform common tasks quickly and efficiently with our
                    streamlined interface.
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Real-time Updates
                  </h3>
                  <p className="text-gray-600">
                    Stay informed with live updates and notifications about your
                    activity.
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Analytics
                  </h3>
                  <p className="text-gray-600">
                    Get detailed insights and analytics about your usage
                    patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
};

export default HomePage;
