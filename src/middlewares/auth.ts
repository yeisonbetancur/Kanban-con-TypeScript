import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Definición de un tipo para las propiedades adicionales en la solicitud
interface AuthenticatedRequest extends Request {
  user?: string | object; // dependiendo de la estructura del token decodificado
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

