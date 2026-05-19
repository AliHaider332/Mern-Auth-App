import axios from 'axios';
const server: string = import.meta.env.VITE_SERVER;
export const axiosInstance = axios.create({
  baseURL: server,
  withCredentials: true, // 👈 this is what you need
});
