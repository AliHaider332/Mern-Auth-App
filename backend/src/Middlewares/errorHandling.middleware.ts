import { Request, Response, NextFunction } from 'express';
import CustomError from '../Configs/errorHandling';

export const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  console.log(err);
  
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};
