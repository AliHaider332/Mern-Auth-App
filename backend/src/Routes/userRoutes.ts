import express from 'express';
import {
  forgotPassword,
  loginController,
  resetPassword,
  signupController,
  verifyEmail,
  verifyOTP,
  verifyForgotPasswordToken,
  sendAgainOTP,
  getUser,
  logoutUser,
  sendVerificationEmail,
  fireBaseAuth,
} from '../Controllers/userController';
import { validateSignupData } from '../Middlewares/validateData';
const userRoute = express.Router();
userRoute.post('/signup', validateSignupData, signupController);
userRoute.post('/login', loginController);
userRoute.get('/verifyEmail/:id', verifyEmail);
userRoute.post('/verifyOTP/:otp', verifyOTP);
userRoute.post('/forgetPassword', forgotPassword);
userRoute.get('/verifyToken/:token', verifyForgotPasswordToken);
userRoute.post('/resetPassword/:token', resetPassword);
userRoute.post('/send-otp', sendAgainOTP);
userRoute.get('/get-user', getUser);
userRoute.get('/logout-user', logoutUser);
userRoute.post('/send-verification-email-again', sendVerificationEmail);
userRoute.get('/google-auth', fireBaseAuth);
export default userRoute;
