import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  resetEmailState: boolean;
}

const initialState: AuthState = {
  resetEmailState: false,
};

const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setEmailState(state) {
      state.resetEmailState = true;
    },
  },
});

export const { setEmailState } = auth.actions;
export default auth.reducer;
