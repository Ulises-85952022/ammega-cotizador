
function IOSDevice({ children }) {
  return (
    <div style={{
      position: 'relative', width: 390, height: 844,
      background: '#000', borderRadius: 50,
      boxShadow: '0 0 0 2px #444, 0 0 0 7px #1a1a1a, 0 40px 80px rgba(0,0,0,.6)',
      overflow: 'hidden',
    }}>
      {/* Dynamic Island */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 34, background: '#000', borderRadius: 20, zIndex: 100,
      }} />
      {/* Side buttons */}
      <div style={{ position: 'absolute', left: -3, top: 120, width: 3, height: 32, background: '#444', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', left: -3, top: 164, width: 3, height: 56, background: '#444', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', left: -3, top: 230, width: 3, height: 56, background: '#444', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', right: -3, top: 150, width: 3, height: 80, background: '#444', borderRadius: '0 2px 2px 0' }} />
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 50 }}>
        {children}
      </div>
    </div>
  );
}
