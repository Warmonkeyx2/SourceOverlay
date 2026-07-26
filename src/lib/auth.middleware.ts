import { NextApiRequest, NextApiResponse } from 'next';
import { extractTokenFromHeader, verifyToken } from './jwt';

export type AuthenticatedRequest = NextApiRequest & { userId?: string };

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    req.userId = decoded.userId;
    return handler(req, res);
  };
}
