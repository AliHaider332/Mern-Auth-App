import { asyncHandler } from '../Configs/asyncHandler';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { user } from '../Models/userSchema';
import CustomError from '../Configs/errorHandling';
import { UserInterface } from '../types/express';
import { sendEmail, sendOTP, sendResetEmail } from '../Services/nodemailer';
import { generateToken, verifyToken } from '../Services/JWT';
import crypto from 'crypto';
import admin from '../Configs/firebase';
const isProd = process.env.NODE_ENV === 'production';
console.log(isProd);

export const signupController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = (req as Request & { user?: UserInterface }).user;

    if (!data) {
      throw new CustomError(400, 'User missing');
    }

    const { name, email, password } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await user.create({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = generateToken(newUser._id.toString());
    res.cookie('uid', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    await sendEmail(name.split(' ')[0], email, newUser._id.toString());

    res.status(201).json({
      success: true,
      message: 'Signup successful. Verification link sent to email.',
      data: {
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified,
      },
    });
  }
);
export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError(400, 'All fields are require');
  }
  const registeredUser = await user.findOne({ email });
  if (!registeredUser) {
    throw new CustomError(400, 'User is not register');
  }
  let checkPassword;
  if (registeredUser.password) {
    checkPassword = await bcrypt.compare(password, registeredUser.password);
  }

  if (!checkPassword) {
    throw new CustomError(400, 'Password is not match');
  }
  const OTP: number = Math.floor(100000 + Math.random() * 900000);

  registeredUser.otp = OTP;
  registeredUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await registeredUser.save();

  await sendOTP(registeredUser.name.split(' ')[0], email, OTP);
  res.status(201).json({
    success: true,
    message: 'OTP sent to email.',
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new CustomError(400, 'All fields are require');
  }
  const requireUser = await user.findOne({ _id: id });

  if (!requireUser) {
    return res.status(400).json({
      success: false,
      message: 'Email is not registered',
    });
  }

  requireUser.isVerified = true;
  await requireUser.save();

  res.status(200).json({
    success: true,
    message: 'Email Verified successfully',
    data: {
      name: requireUser.name,
      email: requireUser.email,
      isVerified: requireUser.isVerified,
    },
  });
});

export const sendAgainOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError(400, 'All fields are require');
  }
  const requireUser = await user.findOne({ email });
  if (!requireUser) {
    throw new CustomError(400, 'User is not register');
  }
  const OTP: number = Math.floor(100000 + Math.random() * 900000);

  requireUser.otp = OTP;
  requireUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await requireUser.save();

  await sendOTP(requireUser.name.split(' ')[0], email, OTP);
  res.status(201).json({
    success: true,
    message: 'OTP sent to email.',
  });
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { otp } = req.params;
  const { email } = req.body;

  if (!email || !otp) {
    throw new CustomError(400, 'All fields are require');
  }
  const requireUser = await user.findOne({ email });
  if (!requireUser) {
    throw new CustomError(400, 'User is not register');
  }
  if (!requireUser.otp) {
    return res.status(400).json({
      success: false,
      message: 'Generate an OTP',
    });
  }
  if (!requireUser.otpExpiry || requireUser.otpExpiry < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'OTP has expired',
    });
  }

  if (!requireUser.otp || requireUser.otp.toString() != otp.toString()) {
    return res.status(400).json({
      success: false,
      message: 'OTP not match',
    });
  }
  const token = generateToken(requireUser._id.toString());
  res.cookie('uid', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
  requireUser.otp = null;
  requireUser.otpExpiry = null;
  await requireUser.save();
  res.status(200).json({
    success: true,
    message: 'Login successfully',
    data: {
      name: requireUser.name,
      email: requireUser.email,
      isVerified: requireUser.isVerified,
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  // const requireUser = (req as Request & { user?: any }).user;
  const { email } = req.body;
  if (!email) {
    throw new CustomError(400, 'All fields are require');
  }

  const requireUser = await user.findOne({ email });
  if (!requireUser) {
    throw new CustomError(400, 'User is not register');
  }
  // 🔹 Generate raw token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 🔹 Hash token before saving (security)
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  requireUser.resetPasswordToken = hashedToken;
  requireUser.resetPasswordExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  await requireUser.save();

  // 🔹 Send RAW token in email (not hashed)
  await sendResetEmail(
    requireUser.name.split(' ')[0],
    requireUser.email,
    resetToken
  );
  res.status(200).json({
    success: true,
    message: 'Reset link sent to email',
  });
});
export const verifyForgotPasswordToken = asyncHandler(async (req, res) => {
  const { token } = req.params as any;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const requireUser = await user.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
  });
  if (!requireUser) {
    return res.status(400).json({
      success: false,
      message: 'Token is invalid or expired',
    });
  }
  res.status(200).json({
    success: true,
    message: 'successfully verify token',
  });
});
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params as any;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const requireUser = await user.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
  });

  if (!requireUser) {
    return res.status(400).json({
      success: false,
      message: 'Token is invalid or expired',
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  requireUser.password = hashedPassword;

  requireUser.resetPasswordToken = null;
  requireUser.resetPasswordExpire = null;
  const cookieToken = generateToken(requireUser._id.toString());
  res.cookie('uid', cookieToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });

  await requireUser.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});

export const getUser = asyncHandler(async (req, res) => {
  try {
    // Get the token from cookies
    const { uid } = req.cookies;

    if (!uid) {
      return res.status(401).json({ message: 'No token found' });
    }

    // Verify token
    const decoded: any = verifyToken(uid); // Usually returns { id, email, ... }

    if (!decoded?.id) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Fetch user from DB
    const requireUser = await user.findById(decoded.id); // Exclude password

    if (!requireUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data
    res.status(200).json(requireUser);
  } catch (error) {
    res.status(500);
    throw new Error('Failed to get user');
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('uid', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });

  res.status(200).json({
    message: 'Logged out successfully',
  });
});
export const sendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError(400, 'All fields are require');
  }
  const requireUser = await user.findOne({ email });
  if (!requireUser) {
    throw new CustomError(400, 'User is not register');
  }
  const token = generateToken(requireUser._id.toString());
  res.cookie('uid', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
  await sendEmail(
    requireUser.name.split(' ')[0],
    email,
    requireUser._id.toString()
  );

  res.status(201).json({
    success: true,
    message: 'Verification link sent to email.',
  });
});

export const fireBaseAuth = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] as string;

  const decoded = await admin.auth().verifyIdToken(token);

  const { name, email, uid } = decoded;

  let USER = await user.findOne({ email });

  if (!USER) {
    USER = await user.create({
      name,
      email,
      firebaseUID: uid,
      isVerified: true,
    });
  }

  const cookieToken = generateToken(USER._id.toString()) as string;

  res.cookie('uid', cookieToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,

    message: 'Google authenticate successfully',

    data: {
      name: USER.name,
      email: USER.email,
      isVerified: USER.isVerified,
    },
  });
});
