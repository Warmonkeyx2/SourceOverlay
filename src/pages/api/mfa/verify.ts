import { NextApiResponse } from 'next';
import speakeasy from 'speakeasy';
import { prisma } from '@/lib/db';
import { withAuth, AuthenticatedRequest } from '@/lib/auth.middleware';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { secret, token } = req.body;

    if (!secret || !token) {
      return res.status(400).json({ error: 'Secret and token required' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid MFA token' });
    }

    // Enable MFA for user
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        mfaSecret: secret,
        mfaEnabled: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'MFA enabled successfully',
    });
  } catch (error) {
    console.error('MFA verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
