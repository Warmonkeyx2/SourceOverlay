import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  username: string;
  profile_icon?: string;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(
        `/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data.user);
      setUsername(response.data.user?.email || '');
      setLoading(false);
    } catch (err: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      router.push('/login');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/users/profile`,
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(prev => (prev ? { ...prev, username } : null));
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px' }}>Profile</h1>
        <Link href="/dashboard">
          <button
            style={{
              padding: '8px 15px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
        <div
          style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Account Settings</h2>

          {/* User Info */}
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 10px 0', color: '#666' }}>
              <strong>Email:</strong> {user?.email}
            </p>
            <p style={{ margin: 0, color: '#666' }}>
              <strong>User ID:</strong> {user?.id}
            </p>
          </div>

          {/* Edit Profile */}
          <form onSubmit={handleSaveProfile}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontSize: '14px',
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  color: '#d32f2f',
                  marginBottom: '20px',
                  padding: '10px',
                  backgroundColor: '#ffebee',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                style={{
                  color: '#2e7d32',
                  marginBottom: '20px',
                  padding: '10px',
                  backgroundColor: '#f1f8e9',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          {/* Danger Zone */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #dc3545' }}>
            <h3 style={{ color: '#dc3545', marginBottom: '15px' }}>Danger Zone</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
              Delete your account and all associated data (permanent action).
            </p>
            <button
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              disabled
            >
              Delete Account (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
