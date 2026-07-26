import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [buttonHovered, setButtonHovered] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `/api/auth/login`,
        { email, password }
      );

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      router.push('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Login failed';
      setError(errMsg);
      if (errMsg.includes('verify your email')) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess('');
    try {
      await axios.post('/api/auth/resend-verification', { email });
      setResendSuccess('Verification email sent! Check your inbox.');
      setShowResend(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`/api/auth/verify-email`, {
        email: verifyEmail,
        token: verifyToken,
      });

      setVerifying(false);
      setError('');
      alert('Email verified! You can now log in.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
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
    footer: {
      marginTop: '24px',
      textAlign: 'center' as const,
      fontSize: '14px',
      color: '#a8b5d1',
    },
    verifyLink: {
      background: 'none',
      border: 'none',
      color: '#00d9ff',
      cursor: 'pointer',
      fontWeight: '600' as const,
      fontSize: '14px',
      textDecoration: 'underline',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>SOURCE OVERLAY</h1>
        <p style={styles.subtitle}>Studio Control Panel</p>

        {!verifying ? (
          <>
            <form onSubmit={handleLogin}>
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

              {error && <div style={styles.error}>{error}</div>}

              {resendSuccess && (
                <div style={{ ...styles.error, background: 'rgba(0, 217, 255, 0.1)', borderColor: 'rgba(0, 217, 255, 0.4)', color: '#00d9ff' }}>
                  {resendSuccess}
                </div>
              )}

              {showResend && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  style={{ ...styles.button, background: 'rgba(0, 217, 255, 0.15)', color: '#00d9ff', border: '1px solid rgba(0, 217, 255, 0.4)', boxShadow: 'none', marginBottom: '12px', opacity: resendLoading ? 0.6 : 1 }}
                >
                  {resendLoading ? 'Sending...' : '📧 Resend Verification Email'}
                </button>
              )}

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
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div style={styles.footer}>
              Don't have an account?{' '}
              <Link href="/signup" style={{ color: '#00d9ff', textDecoration: 'none', fontWeight: '600' }}>
                Sign Up
              </Link>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setVerifying(true)}
                style={styles.verifyLink}
              >
                Verify Email?
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{...styles.title, marginBottom: '24px', fontSize: '20px'}}>
              Verify Email
            </h2>
            <form onSubmit={handleVerifyEmail}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={verifyEmail}
                  onChange={(e) => setVerifyEmail(e.target.value)}
                  placeholder="your@email.com"
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
                <label style={styles.label}>Verification Token</label>
                <input
                  type="text"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  placeholder="Token from email"
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
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setVerifying(false)}
                  style={styles.verifyLink}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
