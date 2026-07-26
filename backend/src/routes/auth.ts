import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db';
import { generateToken, authMiddleware } from '../middleware/auth';

const router = Router();

// Sign up
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username required' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const verificationToken = uuidv4();

    // Create user
    await query(
      `INSERT INTO users (id, email, password_hash, username, verification_token, email_verified)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, email, passwordHash, username, verificationToken, process.env.NODE_ENV === 'production' ? 0 : 1]
    );

    // TODO: Send verification email with verificationToken
    console.log(`[DEV] Verification token for ${email}: ${verificationToken}`);

    res.json({
      message: 'User created. Please check your email to verify your account.',
      userId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Verify email
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and token required' });
    }

    const userResult = await query(
      `SELECT id FROM users WHERE email = ? AND verification_token = ?`,
      [email, token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    const userId = userResult.rows[0].id;

    await query(
      `UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?`,
      [userId]
    );

    res.json({ message: 'Email verified successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const userResult = await query(
      'SELECT id, password_hash, email_verified, mfa_enabled FROM users WHERE email = ?',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    if (!user.email_verified && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If MFA is enabled, return temporary token
    if (user.mfa_enabled) {
      const tempToken = generateToken(user.id, '5m'); // Short-lived temp token
      return res.json({
        requiresMfa: true,
        tempToken,
        userId: user.id,
      });
    }

    // Create session
    const token = generateToken(user.id);
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await query(
      `INSERT INTO sessions (id, user_id, token, last_activity, expires_at)
       VALUES (?, ?, ?, datetime('now'), ?)`,
      [sessionId, user.id, token, expiresAt.toISOString()]
    );

    res.json({ token, userId: user.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Complete MFA login
router.post('/login/mfa', async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: 'userId and token required' });
    }

    // In production, verify the temp token first
    // For now, just verify MFA
    const userResult = await query(
      'SELECT mfa_secret FROM users WHERE id = ? AND mfa_enabled = 1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'MFA not enabled or user not found' });
    }

    // Verify MFA token (implement with speakeasy)
    // For now, placeholder
    const finalToken = generateToken(userId);
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await query(
      `INSERT INTO sessions (id, user_id, token, last_activity, expires_at)
       VALUES (?, ?, ?, datetime('now'), ?)`,
      [sessionId, userId, finalToken, expiresAt.toISOString()]
    );

    res.json({ token: finalToken, userId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.token) {
      return res.status(400).json({ error: 'No token' });
    }

    await query('DELETE FROM sessions WHERE token = ?', [req.token]);
    res.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  res.json(req.user);
});

export default router;
