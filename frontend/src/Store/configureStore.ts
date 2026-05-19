import { configureStore } from '@reduxjs/toolkit';
import UserReducer from './Slices/User.Slice';
import AuthReducer from './Slices/auth.support';
export const store = configureStore({
  reducer: {
    user: UserReducer,
    auth: AuthReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
