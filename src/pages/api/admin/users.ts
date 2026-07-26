import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-admin-secret'] !== ADMIN_SECRET || !ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        emailVerified: true,
        mfaEnabled: true,
        createdAt: true,
        _count: { select: { layouts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ users });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
