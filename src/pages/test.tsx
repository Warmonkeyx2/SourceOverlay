export default function TestPage() {
  return (
    <div style={{ padding: '40px', background: '#000', color: '#0f0', fontFamily: 'monospace', minHeight: '100vh' }}>
      <h1>SUCCESS - Pages are working!</h1>
      <p>If you see this, Next.js routing is operational.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}
