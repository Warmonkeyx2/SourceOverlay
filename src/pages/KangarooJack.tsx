import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  _count: { layouts: number };
}

export default function AdminPanel() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/admin/users', {
        headers: { 'x-admin-secret': secret },
      });
      setUsers(res.data.users);
      setAuthed(true);
      sessionStorage.setItem('adminSecret', secret);
    } catch {
      setError('Invalid admin secret');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (email: string) => {
    try {
      await axios.delete('/api/admin/delete-user', {
        headers: { 'x-admin-secret': secret || sessionStorage.getItem('adminSecret') || '' },
        data: { email },
      });
      setUsers(users.filter(u => u.email !== email));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('adminSecret');
    if (saved) {
      setSecret(saved);
      axios.get('/api/admin/users', { headers: { 'x-admin-secret': saved } })
        .then(res => { setUsers(res.data.users); setAuthed(true); })
        .catch(() => sessionStorage.removeItem('adminSecret'));
    }
  }, []);

  const styles = {
    page: { minHeight: '100vh', background: '#0a0e27', color: '#fff', fontFamily: 'sans-serif', padding: '40px 20px' },
    card: { maxWidth: '900px', margin: '0 auto', background: 'rgba(15, 22, 41, 0.9)', border: '1px solid rgba(0,217,255,0.2)', borderRadius: '16px', padding: '40px' },
    title: { fontSize: '28px', fontWeight: 700, background: 'linear-gradient(135deg, #00d9ff, #b537f2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' },
    subtitle: { color: '#a8b5d1', marginBottom: '32px', fontSize: '14px' },
    input: { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,217,255,0.2)', borderRadius: '8px', color: '#fff', fontSize: '16px', marginBottom: '16px', boxSizing: 'border-box' as const },
    btn: { padding: '12px 24px', background: 'linear-gradient(135deg, #00d9ff, #b537f2)', color: '#0a0e27', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' },
    dangerBtn: { padding: '8px 16px', background: 'rgba(255,0,110,0.15)', border: '1px solid rgba(255,0,110,0.4)', color: '#ff006e', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
    confirmBtn: { padding: '8px 16px', background: '#ff006e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, marginRight: '8px' },
    cancelBtn: { padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
    table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: '24px' },
    th: { textAlign: 'left' as const, padding: '12px 16px', borderBottom: '1px solid rgba(0,217,255,0.15)', color: '#00d9ff', fontSize: '12px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
    td: { padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px', color: '#e0e6f0' },
    badge: (ok: boolean) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: ok ? 'rgba(0,217,255,0.15)' : 'rgba(255,0,110,0.15)', color: ok ? '#00d9ff' : '#ff006e' }),
    error: { padding: '12px 16px', background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)', borderRadius: '8px', color: '#ff006e', marginBottom: '16px' },
  };

  if (!authed) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, maxWidth: '420px' }}>
          <h1 style={styles.title}>Admin Panel</h1>
          <p style={styles.subtitle}>Enter your admin secret to continue</p>
          {error && <div style={styles.error}>{error}</div>}
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="Admin secret..."
              style={styles.input}
              required
            />
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h1 style={styles.title}>Admin Panel</h1>
          <button onClick={() => { setAuthed(false); sessionStorage.removeItem('adminSecret'); }} style={styles.cancelBtn}>
            Logout
          </button>
        </div>
        <p style={styles.subtitle}>{users.length} total users</p>

        {error && <div style={styles.error}>{error}</div>}

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Verified</th>
              <th style={styles.th}>MFA</th>
              <th style={styles.th}>Layouts</th>
              <th style={styles.th}>Joined</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}><span style={styles.badge(user.emailVerified)}>{user.emailVerified ? '✓ Yes' : '✗ No'}</span></td>
                <td style={styles.td}><span style={styles.badge(user.mfaEnabled)}>{user.mfaEnabled ? '✓ On' : '✗ Off'}</span></td>
                <td style={styles.td}>{user._count.layouts}</td>
                <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={styles.td}>
                  {deleteConfirm === user.email ? (
                    <>
                      <button onClick={() => handleDelete(user.email)} style={styles.confirmBtn}>Confirm Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} style={styles.cancelBtn}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteConfirm(user.email)} style={styles.dangerBtn}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#a8b5d1' }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
