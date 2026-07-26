import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '10m' });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if session still exists and is valid
    const sessionResult = await query(
      `SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Session expired' });
    }

    // Update last_activity
    await query(
      `UPDATE sessions SET last_activity = datetime('now') WHERE token = ?`,
      [token]
    );

    // Get user info
    const userResult = await query(
      `SELECT id, email, username, profile_icon FROM users WHERE id = ?`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = userResult.rows[0];
    req.token = token;
    next();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const userResult = await query(
          `SELECT id, email, username, profile_icon FROM users WHERE id = ?`,
          [decoded.userId]
        );

        if (userResult.rows.length > 0) {
          req.user = userResult.rows[0];
          req.token = token;
        }
      }
    }
    next();
  } catch (err) {
    next();
  }
};

// Keep for backward compatibility
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  optionalAuth(req, res, next);
};
