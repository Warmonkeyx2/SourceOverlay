import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const response = await axios.post('/api/auth/verify-email', { token });
        localStorage.setItem('token', response.data.token);
        setStatus('success');
        setMessage('Email verified! Redirecting to dashboard...');
        setTimeout(() => router.push('/dashboard'), 2000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. Please try signing up again.');
      }
    };

    verify();
  }, [token, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a0f3f 100%)',
    }}>
      <div style={{
        background: 'rgba(15, 22, 41, 0.8)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${status === 'success' ? 'rgba(0, 217, 255, 0.4)' : status === 'error' ? 'rgba(255, 0, 110, 0.4)' : 'rgba(0, 217, 255, 0.2)'}`,
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '450px',
        width: '90%',
        textAlign: 'center',
      }}>
        <h1 style={{
          background: 'linear-gradient(135deg, #00d9ff, #b537f2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '24px',
        }}>
          SourceOverlay
        </h1>

        {status === 'loading' && (
          <div style={{ color: '#a8b5d1', fontSize: '18px' }}>⏳ {message}</div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <p style={{ color: '#00d9ff', fontSize: '18px', fontWeight: '600' }}>{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <p style={{ color: '#ff006e', fontSize: '16px' }}>{message}</p>
            <button
              onClick={() => router.push('/signup')}
              style={{
                marginTop: '24px',
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #00d9ff, #b537f2)',
                color: '#0a0e27',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Back to Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
