import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

interface Layout {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  profile_icon?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchLayouts();
    }
  }, [authenticated]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
      setAuthenticated(true);
    } catch (err: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      router.push('/login');
    }
  };

  const fetchLayouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/layouts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLayouts(response.data);
    } catch (err: any) {
      console.error('Failed to fetch layouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createLayout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/layouts`,
        {
          title: newTitle || 'Untitled',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLayouts([response.data, ...layouts]);
      setNewTitle('');
    } catch (err: any) {
      console.error('Failed to create layout:', err);
    }
  };

  const deleteLayout = async (id: string) => {
    if (!confirm('Delete this layout?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/layouts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLayouts(layouts.filter(l => l.id !== id));
    } catch (err: any) {
      console.error('Failed to delete layout:', err);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      // Continue logout anyway
    }

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  if (loading)
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;

  if (!authenticated) return null;

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
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
        <h1 style={{ margin: 0, fontSize: '20px' }}>Source Overlay Studio</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ color: '#666' }}>
            Welcome, <strong>{user?.username}</strong>
          </span>
          <Link href="/profile">
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
              Profile
            </button>
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 15px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '0 20px' }}>
        <p>Create and manage overlay layouts for your stream.</p>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="New layout title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createLayout()}
            style={{ padding: '10px', flex: 1, fontSize: '14px' }}
          />
          <button
            onClick={createLayout}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Create Layout
          </button>
        </div>

        {layouts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>
            No layouts yet. Create one to get started!
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '15px',
            }}
          >
            {layouts.map((layout) => (
              <div
                key={layout.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '15px',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <h3 style={{ margin: '0 0 10px 0' }}>{layout.title}</h3>
                <p style={{ fontSize: '12px', color: '#999', margin: '0 0 15px 0' }}>
                  Updated: {new Date(layout.updated_at).toLocaleDateString()}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link href={`/editor/${layout.id}`}>
                    <button
                      style={{
                        flex: 1,
                        padding: '8px',
                        cursor: 'pointer',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                      }}
                    >
                      Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => deleteLayout(layout.id)}
                    style={{
                      padding: '8px 15px',
                      cursor: 'pointer',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
