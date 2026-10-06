import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('FATAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing or empty.');
  }
  return secret;
}

export interface AuthUserPayload {
  userId: string;
  role: 'admin' | 'student';
  email: string;
  studentId?: string; // populated if student
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No bearer token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
}

export function requireRole(...allowedRoles: Array<'admin' | 'student'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }
    next();
  };
}
