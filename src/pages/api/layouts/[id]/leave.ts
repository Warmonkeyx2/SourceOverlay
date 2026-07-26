import { NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { withAuth, AuthenticatedRequest } from '@/lib/auth.middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Layout ID required' });

  // Check they are a collaborator (not the owner)
  const collaborator = await prisma.layoutCollaborator.findUnique({
    where: { layoutId_userId: { layoutId: id, userId: req.userId! } },
  });

  if (!collaborator) return res.status(403).json({ error: 'You are not a collaborator on this layout' });

  await prisma.layoutCollaborator.delete({
    where: { layoutId_userId: { layoutId: id, userId: req.userId! } },
  });

  return res.status(200).json({ success: true, message: 'You have left the layout' });
}

export default withAuth(handler);
