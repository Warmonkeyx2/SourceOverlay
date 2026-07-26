import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Layout {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');
  const [buttonHovered, setButtonHovered] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchLayouts();
  }, [router]);

  const fetchLayouts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/layouts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLayouts(response.data);
    } catch (err: any) {
      setError('Failed to load layouts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setError('');
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/layouts`,
        { title: newTitle },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLayouts([...layouts, response.data]);
      setNewTitle('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create layout');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a0f3f 100%)',
      padding: '40px 20px',
    },
    header: {
      display: 'flex' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: '40px',
      maxWidth: '1200px',
      margin: '0 auto 40px',
    },
    title: {
      fontSize: '32px',
      fontWeight: '700' as const,
      background: 'linear-gradient(135deg, #00d9ff, #b537f2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0,
    },
    buttonGroup: {
      display: 'flex' as const,
      gap: '12px',
    },
    button: {
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #00d9ff, #b537f2)',
      color: '#0a0e27',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600' as const,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 20px rgba(0, 217, 255, 0.4)',
    },
    secondaryButton: {
      padding: '10px 20px',
      background: 'rgba(255, 0, 110, 0.15)',
      border: '1px solid rgba(255, 0, 110, 0.4)',
      color: '#ff006e',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600' as const,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    card: {
      background: 'rgba(15, 22, 41, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(0, 217, 255, 0.2)',
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '32px',
      boxShadow: '0 8px 32px rgba(0, 217, 255, 0.1)',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block' as const,
      marginBottom: '8px',
      color: '#e0e7ff',
      fontSize: '12px',
      fontWeight: '700' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
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
      transition: 'all 0.3s ease',
    },
    grid: {
      display: 'grid' as const,
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
    },
    layoutCard: {
      background: 'rgba(15, 22, 41, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(0, 217, 255, 0.2)',
      borderRadius: '12px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    layoutTitle: {
      fontSize: '18px',
      fontWeight: '700' as const,
      color: '#e0e7ff',
      marginBottom: '12px',
      background: 'linear-gradient(135deg, #00d9ff, #b537f2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    layoutMeta: {
      fontSize: '12px',
      color: '#a8b5d1',
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Layouts</h1>
        <div style={styles.buttonGroup}>
          <button
            style={{
              ...styles.button,
              boxShadow: buttonHovered === 'profile' 
                ? '0 0 40px rgba(0, 217, 255, 0.8), 0 0 20px rgba(181, 55, 242, 0.4)' 
                : '0 0 20px rgba(0, 217, 255, 0.4)',
              transform: buttonHovered === 'profile' ? 'translateY(-2px)' : 'translateY(0)',
            }}
            onMouseEnter={() => setButtonHovered('profile')}
            onMouseLeave={() => setButtonHovered(null)}
            onClick={() => router.push('/profile')}
          >
            Profile
          </button>
          <button
            style={{
              ...styles.secondaryButton,
              boxShadow: buttonHovered === 'logout' 
                ? '0 0 20px rgba(255, 0, 110, 0.5)' 
                : 'none',
              transform: buttonHovered === 'logout' ? 'translateY(-2px)' : 'translateY(0)',
            }}
            onMouseEnter={() => setButtonHovered('logout')}
            onMouseLeave={() => setButtonHovered(null)}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <h2 style={{...styles.title, fontSize: '20px', marginBottom: '20px'}}>Create New Layout</h2>
          <form onSubmit={handleCreateLayout}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Layout Name</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="My Layout"
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
              style={{
                ...styles.button,
                boxShadow: buttonHovered === 'create' 
                  ? '0 0 40px rgba(0, 217, 255, 0.8), 0 0 20px rgba(181, 55, 242, 0.4)' 
                  : '0 0 20px rgba(0, 217, 255, 0.4)',
                transform: buttonHovered === 'create' ? 'translateY(-2px)' : 'translateY(0)',
              }}
              onMouseEnter={() => setButtonHovered('create')}
              onMouseLeave={() => setButtonHovered(null)}
            >
              Create Layout
            </button>
          </form>
        </div>

        {loading ? (
          <div style={{...styles.card, textAlign: 'center', color: '#a8b5d1'}}>
            Loading layouts...
          </div>
        ) : layouts.length === 0 ? (
          <div style={{...styles.card, textAlign: 'center', color: '#a8b5d1'}}>
            No layouts yet. Create your first layout above!
          </div>
        ) : (
          <div style={styles.grid}>
            {layouts.map((layout) => (
              <div
                key={layout.id}
                style={{
                  ...styles.layoutCard,
                  borderColor: buttonHovered === layout.id ? 'rgba(0, 217, 255, 0.6)' : 'rgba(0, 217, 255, 0.2)',
                  boxShadow: buttonHovered === layout.id 
                    ? '0 0 20px rgba(0, 217, 255, 0.3)' 
                    : '0 8px 16px rgba(0, 217, 255, 0.05)',
                  transform: buttonHovered === layout.id ? 'translateY(-4px)' : 'translateY(0)',
                }}
                onMouseEnter={() => setButtonHovered(layout.id)}
                onMouseLeave={() => setButtonHovered(null)}
                onClick={() => router.push(`/editor/${layout.id}`)}
              >
                <div style={styles.layoutTitle}>{layout.title}</div>
                <div style={styles.layoutMeta}>
                  Created: {new Date(layout.created_at).toLocaleDateString()}
                </div>
                <div style={styles.layoutMeta}>
                  Updated: {new Date(layout.updated_at).toLocaleDateString()}
                </div>
                <Link 
                  href={`/editor/${layout.id}`}
                  style={{
                    color: '#00d9ff',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}
                >
                  Open Layout →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
