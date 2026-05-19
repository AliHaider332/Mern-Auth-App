import jwt from 'jsonwebtoken';
interface TokenPayload {
  id: string;
}

export const generateToken = (id: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    { id } as TokenPayload,

    process.env.JWT_SECRET,
    { expiresIn: '1d' } // ✅ token expires in 1 day
  );
};

export const verifyToken = (token: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};
