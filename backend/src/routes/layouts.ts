import { Router, Request, Response } from 'express';
import { query } from '../db';
import { randomUUID } from 'crypto';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all layouts for current user
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM layouts WHERE owner_id = ? ORDER BY updated_at DESC`,
      [(req as any).user.id]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create layout
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, bgColor, sources } = req.body;
    const id = randomUUID();
    const now = new Date().toISOString();
    
    await query(
      `INSERT INTO layouts (id, owner_id, title, bg_color, data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, (req as any).user.id, title || 'Untitled', bgColor || '#0d1117', JSON.stringify(sources || []), now, now]
    );
    
    const result = await query(`SELECT * FROM layouts WHERE id = ?`, [id]);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get layout (owner or invited collaborator)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const layoutId = req.params.id;

    // Get layout
    const layoutResult = await query(
      `SELECT * FROM layouts WHERE id = ?`,
      [layoutId]
    );

    if (layoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    const layout = layoutResult.rows[0];

    // Check if user is owner or has permissions
    if (layout.owner_id !== userId) {
      const permResult = await query(
        'SELECT * FROM layout_permissions WHERE layout_id = ? AND user_id = ?',
        [layoutId, userId]
      );

      if (permResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(layout);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update layout (owner or collaborator with can_edit permission)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const layoutId = req.params.id;
    const { title, bgColor, data } = req.body;
    const now = new Date().toISOString();

    // Verify ownership or edit permissions
    const layoutResult = await query(
      `SELECT owner_id FROM layouts WHERE id = ?`,
      [layoutId]
    );

    if (layoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    const layout = layoutResult.rows[0];

    // If not owner, check permissions
    if (layout.owner_id !== userId) {
      const permResult = await query(
        'SELECT permission_level FROM layout_permissions WHERE layout_id = ? AND user_id = ?',
        [layoutId, userId]
      );

      if (permResult.rows.length === 0 || permResult.rows[0].permission_level !== 'can_edit') {
        return res.status(403).json({ error: 'Cannot edit this layout' });
      }
    }
    
    await query(
      `UPDATE layouts SET title = ?, bg_color = ?, data = ?, updated_at = ?
       WHERE id = ?`,
      [title, bgColor, JSON.stringify(data), now, layoutId]
    );
    
    const result = await query(`SELECT * FROM layouts WHERE id = ?`, [layoutId]);
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete layout
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `DELETE FROM layouts WHERE id = ? AND owner_id = ?`,
      [req.params.id, (req as any).user.id]
    );
    res.json({ message: 'Layout deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
