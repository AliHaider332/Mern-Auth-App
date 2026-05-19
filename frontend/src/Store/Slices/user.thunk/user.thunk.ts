import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../../Config/axios';
import axios from 'axios';
export const fetchUser = createAsyncThunk('user/get-user', async () => {
  try {


    const response = await axiosInstance.get('/get-user');
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Login failed';
      console.log(message);
    } else if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log('Something went wrong');
    }
  }
});
