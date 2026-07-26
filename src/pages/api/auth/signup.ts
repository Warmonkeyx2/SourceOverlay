import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (unverified)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
      },
    });

    // Create verification token (24 hours)
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        token,
        type: 'email',
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Send verification email
    await sendVerificationEmail(email, token);

    res.status(201).json({
      success: true,
      message: 'Account created! Check your email to verify your account.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
