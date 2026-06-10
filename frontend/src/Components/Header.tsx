// components/Header.tsx

import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../Store/configureStore';
import { Link } from 'react-router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { axiosInstance } from '../Config/axios';
import { LogOutUser } from '../Store/Slices/User.Slice';
import { signOut } from 'firebase/auth';
import {auth} from './firebase'
const Header = () => {
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      const res = await axiosInstance.post('/logout-user');
      await signOut(auth);
      toast.success(res.data.message);
      dispatch(LogOutUser());
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error);

        const message = error.response?.data?.message || 'Invalid OTP';
        toast.error(message);
      } else {
        toast.error('Something went wrong');
      }
    }
  };
  const { authorized, user } = useSelector((state: RootState) => state.user);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.name[0].toUpperCase()}
              </span>
            </div>
            <Link to={'/'} className="text-xl font-semibold text-gray-800">
              Auth System
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user?.name && (
              <span className="text-sm text-gray-600">Hi, {user?.name}</span>
            )}
            {authorized && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100  bg-blue-200 rounded-md transition-colors"
              >
                Logout
              </button>
            )}

            {!authorized && (
              <>
                <Link
                  to={'/signup'}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100  bg-blue-200 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  to={'/login'}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-blue-200 rounded-md transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
