import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authMiddleware } from '../middleware/auth';
import { randomUUID } from 'crypto';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create an invite (owner invites someone to collaborate on a layout)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { layoutId, toEmail, toUserId } = req.body;
    const fromUserId = (req as any).user.id;

    // Validate that layout exists and user is owner
    const layoutResult = await query(
      'SELECT owner_id FROM layouts WHERE id = ?',
      [layoutId]
    );

    if (layoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    if (layoutResult.rows[0].owner_id !== fromUserId) {
      return res.status(403).json({ error: 'Only owner can invite collaborators' });
    }

    // Must provide either email or userId
    if (!toEmail && !toUserId) {
      return res.status(400).json({ error: 'Provide either toEmail or toUserId' });
    }

    let invitedUserId: string | null = null;
    let invitedEmail: string | null = null;

    // If inviting by user ID
    if (toUserId) {
      const userResult = await query(
        'SELECT id, email, email_verified FROM users WHERE id = ?',
        [toUserId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!userResult.rows[0].email_verified) {
        return res.status(400).json({ error: 'User must have verified email to be invited' });
      }

      invitedUserId = toUserId;
      invitedEmail = userResult.rows[0].email;
    }
    // If inviting by email
    else if (toEmail) {
      const userResult = await query(
        'SELECT id, email_verified FROM users WHERE email = ?',
        [toEmail]
      );

      if (userResult.rows.length === 0) {
        return res.status(400).json({ error: 'No account found with that email. User must create account first.' });
      }

      if (!userResult.rows[0].email_verified) {
        return res.status(400).json({ error: 'User must have verified email to be invited' });
      }

      invitedUserId = userResult.rows[0].id;
      invitedEmail = toEmail;
    }

    // Check if already invited or collaborator
    const existingInvite = await query(
      `SELECT id FROM invites 
       WHERE layout_id = ? AND to_user_id = ? AND status = 'pending'`,
      [layoutId, invitedUserId]
    );

    if (existingInvite.rows.length > 0) {
      return res.status(400).json({ error: 'User already invited to this layout' });
    }

    // Check if already has permissions
    const existingPermission = await query(
      'SELECT id FROM layout_permissions WHERE layout_id = ? AND user_id = ?',
      [layoutId, invitedUserId]
    );

    if (existingPermission.rows.length > 0) {
      return res.status(400).json({ error: 'User already has access to this layout' });
    }

    // Create the invite
    const inviteId = randomUUID();
    await query(
      `INSERT INTO invites (id, from_user_id, to_user_id, to_email, layout_id, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [inviteId, fromUserId, invitedUserId, invitedEmail, layoutId]
    );

    const result = await query('SELECT * FROM invites WHERE id = ?', [inviteId]);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending invites for current user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await query(
      `SELECT i.*, l.title as layout_title, u.username as from_username
       FROM invites i
       JOIN layouts l ON i.layout_id = l.id
       JOIN users u ON i.from_user_id = u.id
       WHERE i.to_user_id = ? AND i.status = 'pending'
       ORDER BY i.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Accept an invite
router.post('/:id/accept', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Verify invite belongs to this user
    const inviteResult = await query(
      'SELECT * FROM invites WHERE id = ?',
      [id]
    );

    if (inviteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    const invite = inviteResult.rows[0];

    if (invite.to_user_id !== userId) {
      return res.status(403).json({ error: 'This invite is not for you' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ error: `Invite already ${invite.status}` });
    }

    // Update invite status
    await query(
      'UPDATE invites SET status = ? WHERE id = ?',
      ['accepted', id]
    );

    // Add permission to layout_permissions
    const permissionId = randomUUID();
    await query(
      `INSERT INTO layout_permissions (id, layout_id, user_id, permission_level)
       VALUES (?, ?, ?, ?)`,
      [permissionId, invite.layout_id, userId, 'can_edit']
    );

    const result = await query('SELECT * FROM invites WHERE id = ?', [id]);
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reject an invite
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // Verify invite belongs to this user
    const inviteResult = await query(
      'SELECT * FROM invites WHERE id = ?',
      [id]
    );

    if (inviteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    const invite = inviteResult.rows[0];

    if (invite.to_user_id !== userId) {
      return res.status(403).json({ error: 'This invite is not for you' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ error: `Invite already ${invite.status}` });
    }

    // Update invite status
    await query(
      'UPDATE invites SET status = ? WHERE id = ?',
      ['rejected', id]
    );

    const result = await query('SELECT * FROM invites WHERE id = ?', [id]);
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
