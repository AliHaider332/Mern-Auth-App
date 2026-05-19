import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchUser } from './user.thunk/user.thunk';

type User = {
  name: string;
  email: string;
  isVerified: boolean;
};

interface UserState {
  user: User | null;
  authorized: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  authorized: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthorized(state) {
      state.authorized = true;
    },
    LogOutUser(state) {
      state.authorized = false;
      state.user = null;
    },
    setUser(state, action) {
      state.authorized = true;
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        if (action.payload) {
          state.authorized = true;
        }
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.authorized = false;
        state.user = null;
        state.error = action.error.message || 'Failed to fetch user';
      });
  },
});

export const { setAuthorized, LogOutUser, setUser } = userSlice.actions;
export default userSlice.reducer;
