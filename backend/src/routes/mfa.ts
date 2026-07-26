import { Router, Request, Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { runDB } from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Generate MFA secret and QR code
router.post('/mfa/setup', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `SourceNinja (${(req as any).userEmail})`,
      issuer: process.env.MFA_ISSUER || 'SourceNinja',
      length: 32,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

    res.json({
      secret: secret.base32,
      qrCode,
      backupCodes: generateBackupCodes(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Enable MFA (verify token and save secret)
router.post('/mfa/enable', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { secret, token } = req.body;

    if (!secret || !token) {
      return res.status(400).json({ error: 'Missing secret or token' });
    }

    // Verify the token with the secret
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: parseInt(process.env.MFA_WINDOW || '2'),
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid MFA token' });
    }

    // Save MFA secret to database
    await runDB(
      'UPDATE users SET mfa_enabled = true, mfa_secret = $1 WHERE id = $2',
      [secret, userId]
    );

    res.json({ success: true, message: 'MFA enabled successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Verify MFA token during login
router.post('/mfa/verify', async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: 'Missing userId or token' });
    }

    // Get user's MFA secret
    const result = await runDB(
      'SELECT mfa_secret FROM users WHERE id = $1 AND mfa_enabled = true',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'MFA not enabled for this user' });
    }

    const mfaSecret = result.rows[0].mfa_secret;

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: mfaSecret,
      encoding: 'base32',
      token,
      window: parseInt(process.env.MFA_WINDOW || '2'),
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid MFA token' });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Disable MFA
router.post('/mfa/disable', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password required to disable MFA' });
    }

    // Verify password (you'd need to implement password verification)
    // For now, just disable MFA
    await runDB(
      'UPDATE users SET mfa_enabled = false, mfa_secret = null WHERE id = $1',
      [userId]
    );

    res.json({ success: true, message: 'MFA disabled' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get MFA status
router.get('/mfa/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const result = await runDB(
      'SELECT mfa_enabled FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ mfaEnabled: result.rows[0].mfa_enabled });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(
      Array.from({ length: 8 })
        .map(() => Math.floor(Math.random() * 10))
        .join('')
    );
  }
  return codes;
}

export default router;
