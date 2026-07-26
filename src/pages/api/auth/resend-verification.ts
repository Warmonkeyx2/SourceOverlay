import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Return success even if user not found (prevent email enumeration)
    if (!user || user.emailVerified) {
      return res.status(200).json({ success: true, message: 'If that email exists and is unverified, a new link has been sent.' });
    }

    // Delete any existing tokens
    await prisma.verificationToken.deleteMany({ where: { userId: user.id, type: 'email' } });

    // Create new token
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        token,
        type: 'email',
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(email, token);

    res.status(200).json({ success: true, message: 'Verification email sent! Check your inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
