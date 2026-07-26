import { NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { withAuth, AuthenticatedRequest } from '@/lib/auth.middleware';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Get owned layouts + collaborated layouts
    try {
      const ownedLayouts = await prisma.layout.findMany({
        where: { userId: req.userId },
        select: {
          id: true, name: true, description: true,
          createdAt: true, updatedAt: true,
          user: { select: { id: true, email: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const sharedLayouts = await prisma.layoutCollaborator.findMany({
        where: { userId: req.userId },
        include: {
          layout: {
            select: {
              id: true, name: true, description: true,
              createdAt: true, updatedAt: true,
              user: { select: { id: true, email: true } },
            },
          },
        },
      });

      return res.status(200).json({
        success: true,
        layouts: ownedLayouts.map(l => ({ ...l, isOwner: true, role: 'owner' })),
        sharedLayouts: sharedLayouts.map(c => ({ ...c.layout, isOwner: false, role: c.role })),
      });
    } catch (error) {
      console.error('Get layouts error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // Create new layout
    try {
      const { name, description, settings } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Layout name required' });
      }

      const layout = await prisma.layout.create({
        data: {
          name,
          description: description || '',
          settings: settings || {},
          userId: req.userId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
        },
      });

      return res.status(201).json({
        success: true,
        layout,
      });
    } catch (error) {
      console.error('Create layout error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
