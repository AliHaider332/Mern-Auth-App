import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import CustomError from '../Configs/errorHandling';
import { user } from '../Models/userSchema';
import { UserInterface } from '../types/express';
const signupSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const validateSignupData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = signupSchema.parse(req.body);

    // ✅ Check existing user
    const userIsAlreadyPresent = await user.findOne({ email: data.email });

    if (userIsAlreadyPresent) {
      throw new CustomError(400, 'User already registered');
    }

    (req as Request & { user?: UserInterface }).user = data;

    next();
    // ✅ MUST CALL
  } catch (error) {
    next(error); // ✅ pass error properly
  }
};
