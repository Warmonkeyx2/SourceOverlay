import { NextApiResponse } from 'next';
import crypto from 'crypto';
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
    const { layoutId, email, role } = req.body;

    if (!layoutId || !email || !role) {
      return res.status(400).json({ error: 'Layout ID, email, and role required' });
    }

    // Check if user owns this layout
    const layout = await prisma.layout.findFirst({
      where: { id: layoutId, userId: req.userId },
    });

    if (!layout) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Generate invite token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invite
    const invite = await prisma.invite.create({
      data: {
        email,
        token,
        role,
        layoutId,
        invitedBy: req.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      select: {
        id: true,
        email: true,
        role: true,
        token: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      invite,
      inviteUrl: `${process.env.NEXT_PUBLIC_API_URL}/accept-invite?token=${token}`,
    });
  } catch (error) {
    console.error('Create invite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
