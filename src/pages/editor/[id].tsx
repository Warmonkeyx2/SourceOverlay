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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviteStatus, setInviteStatus] = useState('');
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
      const token = localStorage.getItem('token');
      await axios.put(`/api/layouts/${id}`, {
        title: layout?.title,
        bgColor: layout?.bg_color,
        data: sources,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Layout saved!');
    } catch (err: any) {
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
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatus('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/invites/create', {
        layoutId: id,
        email: inviteEmail,
        role: inviteRole,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setInviteStatus('✓ Invite sent!');
      setInviteEmail('');
    } catch (err: any) {
      setInviteStatus('✗ ' + (err.response?.data?.error || 'Failed to send invite'));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!layout) return <p>Layout not found</p>;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? '300px' : '50px', borderRight: '1px solid #ccc', padding: sidebarOpen ? '20px' : '10px', overflowY: 'auto', backgroundColor: '#f5f5f5', transition: 'width 0.3s ease', position: 'relative' }}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '20px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 10,
          }}
        >
          {sidebarOpen ? '◄' : '►'}
        </button>

        {sidebarOpen && (
          <>
            <h2>{layout.title}</h2>
            <button onClick={() => router.push('/')} style={{ marginBottom: '20px', cursor: 'pointer' }}>← Back</button>
            <button onClick={saveLayout} style={{ width: '100%', padding: '10px', marginBottom: '10px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
              Save Layout
            </button>
            <button onClick={() => setShowShare(!showShare)} style={{ width: '100%', padding: '10px', marginBottom: '20px', cursor: 'pointer', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px' }}>
              {showShare ? '✕ Close Share' : '👥 Share / Invite'}
            </button>

            {showShare && (
              <div style={{ background: '#e8e8f8', borderRadius: '8px', padding: '16px', marginBottom: '20px', border: '1px solid #ccc' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Invite Collaborator</h4>
                <form onSubmit={handleInvite}>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' as const, borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' as const, borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="viewer">Viewer (read only)</option>
                    <option value="editor">Editor (can edit)</option>
                  </select>
                  <button type="submit" style={{ width: '100%', padding: '8px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Send Invite
                  </button>
                  {inviteStatus && (
                    <p style={{ margin: '8px 0 0', fontSize: '13px', color: inviteStatus.startsWith('✓') ? 'green' : 'red' }}>
                      {inviteStatus}
                    </p>
                  )}
                </form>
              </div>
            )}

            <h4>Add Source</h4>
            <input
              type="text"
              placeholder="Source name (e.g., Chat)"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
            />
            <input
              type="text"
              placeholder="URL (https://...)"
              value={newSourceUrl}
              onChange={(e) => setNewSourceUrl(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
            />
            <button onClick={addSource} style={{ width: '100%', padding: '8px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', marginBottom: '20px' }}>
              Add Source
            </button>

            <h4>Sources</h4>
            {sources.length === 0 ? (
              <p style={{ color: '#999', fontSize: '12px' }}>No sources yet</p>
            ) : (
              sources.map((source) => (
                <div
                  key={source.id}
                  onClick={() => setSelectedSource(source.id)}
                  style={{
                    padding: '10px',
                    marginBottom: '8px',
                    backgroundColor: selectedSource === source.id ? '#007bff' : '#fff',
                    color: selectedSource === source.id ? '#fff' : '#000',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: '1px solid #ddd',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{source.name}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSource(source.id);
                    }}
                    style={{ width: '100%', padding: '5px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          flex: 1,
          backgroundColor: layout.bg_color,
          position: 'relative',
          overflow: 'auto',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        {sources.map((source) => (
          <div
            key={source.id}
            onMouseDown={(e) => handleMouseDown(e, source.id)}
            style={{
              position: 'absolute',
              left: `${source.x}px`,
              top: `${source.y}px`,
              width: `${source.width}px`,
              height: `${source.height}px`,
              backgroundColor: 'rgba(0,0,0,0.1)',
              border: selectedSource === source.id ? '2px solid #007bff' : '2px solid #999',
              borderRadius: '4px',
              cursor: isDragging && selectedSource === source.id ? 'grabbing' : 'grab',
              zIndex: source.z,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '8px', backgroundColor: selectedSource === source.id ? '#007bff' : '#666', color: 'white', fontSize: '12px', fontWeight: 'bold', borderRadius: '3px 3px 0 0', userSelect: 'none' }}>
              {source.name}
            </div>
            <iframe
              src={source.url}
              style={{ flex: 1, border: 'none', backgroundColor: 'white' }}
              title={source.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
