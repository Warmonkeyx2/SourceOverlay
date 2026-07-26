import { NextApiResponse } from 'next';
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
    // Disable MFA for user
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        mfaSecret: null,
        mfaEnabled: false,
      },
    });

    res.status(200).json({
      success: true,
      message: 'MFA disabled successfully',
    });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
