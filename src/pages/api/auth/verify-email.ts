import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/jwt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    // Find token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    // Check if expired
    if (new Date() > verificationToken.expiresAt) {
      await prisma.verificationToken.delete({ where: { id: verificationToken.id } });
      return res.status(401).json({ error: 'Verification token expired. Please sign up again.' });
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });

    // Delete used token
    await prisma.verificationToken.delete({ where: { id: verificationToken.id } });

    // Generate JWT so user is logged in immediately
    const jwtToken = generateToken(verificationToken.userId);

    res.status(200).json({
      success: true,
      message: 'Email verified! You are now logged in.',
      token: jwtToken,
      user: {
        id: verificationToken.user.id,
        email: verificationToken.user.email,
      },
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
