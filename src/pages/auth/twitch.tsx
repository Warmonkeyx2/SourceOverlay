import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { code } = router.query;

        if (!code) {
          setError('No authorization code');
          return;
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/callback`,
          { code }
        );

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        router.push('/dashboard');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Authentication failed');
      }
    };

    if (router.isReady) {
      handleAuth();
    }
  }, [router.isReady, router.query]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {error ? (
        <div>
          <h2>Authentication Error</h2>
          <p>{error}</p>
        </div>
      ) : (
        <p>Authenticating...</p>
      )}
    </div>
  );
}
