import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CustomError from '../Configs/errorHandling';

dotenv.config();

const mongoDB_URL = process.env.MONGODB;

export const ConnectDB = async () => {
  if (!mongoDB_URL) {
    throw new CustomError(400, 'MONGODB URL is not defined');
  }

  await mongoose.connect(mongoDB_URL);

  console.log('DB connected successfully');
};
