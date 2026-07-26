import { NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { withAuth, AuthenticatedRequest } from '@/lib/auth.middleware';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Layout ID required' });
  }

  try {
    // Check if user owns this layout
    const layout = await prisma.layout.findFirst({
      where: { id, userId: req.userId },
    });

    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        layout: {
          ...layout,
          createdAt: layout.createdAt.toISOString(),
          updatedAt: layout.updatedAt.toISOString(),
        },
      });
    } else if (req.method === 'PUT') {
      // Update layout
      const { name, description, settings } = req.body;

      const updated = await prisma.layout.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(settings && { settings }),
        },
        select: {
          id: true,
          name: true,
          description: true,
          settings: true,
          updatedAt: true,
        },
      });

      return res.status(200).json({
        success: true,
        layout: {
          ...updated,
          updatedAt: updated.updatedAt.toISOString(),
        },
      });
    } else if (req.method === 'DELETE') {
      // Delete layout
      await prisma.layout.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: 'Layout deleted',
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Layout operation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAuth(handler);
