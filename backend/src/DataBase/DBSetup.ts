import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CustomError from '../Configs/errorHandling';

dotenv.config();

const mongoDB_URL = process.env.MONGODB;

export const ConnectDB = async () => {
  try {
    if (!mongoDB_URL) {
      throw new CustomError(400, 'MONGODB URL is not defined');
    }

    await mongoose.connect(mongoDB_URL);
    console.log('DB connected successfully');
  } catch (error) {
    console.error('DB connection failed:', error);
    process.exit(1); // stop server if DB fails
  }
};
