import express from 'express';
import dotenv from 'dotenv';
import { ConnectDB } from './DataBase/DBSetup';
import { errorMiddleware } from './Middlewares/errorHandling.middleware';
import userRoute from './Routes/userRoutes';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ROUTE,
    credentials: true,
  })
);
app.use(userRoute);
app.use(errorMiddleware);
const PORT: number = Number(process.env.PORT) || 9000;

const startServer = async () => {
  try {
    await ConnectDB();

    app.listen(PORT, () => {
      console.log(`Server is running at ${PORT} Port`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();