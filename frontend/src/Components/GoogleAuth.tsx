import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { axiosInstance } from '../Config/axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../Store/Slices/User.Slice';
const GoogleAuth = () => {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      const token = await result.user.getIdToken();
      const res = await axiosInstance.get('google-auth', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(setUser(res.data.data));
      navigate('/');

      // localStorage.setItem('token', token);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button
      className="flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition duration-200 w-full"
      onClick={googleLogin}
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google"
        className="w-5 h-5"
      />

      <span className="text-gray-700 font-medium">Continue with Google</span>
    </button>
  );
};

export default GoogleAuth;
