import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Disable static prerendering to force dynamic server-rendering
export async function getServerSideProps() {
  return { props: {} };
}

interface User {
  id: string;
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
  const [resetPasswordUser, setResetPasswordUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState('');

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

  const handleDelete = async (userId: string) => {
    try {
      await axios.delete('/api/admin/delete-user', {
        headers: { 'x-admin-secret': secret || sessionStorage.getItem('adminSecret') || '' },
        data: { userId },
      });
      setUsers(users.filter(u => u.id !== userId));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleVerify = async (userId: string) => {
    try {
      await axios.post('/api/admin/verify-user', { userId }, {
        headers: { 'x-admin-secret': secret || sessionStorage.getItem('adminSecret') || '' },
      });
      setUsers(users.map(u => u.id === userId ? { ...u, emailVerified: true } : u));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify user');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('');
    if (!newPassword || newPassword.length < 8) {
      setResetStatus('✗ Password must be at least 8 characters');
      return;
    }
    try {
      await axios.post('/api/admin/reset-password', 
        { userId: resetPasswordUser, newPassword },
        { headers: { 'x-admin-secret': secret || sessionStorage.getItem('adminSecret') || '' } }
      );
      setResetStatus('✓ Password reset successfully');
      setResetPasswordUser(null);
      setNewPassword('');
      setTimeout(() => setResetStatus(''), 3000);
    } catch (err: any) {
      setResetStatus('✗ ' + (err.response?.data?.error || 'Failed to reset password'));
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
              <th style={styles.th}>User ID</th>
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
                <td style={styles.td}><code style={{fontSize: '11px', background: 'rgba(0,217,255,0.1)', padding: '2px 6px', borderRadius: '4px'}}>{user.id}</code></td>
                <td style={styles.td}><span style={styles.badge(user.emailVerified)}>{user.emailVerified ? '✓ Yes' : '✗ No'}</span></td>
                <td style={styles.td}><span style={styles.badge(user.mfaEnabled)}>{user.mfaEnabled ? '✓ On' : '✗ Off'}</span></td>
                <td style={styles.td}>{user._count.layouts}</td>
                <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={styles.td}>
                  {deleteConfirm === user.id ? (
                    <>
                      <button onClick={() => handleDelete(user.id)} style={styles.confirmBtn}>Confirm Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} style={styles.cancelBtn}>Cancel</button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {!user.emailVerified && (
                        <button onClick={() => handleVerify(user.id)} style={{ ...styles.dangerBtn, color: '#00d9ff', borderColor: 'rgba(0,217,255,0.4)', background: 'rgba(0,217,255,0.1)', fontSize: '11px', padding: '4px 8px' }}>✓ Verify</button>
                      )}
                      <button onClick={() => setResetPasswordUser(user.id)} style={{ ...styles.dangerBtn, color: '#b08eff', borderColor: 'rgba(176, 142, 255, 0.4)', background: 'rgba(176, 142, 255, 0.1)', fontSize: '11px', padding: '4px 8px' }}>🔑 Reset</button>
                      <button onClick={() => setDeleteConfirm(user.id)} style={{...styles.dangerBtn, fontSize: '11px', padding: '4px 8px'}}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#a8b5d1' }}>No users found</td></tr>
            )}
          </tbody>
        </table>

        {resetPasswordUser && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#0a0e27', border: '1px solid rgba(0,217,255,0.2)', borderRadius: '12px', padding: '32px', maxWidth: '400px', width: '100%' }}>
              <h2 style={{ ...styles.title, marginBottom: '8px' }}>Reset Password</h2>
              <p style={{ color: '#a8b5d1', marginBottom: '20px', fontSize: '13px' }}>Enter a new password for <code style={{background: 'rgba(0,217,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px'}}>{resetPasswordUser.slice(0, 12)}...</code></p>
              <form onSubmit={handleResetPassword}>
                <input
                  type="password"
                  placeholder="New password (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.input}
                  autoFocus
                />
                {resetStatus && (
                  <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: resetStatus.includes('✓') ? '#00d9ff' : '#ff006e' }}>
                    {resetStatus}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" style={styles.btn}>Set Password</button>
                  <button type="button" onClick={() => { setResetPasswordUser(null); setNewPassword(''); setResetStatus(''); }} style={styles.cancelBtn}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
