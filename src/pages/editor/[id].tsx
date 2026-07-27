import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Source {
  id: string;
  name: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
}

interface Layout {
  id: string;
  title: string;
  bg_color: string;
  data: Source[];
}

export default function Editor() {
  const router = useRouter();
  const { id } = router.query;
  const [layout, setLayout] = useState<Layout | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeOffset, setResizeOffset] = useState({ x: 0, y: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviteStatus, setInviteStatus] = useState('');
  const [collaborators, setCollaborators] = useState<{id: string; role: string; user: {id: string; email: string}}[]>([]);
  const [saveStatus, setSaveStatus] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchLayout();
    }
  }, [id]);

  const fetchLayout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/layouts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = JSON.parse(response.data.data || '[]');
      setLayout(response.data);
      setSources(data);
    } catch (err: any) {
      console.error('Failed to fetch layout:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveLayout = async () => {
    try {
      setSaveStatus('Saving...');
      const token = localStorage.getItem('token');
      await axios.put(`/api/layouts/${id}`, {
        title: layout?.title,
        bgColor: layout?.bg_color,
        data: sources,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaveStatus('✓ Layout saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err: any) {
      setSaveStatus('✗ Failed to save');
      console.error('Failed to save layout:', err);
    }
  };

  const addSource = () => {
    if (!newSourceName || !newSourceUrl) {
      alert('Enter name and URL');
      return;
    }

    const newSource: Source = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSourceName,
      url: newSourceUrl,
      x: 50,
      y: 50,
      width: 400,
      height: 300,
      z: Math.max(...sources.map(s => s.z), 0) + 1,
    };

    setSources([...sources, newSource]);
    setNewSourceName('');
    setNewSourceUrl('');
  };

  const updateSource = (sourceId: string, updates: Partial<Source>) => {
    setSources(sources.map(s => (s.id === sourceId ? { ...s, ...updates } : s)));
  };

  const removeSource = (sourceId: string) => {
    setSources(sources.filter(s => s.id !== sourceId));
    setSelectedSource(null);
  };

  const handleMouseDown = (e: React.MouseEvent, sourceId: string) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    setSelectedSource(sourceId);
    const source = sources.find(s => s.id === sourceId);
    if (source && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - (source.x + rect.left),
        y: e.clientY - (source.y + rect.top),
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedSource || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - dragOffset.x);
    const y = Math.max(0, e.clientY - rect.top - dragOffset.y);

    updateSource(selectedSource, { x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    setSelectedSource(sourceId);
    const source = sources.find(s => s.id === sourceId);
    if (source && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setIsResizing(true);
      setResizeOffset({
        x: e.clientX - (source.x + source.width + rect.left),
        y: e.clientY - (source.y + source.height + rect.top),
      });
    }
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!isResizing || !selectedSource || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const source = sources.find(s => s.id === selectedSource);
    if (source) {
      const newWidth = Math.max(200, e.clientX - (source.x + rect.left) - resizeOffset.x);
      const newHeight = Math.max(150, e.clientY - (source.y + rect.top) - resizeOffset.y);
      updateSource(selectedSource, { width: newWidth, height: newHeight });
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatus('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/layouts/${id}/collaborators`, {
        userId: inviteUserId,
        role: inviteRole,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setInviteStatus('✓ Collaborator added!');
      setInviteUserId('');
      setCollaborators([...collaborators, res.data.collaborator]);
    } catch (err: any) {
      setInviteStatus('✗ ' + (err.response?.data?.error || 'Failed to add collaborator'));
    }
  };

  const fetchCollaborators = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/layouts/${id}/collaborators`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCollaborators(res.data.collaborators || []);
    } catch {}
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!confirm('Remove this collaborator?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/layouts/${id}/collaborators`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId },
      });
      setCollaborators(collaborators.filter(c => c.user.id !== userId));
    } catch (err: any) {
      setInviteStatus('✗ ' + (err.response?.data?.error || 'Failed to remove'));
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a0f3f 100%)', color: '#00d9ff', fontFamily: 'sans-serif', fontSize: '18px' }}>Loading layout...</div>;
  if (!layout) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a0f3f 100%)', color: '#ff006e', fontFamily: 'sans-serif', fontSize: '18px' }}>Layout not found</div>;

  const styles = {
    container: { display: 'flex' as const, height: '100vh', fontFamily: 'sans-serif', background: 'linear-gradient(135deg, #0a0e27 0%, #1a0f3f 100%)' },
    sidebar: {
      width: sidebarOpen ? '320px' : '60px',
      background: 'rgba(15, 22, 41, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRight: '1px solid rgba(0, 217, 255, 0.2)',
      padding: sidebarOpen ? '24px' : '12px',
      overflowY: 'auto' as const,
      transition: 'all 0.3s ease',
      position: 'relative' as const,
      color: '#e0e7ff',
    },
    toggleBtn: {
      position: 'absolute' as const,
      right: '-12px',
      top: '24px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #00d9ff, #b537f2)',
      color: '#0a0e27',
      border: 'none',
      cursor: 'pointer',
      display: 'flex' as const,
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '700' as const,
      zIndex: 10,
      boxShadow: '0 0 15px rgba(0, 217, 255, 0.5)',
    },
    sidebarTitle: { fontSize: '18px', fontWeight: '700' as const, marginBottom: '8px', background: 'linear-gradient(135deg, #00d9ff, #b537f2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    sidebarSubtitle: { fontSize: '12px', color: '#a8b5d1', marginBottom: '20px' },
    sidebarBtn: { width: '100%', padding: '10px 16px', marginBottom: '10px', background: 'linear-gradient(135deg, #00d9ff, #b537f2)', color: '#0a0e27', border: 'none', borderRadius: '8px', fontWeight: '600' as const, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 0 15px rgba(0, 217, 255, 0.3)' },
    secondaryBtn: { width: '100%', padding: '10px 16px', marginBottom: '10px', background: 'rgba(111, 66, 193, 0.15)', border: '1px solid rgba(111, 66, 193, 0.4)', color: '#b08eff', borderRadius: '8px', fontWeight: '600' as const, cursor: 'pointer', transition: 'all 0.3s ease' },
    backBtn: { marginBottom: '20px', padding: '8px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#e0e7ff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' as const },
    input: { width: '100%', padding: '10px 12px', marginBottom: '10px', background: 'rgba(26, 31, 58, 0.6)', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: '6px', color: '#e0e7ff', fontSize: '13px', boxSizing: 'border-box' as const },
    select: { width: '100%', padding: '10px 12px', marginBottom: '10px', background: 'rgba(26, 31, 58, 0.6)', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: '6px', color: '#e0e7ff', fontSize: '13px', boxSizing: 'border-box' as const },
    label: { display: 'block' as const, fontSize: '12px', fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '8px', color: '#a8b5d1' },
    sharePanel: { background: 'rgba(111, 66, 193, 0.1)', borderRadius: '8px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(111, 66, 193, 0.2)' },
    sourceList: { background: 'rgba(26, 31, 58, 0.4)', borderRadius: '8px', padding: '12px', marginTop: '12px' },
    sourceItem: (selected: boolean) => ({ padding: '12px', marginBottom: '8px', background: selected ? 'rgba(0, 217, 255, 0.2)' : 'rgba(0, 217, 255, 0.05)', border: `1px solid ${selected ? 'rgba(0, 217, 255, 0.5)' : 'rgba(0, 217, 255, 0.2)'}`, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.3s ease' }),
    canvas: { flex: 1, background: layout.bg_color, position: 'relative' as const, overflow: 'auto', cursor: isDragging ? 'grabbing' : isResizing ? 'se-resize' : 'default' },
    sourceWindow: (selected: boolean) => ({
      position: 'absolute' as const,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(5px)',
      border: selected ? '2px solid #00d9ff' : '2px solid rgba(0, 217, 255, 0.3)',
      borderRadius: '8px',
      cursor: isDragging && selected ? 'grabbing' : 'grab',
      display: 'flex' as const,
      flexDirection: 'column' as const,
      boxShadow: selected ? '0 0 30px rgba(0, 217, 255, 0.4)' : '0 0 10px rgba(0, 217, 255, 0.1)',
      transition: 'all 0.2s ease',
    }),
    windowHeader: (selected: boolean) => ({
      padding: '10px 14px',
      background: selected ? 'linear-gradient(135deg, #00d9ff, #b537f2)' : 'linear-gradient(135deg, #1a3a52, #2d1b4e)',
      color: selected ? '#0a0e27' : '#e0e7ff',
      fontSize: '13px',
      fontWeight: 'bold' as const,
      borderRadius: '6px 6px 0 0',
      userSelect: 'none' as const,
      display: 'flex' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    }),
    resizeHandle: {
      position: 'absolute' as const,
      bottom: 0,
      right: 0,
      width: '16px',
      height: '16px',
      background: 'linear-gradient(135deg, #00d9ff, #b537f2)',
      borderRadius: '0 0 6px 0',
      cursor: 'se-resize',
      opacity: 0.8,
    },
    saveStatus: {
      position: 'fixed' as const,
      bottom: '20px',
      right: '20px',
      padding: '12px 20px',
      background: saveStatus.includes('✓') ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255, 0, 110, 0.2)',
      border: saveStatus.includes('✓') ? '1px solid rgba(0, 217, 255, 0.4)' : '1px solid rgba(255, 0, 110, 0.4)',
      borderRadius: '8px',
      color: saveStatus.includes('✓') ? '#00d9ff' : '#ff006e',
      fontSize: '14px',
      fontWeight: '600' as const,
      zIndex: 1000,
    },
  };

  return (
    <div style={styles.container} onMouseMove={e => { handleMouseMove(e); handleResizeMove(e); }} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.toggleBtn}>
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {sidebarOpen && (
          <>
            <div style={styles.sidebarTitle}>{layout.title}</div>
            <div style={styles.sidebarSubtitle}>Layout Editor</div>

            <button onClick={() => router.push('/dashboard')} style={styles.backBtn}>← Back to Dashboard</button>

            <button onClick={saveLayout} style={styles.sidebarBtn}>
              💾 Save Layout {saveStatus && `${saveStatus}`}
            </button>

            <button
              onClick={() => { setShowShare(!showShare); if (!showShare) fetchCollaborators(); }}
              style={styles.secondaryBtn}
            >
              {showShare ? '✕ Close' : '👥 Share'}
            </button>

            {showShare && (
              <div style={styles.sharePanel}>
                <label style={styles.label}>Add Collaborator</label>
                <form onSubmit={handleInvite}>
                  <input
                    type="text"
                    placeholder="Paste User ID"
                    value={inviteUserId}
                    onChange={e => setInviteUserId(e.target.value)}
                    required
                    style={styles.input}
                  />
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={styles.select}>
                    <option value="viewer">👁 Viewer (read only)</option>
                    <option value="editor">✏ Editor (can edit)</option>
                  </select>
                  <button type="submit" style={styles.sidebarBtn}>Add</button>
                  {inviteStatus && <p style={{ margin: '8px 0 0', fontSize: '12px', color: inviteStatus.includes('✓') ? '#00d9ff' : '#ff006e' }}>{inviteStatus}</p>}
                </form>

                {collaborators.length > 0 && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid rgba(0, 217, 255, 0.2)', paddingTop: '12px' }}>
                    <label style={styles.label}>Collaborators</label>
                    {collaborators.map(c => (
                      <div key={c.user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', fontSize: '12px', borderBottom: '1px solid rgba(0, 217, 255, 0.1)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#00d9ff' }}>{c.role === 'editor' ? '✏' : '👁'} {c.user.email.split('@')[0]}</div>
                          <div style={{ color: '#a8b5d1', fontSize: '10px' }}>{c.user.id.slice(0, 12)}...</div>
                        </div>
                        <button onClick={() => handleRemoveCollaborator(c.user.id)} style={{ padding: '4px 8px', background: 'rgba(255, 0, 110, 0.2)', border: '1px solid rgba(255, 0, 110, 0.3)', color: '#ff006e', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(0, 217, 255, 0.2)' }}>
              <label style={styles.label}>Add Source</label>
              <input type="text" placeholder="Name (e.g., Chat)" value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} style={styles.input} />
              <input type="text" placeholder="URL (https://...)" value={newSourceUrl} onChange={(e) => setNewSourceUrl(e.target.value)} style={styles.input} />
              <button onClick={addSource} style={styles.sidebarBtn}>+ Add Source</button>
            </div>

            {sources.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <label style={styles.label}>Sources ({sources.length})</label>
                <div style={styles.sourceList}>
                  {sources.map((source) => (
                    <div key={source.id} onClick={() => setSelectedSource(source.id)} style={styles.sourceItem(selectedSource === source.id)}>
                      <div style={{ fontWeight: '600', marginBottom: '4px', color: '#00d9ff' }}>{source.name}</div>
                      <div style={{ fontSize: '11px', color: '#a8b5d1', marginBottom: '6px' }}>{source.width}x{source.height} @ ({Math.round(source.x)}, {Math.round(source.y)})</div>
                      <button onClick={(e) => { e.stopPropagation(); removeSource(source.id); }} style={{ width: '100%', padding: '6px', fontSize: '11px', cursor: 'pointer', background: 'rgba(255, 0, 110, 0.15)', border: '1px solid rgba(255, 0, 110, 0.3)', color: '#ff006e', borderRadius: '4px' }}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Canvas */}
      <div ref={canvasRef} style={styles.canvas}>
        {sources.map((source) => (
          <div
            key={source.id}
            onMouseDown={(e) => handleMouseDown(e, source.id)}
            style={{
              ...styles.sourceWindow(selectedSource === source.id),
              left: `${source.x}px`,
              top: `${source.y}px`,
              width: `${source.width}px`,
              height: `${source.height}px`,
              zIndex: source.z,
            }}
          >
            <div style={styles.windowHeader(selectedSource === source.id)}>
              <span>{source.name}</span>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>{source.width}×{source.height}</span>
            </div>
            <iframe src={source.url} style={{ flex: 1, border: 'none', background: '#fff', borderRadius: '0 0 6px 6px' }} title={source.name} />
            <div
              className="resize-handle"
              onMouseDown={(e) => handleResizeStart(e, source.id)}
              style={styles.resizeHandle}
              title="Drag to resize"
            />
          </div>
        ))}

        {sources.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255, 255, 255, 0.2)', fontSize: '18px' }}>
            No sources yet. Add one from the sidebar →
          </div>
        )}
      </div>

      {saveStatus && <div style={styles.saveStatus}>{saveStatus}</div>}
    </div>
  );
}
