import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'SourceOverlay <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://source-overlay-git-main-warmonkeyxs-projects.vercel.app';

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify your SourceOverlay account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #ffffff; padding: 40px; border-radius: 16px;">
        <h1 style="color: #00d9ff; text-align: center;">SourceOverlay</h1>
        <h2 style="text-align: center;">Verify your email address</h2>
        <p style="color: #a8b5d1; text-align: center;">Click the button below to verify your email and activate your account.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" 
             style="background: linear-gradient(135deg, #00d9ff, #b537f2); color: #0a0e27; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
            Verify Email
          </a>
        </div>
        <p style="color: #666; text-align: center; font-size: 12px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        <p style="color: #444; text-align: center; font-size: 11px;">Or copy this link: ${verifyUrl}</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset your SourceOverlay password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e27; color: #ffffff; padding: 40px; border-radius: 16px;">
        <h1 style="color: #00d9ff; text-align: center;">SourceOverlay</h1>
        <h2 style="text-align: center;">Reset your password</h2>
        <p style="color: #a8b5d1; text-align: center;">Click the button below to reset your password.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(135deg, #00d9ff, #b537f2); color: #0a0e27; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; text-align: center; font-size: 12px;">This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}
