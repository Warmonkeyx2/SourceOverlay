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

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });

  // Clean up any pending verification tokens
  await prisma.verificationToken.deleteMany({ where: { userId: user.id } });

  res.status(200).json({ success: true, message: `${email} verified` });
}
