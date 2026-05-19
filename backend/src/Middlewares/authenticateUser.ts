import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../Configs/asyncHandler';
import CustomError from '../Configs/errorHandling';
import { verifyToken } from '../Services/JWT';
import { user } from '../Models/userSchema';

interface JwtPayload {
  id: string;
}

export const checkAuthentication = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { uid } = req.cookies;
    
    
    if (!uid) {
      throw new CustomError(400, 'Please login first');
    }

    const decoded = verifyToken(uid) as JwtPayload;
    const id = decoded.id;

    const data = await user.findById(id);

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    (req as any).user = data;

    next();
  }
);