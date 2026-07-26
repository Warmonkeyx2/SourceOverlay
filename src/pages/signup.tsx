import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [buttonHovered, setButtonHovered] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `/api/auth/signup`,
        { email, password, username }
      );

      setSuccess(
        'Account created! Check your email for a verification link. Then log in.'
      );
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a0f3f 100%)',
      padding: '20px',
      position: 'relative' as const,
    },
    card: {
      background: 'rgba(15, 22, 41, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(0, 217, 255, 0.2)',
      borderRadius: '16px',
      padding: '48px',
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 8px 32px rgba(0, 217, 255, 0.1)',
      position: 'relative' as const,
    },
    title: {
      textAlign: 'center' as const,
      marginBottom: '12px',
      fontSize: '28px',
      fontWeight: '700' as const,
      background: 'linear-gradient(135deg, #00d9ff, #b537f2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      textAlign: 'center' as const,
      color: '#a8b5d1',
      marginBottom: '32px',
      fontSize: '14px',
      fontWeight: '500' as const,
    },
    formGroup: {
      marginBottom: '24px',
    },
    label: {
      display: 'block' as const,
      marginBottom: '10px',
      color: '#e0e7ff',
      fontSize: '12px',
      fontWeight: '700' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      background: 'rgba(26, 31, 58, 0.6)',
      border: '2px solid rgba(0, 217, 255, 0.2)',
      borderRadius: '8px',
      color: '#e0e7ff',
      fontSize: '16px',
      boxSizing: 'border-box' as const,
      transition: 'all 0.3s ease',
    },
    button: {
      width: '100%',
      padding: '14px 24px',
      background: 'linear-gradient(135deg, #00d9ff, #b537f2)',
      color: '#0a0e27',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '700' as const,
      textTransform: 'uppercase' as const,
      cursor: 'pointer',
      boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)',
      transition: 'all 0.3s ease',
    },
    error: {
      background: 'rgba(255, 0, 110, 0.15)',
      border: '1px solid rgba(255, 0, 110, 0.4)',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#ff006e',
      marginBottom: '20px',
      fontSize: '14px',
    },
    success: {
      background: 'rgba(57, 255, 20, 0.15)',
      border: '1px solid rgba(57, 255, 20, 0.4)',
      borderRadius: '8px',
      padding: '12px 16px',
      color: '#39ff14',
      marginBottom: '20px',
      fontSize: '14px',
    },
    footer: {
      marginTop: '24px',
      textAlign: 'center' as const,
      fontSize: '14px',
      color: '#a8b5d1',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join SOURCE OVERLAY Studio</p>

        <form onSubmit={handleSignup}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              required
              style={styles.input}
              onFocus={(e) => {
                (e.target as any).style.borderColor = '#00d9ff';
                (e.target as any).style.boxShadow = 'inset 0 0 20px rgba(0, 217, 255, 0.1), 0 0 20px rgba(0, 217, 255, 0.3)';
              }}
              onBlur={(e) => {
                (e.target as any).style.borderColor = 'rgba(0, 217, 255, 0.2)';
                (e.target as any).style.boxShadow = '';
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={styles.input}
              onFocus={(e) => {
                (e.target as any).style.borderColor = '#00d9ff';
                (e.target as any).style.boxShadow = 'inset 0 0 20px rgba(0, 217, 255, 0.1), 0 0 20px rgba(0, 217, 255, 0.3)';
              }}
              onBlur={(e) => {
                (e.target as any).style.borderColor = 'rgba(0, 217, 255, 0.2)';
                (e.target as any).style.boxShadow = '';
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
              onFocus={(e) => {
                (e.target as any).style.borderColor = '#00d9ff';
                (e.target as any).style.boxShadow = 'inset 0 0 20px rgba(0, 217, 255, 0.1), 0 0 20px rgba(0, 217, 255, 0.3)';
              }}
              onBlur={(e) => {
                (e.target as any).style.borderColor = 'rgba(0, 217, 255, 0.2)';
                (e.target as any).style.boxShadow = '';
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
              onFocus={(e) => {
                (e.target as any).style.borderColor = '#00d9ff';
                (e.target as any).style.boxShadow = 'inset 0 0 20px rgba(0, 217, 255, 0.1), 0 0 20px rgba(0, 217, 255, 0.3)';
              }}
              onBlur={(e) => {
                (e.target as any).style.borderColor = 'rgba(0, 217, 255, 0.2)';
                (e.target as any).style.boxShadow = '';
              }}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              boxShadow: buttonHovered && !loading 
                ? '0 0 40px rgba(0, 217, 255, 0.8), 0 0 20px rgba(181, 55, 242, 0.4)' 
                : '0 0 20px rgba(0, 217, 255, 0.4)',
              transform: buttonHovered && !loading ? 'translateY(-2px)' : 'translateY(0)',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#00d9ff', textDecoration: 'none', fontWeight: '600' }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
