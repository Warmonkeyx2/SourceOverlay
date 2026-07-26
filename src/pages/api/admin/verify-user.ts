import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-admin-secret'] !== ADMIN_SECRET || !ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true },
  });

  // Clean up any pending verification tokens
  await prisma.verificationToken.deleteMany({ where: { userId } });

  res.status(200).json({ success: true, message: `${userId} verified` });
}
