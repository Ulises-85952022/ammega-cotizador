
const { useState, useCallback } = React;

window.useTweaks = (defaults) => {
  const [tweaks, setTweaks] = useState(defaults);
  const setTweak = useCallback((key, value) => {
    setTweaks(prev => ({ ...prev, [key]: value }));
  }, []);
  return [tweaks, setTweak];
};

function TweaksPanel({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        title="Ajustes de diseño"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 44, height: 44, borderRadius: '50%', border: 'none',
          background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(8px)',
          color: '#fff', fontSize: 20, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .15s',
        }}
      >⚙️</button>
      {open && (
        <div style={{
          position: 'fixed', bottom: 76, right: 20, zIndex: 9999,
          background: 'rgba(18,18,36,.96)', backdropFilter: 'blur(14px)',
          borderRadius: 18, padding: '16px 18px', minWidth: 230,
          boxShadow: '0 12px 40px rgba(0,0,0,.55)',
          border: '1px solid rgba(255,255,255,.1)',
          color: '#fff', fontFamily: 'DM Sans, sans-serif',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase' }}>Ajustes</span>
            <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'none', color: 'rgba(255,255,255,.4)', fontSize: 16, cursor: 'pointer', padding: 0 }}>✕</button>
          </div>
          {children}
        </div>
      )}
    </>
  );
}

function TweakSection({ label }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 14, marginBottom: 8 }}>{label}</div>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: value ? '#1a7a78' : 'rgba(255,255,255,.18)',
          position: 'relative', transition: 'background .2s', flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 4, left: value ? 22 : 4,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transition: 'left .2s', display: 'block',
        }} />
      </button>
    </div>
  );
}

function TweakSlider({ label, value, min, max, step, unit, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#2a9896', fontWeight: 700 }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#1a7a78', cursor: 'pointer' }}
      />
    </div>
  );
}

function TweakColor({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>{label}</span>
      <input
        type="color" value={value} onChange={e => onChange(e.target.value)}
        style={{ width: 36, height: 26, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none', padding: 0 }}
      />
    </div>
  );
}
