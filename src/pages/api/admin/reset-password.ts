import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.headers['x-admin-secret'] !== ADMIN_SECRET || !ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'userId and newPassword required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ success: true, message: `Password reset for ${userId}` });
  } catch (err: any) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}
