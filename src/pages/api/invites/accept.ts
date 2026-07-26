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
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Invite token required' });
    }

    // Find invite
    const invite = await prisma.invite.findUnique({
      where: { token },
    });

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      return res.status(401).json({ error: 'Invite expired' });
    }

    // Check if email matches user's email
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (user?.email !== invite.email) {
      return res.status(403).json({ error: 'Invite email does not match' });
    }

    // Add user as collaborator
    const collaborator = await prisma.layoutCollaborator.create({
      data: {
        layoutId: invite.layoutId,
        userId: req.userId,
        role: invite.role,
      },
      select: {
        id: true,
        role: true,
        layout: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Delete invite
    await prisma.invite.delete({
      where: { id: invite.id },
    });

    res.status(200).json({
      success: true,
      message: 'Invite accepted',
      collaborator,
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
