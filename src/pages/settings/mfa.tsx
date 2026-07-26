import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function MFASettings() {
  const router = useRouter();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [setupStep, setSetupStep] = useState<'initial' | 'scanning' | 'verify'>('initial');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buttonHovered, setButtonHovered] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const tokenFromStorage = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mfa/status`,
        {
          headers: { Authorization: `Bearer ${tokenFromStorage}` },
        }
      );
      setMfaEnabled(response.data.mfaEnabled);
    } catch (err: any) {
      setError('Failed to check MFA status');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupMFA = async () => {
    try {
      const tokenFromStorage = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mfa/setup`,
        {},
        {
          headers: { Authorization: `Bearer ${tokenFromStorage}` },
        }
      );

      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setBackupCodes(response.data.backupCodes);
      setSetupStep('scanning');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to setup MFA');
    }
  };

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Please enter the 6-digit code');
      return;
    }

    try {
      const tokenFromStorage = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mfa/enable`,
        { secret, token },
        {
          headers: { Authorization: `Bearer ${tokenFromStorage}` },
        }
      );

      setMfaEnabled(true);
      setSetupStep('initial');
      setToken('');
      setSecret('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to enable MFA');
    }
  };

  const handleDisableMFA = async () => {
    try {
      const tokenFromStorage = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mfa/disable`,
        {},
        {
          headers: { Authorization: `Bearer ${tokenFromStorage}` },
        }
      );

      setMfaEnabled(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to disable MFA');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a0f3f 100%)',
      padding: '40px 20px',
    },
    card: {
      maxWidth: '600px',
      margin: '0 auto',
      background: 'rgba(15, 22, 41, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(0, 217, 255, 0.2)',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 8px 32px rgba(0, 217, 255, 0.1)',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700' as const,
      background: 'linear-gradient(135deg, #00d9ff, #b537f2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '24px',
    },
    button: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #00d9ff, #b537f2)',
      color: '#0a0e27',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600' as const,
      cursor: 'pointer',
      boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)',
      transition: 'all 0.3s ease',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(26, 31, 58, 0.6)',
      border: '2px solid rgba(0, 217, 255, 0.2)',
      borderRadius: '8px',
      color: '#e0e7ff',
      fontSize: '16px',
      boxSizing: 'border-box' as const,
      marginBottom: '16px',
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
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ color: '#a8b5d1', textAlign: 'center' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Two-Factor Authentication</h1>

        {error && <div style={styles.error}>{error}</div>}

        {!mfaEnabled && setupStep === 'initial' && (
          <>
            <p style={{ color: '#a8b5d1', marginBottom: '24px' }}>
              Enhance your account security by enabling two-factor authentication.
            </p>
            <button
              onClick={handleSetupMFA}
              style={{
                ...styles.button,
                boxShadow: buttonHovered 
                  ? '0 0 40px rgba(0, 217, 255, 0.8), 0 0 20px rgba(181, 55, 242, 0.4)' 
                  : '0 0 20px rgba(0, 217, 255, 0.4)',
                transform: buttonHovered ? 'translateY(-2px)' : 'translateY(0)',
              }}
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
            >
              Enable MFA
            </button>
          </>
        )}

        {setupStep === 'scanning' && (
          <>
            <p style={{ color: '#a8b5d1', marginBottom: '16px' }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
            </p>
            {qrCode && (
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <img src={qrCode} alt="MFA QR Code" style={{ maxWidth: '300px' }} />
              </div>
            )}
            <p style={{ color: '#a8b5d1', fontSize: '12px', marginBottom: '16px' }}>
              Or enter this code manually: <code style={{ background: 'rgba(0, 217, 255, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>{secret}</code>
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#e0e7ff', marginBottom: '8px', fontWeight: '600' }}>
                Enter the 6-digit code from your authenticator:
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="000000"
                maxLength={6}
                style={styles.input}
              />
            </div>

            <button
              onClick={handleVerifyMFA}
              style={{
                ...styles.button,
                boxShadow: buttonHovered 
                  ? '0 0 40px rgba(0, 217, 255, 0.8), 0 0 20px rgba(181, 55, 242, 0.4)' 
                  : '0 0 20px rgba(0, 217, 255, 0.4)',
                transform: buttonHovered ? 'translateY(-2px)' : 'translateY(0)',
              }}
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
            >
              Verify & Enable MFA
            </button>

            {backupCodes.length > 0 && (
              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(57, 255, 20, 0.1)', borderRadius: '8px' }}>
                <h3 style={{ color: '#39ff14', marginBottom: '8px' }}>Backup Codes</h3>
                <p style={{ color: '#a8b5d1', fontSize: '12px', marginBottom: '8px' }}>
                  Save these backup codes in a safe place. You can use them if you lose access to your authenticator:
                </p>
                {backupCodes.map((code, i) => (
                  <code key={i} style={{ display: 'block', color: '#39ff14', fontSize: '12px', padding: '2px 0' }}>
                    {code}
                  </code>
                ))}
              </div>
            )}
          </>
        )}

        {mfaEnabled && (
          <>
            <div style={{ padding: '16px', background: 'rgba(57, 255, 20, 0.1)', borderRadius: '8px', marginBottom: '24px' }}>
              <p style={{ color: '#39ff14', margin: '0' }}>✓ Two-factor authentication is enabled</p>
            </div>
            <button
              onClick={handleDisableMFA}
              style={{
                ...styles.button,
                background: 'rgba(255, 0, 110, 0.15)',
                border: '1px solid rgba(255, 0, 110, 0.4)',
                color: '#ff006e',
                boxShadow: 'none',
              }}
            >
              Disable MFA
            </button>
          </>
        )}
      </div>
    </div>
  );
}
