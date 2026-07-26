import { NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { withAuth, AuthenticatedRequest } from '@/lib/auth.middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Layout ID required' });

  if (req.method === 'GET') {
    // List collaborators for a layout
    const layout = await prisma.layout.findFirst({
      where: {
        id,
        OR: [
          { userId: req.userId },
          { collaborators: { some: { userId: req.userId } } },
        ],
      },
    });
    if (!layout) return res.status(404).json({ error: 'Layout not found' });

    const collaborators = await prisma.layoutCollaborator.findMany({
      where: { layoutId: id },
      include: { user: { select: { id: true, email: true } } },
    });

    return res.status(200).json({ success: true, collaborators });

  } else if (req.method === 'POST') {
    // Add collaborator by userId (owner only)
    const layout = await prisma.layout.findFirst({ where: { id, userId: req.userId } });
    if (!layout) return res.status(403).json({ error: 'Only the owner can add collaborators' });

    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ error: 'userId and role required' });
    if (userId === req.userId) return res.status(400).json({ error: 'Cannot add yourself as collaborator' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.layoutCollaborator.findUnique({
      where: { layoutId_userId: { layoutId: id, userId } },
    });
    if (existing) return res.status(409).json({ error: 'User is already a collaborator' });

    const collaborator = await prisma.layoutCollaborator.create({
      data: { layoutId: id, userId, role },
      include: { user: { select: { id: true, email: true } } },
    });

    return res.status(201).json({ success: true, collaborator });

  } else if (req.method === 'DELETE') {
    // Remove collaborator (owner only)
    const layout = await prisma.layout.findFirst({ where: { id, userId: req.userId } });
    if (!layout) return res.status(403).json({ error: 'Only the owner can remove collaborators' });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    await prisma.layoutCollaborator.deleteMany({ where: { layoutId: id, userId } });

    return res.status(200).json({ success: true, message: 'Collaborator removed' });

  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
