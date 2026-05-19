import { Outlet } from 'react-router';
import Header from '../src/Components/Header';
import Footer from './Components/Footer';
import { useEffect } from 'react';
import { fetchUser } from './Store/Slices/user.thunk/user.thunk';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './Store/configureStore';

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default App;
