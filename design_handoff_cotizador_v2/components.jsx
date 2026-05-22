/* Shared UI primitives — Ammega Cotizador */

// Format currency MXN
const fmt = (n) => `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtCompact = (n) => {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
};

// Icon set — monochrome glyphs (no emoji)
const Icon = ({ name, size = 20, stroke = 2, ...rest }) => {
  const s = size;
  const paths = {
    search: <path d="M11 4a7 7 0 1 1-4.95 11.95L3 19M11 4a7 7 0 0 1 4.95 11.95" />,
    close: <path d="M5 5l14 14M19 5L5 19" />,
    back: <path d="M14 6l-6 6 6 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    cart: <path d="M3 4h2l2.5 11h10L20 7H6.5M9 19a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm10 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />,
    check: <path d="M5 12.5l4.5 4.5L19 7" />,
    user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0" />,
    bell: <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6zm3 10a3 3 0 0 0 6 0" />,
    box: <path d="M3 7l9-4 9 4M3 7l9 4m-9-4v10l9 4m0-14v14m0-14l9-4m0 0v10l-9 4" />,
    swap: <path d="M7 4l-3 3 3 3M4 7h12a4 4 0 0 1 0 8M17 20l3-3-3-3M20 17H8a4 4 0 0 1 0-8" />,
    filter: <path d="M3 5h18M6 12h12M10 19h4" />,
    chevron: <path d="M9 6l6 6-6 6" />,
    doc: <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5zM14 3v5h5M9 13h6M9 17h6" />,
    download: <path d="M12 4v12m0 0l-5-5m5 5l5-5M4 20h16" />,
    send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
    home: <path d="M3 11l9-8 9 8M5 10v10h14V10" />,
    book: <path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2V5zm0 0v15" />,
    trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
    edit: <path d="M4 20h4l11-11-4-4L4 16v4zM14 6l4 4" />,
    sparkle: <path d="M12 3v6m0 6v6m-9-9h6m6 0h6M5 5l4 4m6 6l4 4m0-14l-4 4m-6 6l-4 4" />,
    scan: <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M4 12h16" />,
    history: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2" />,
    info: <path d="M12 8h.01M11 12h1v5h1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />,
    arrowRight: <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />,
    truck: <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />,
    dollar: <path d="M12 2v20M17 6.5C17 4.5 14.8 3 12 3S7 4.5 7 6.5 9 9.5 12 10s5 1.5 5 3.5S14.8 17 12 17s-5-1.5-5-3.5" />,
    star: <path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14 3 9.5l6.5-.5L12 3z" />,
    eye: <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
    grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {paths[name] || null}
    </svg>
  );
};

// Ammega wordmark — uses the imported logo with subtle treatment
const Wordmark = ({ size = 22, color }) => (
  <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 0, fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: size, letterSpacing: '-0.02em', color: color || 'var(--text)', lineHeight: 1 }}>
    <span>amm</span>
    <span style={{ color: 'var(--accent)' }}>e</span>
    <span>ga</span>
    <span style={{ fontWeight: 400, fontSize: size * 0.42, marginLeft: 4, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-mute)', alignSelf: 'center' }}>MX</span>
  </span>
);

// Stock pill — small, monospace number
const StockPill = ({ stock, unidad }) => {
  let kind = 'ok';
  let label = `${stock} ${unidad}`;
  if (stock === 0) { kind = 'zero'; label = 'agotado'; }
  else if (stock < 10) { kind = 'low'; }
  const colors = {
    ok:   { bg: 'var(--ok-bg)', fg: 'var(--ok-fg)' },
    low:  { bg: 'var(--warn-bg)', fg: 'var(--warn-fg)' },
    zero: { bg: 'var(--err-bg)', fg: 'var(--err-fg)' },
  };
  const c = colors[kind];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: c.bg, color: c.fg,
      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
      padding: '2px 7px', borderRadius: 4, letterSpacing: '-0.01em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.fg, opacity: 0.85 }} />
      {label}
    </span>
  );
};

// Brand chip — small label for Megadyne / Jasson
const BrandTag = ({ marca }) => {
  const isMega = marca === 'Megadyne';
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: isMega ? 'var(--accent)' : 'var(--text-mute)',
    }}>{marca}</span>
  );
};

// Press wrapper — adds subtle scale on touch
const Pressable = ({ children, onClick, style, className, as: As = 'button', ...rest }) => {
  const [pressed, setPressed] = React.useState(false);
  return (
    <As
      className={className}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 120ms cubic-bezier(.2,.8,.2,1)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </As>
  );
};

// Animated slide-in screen wrapper
const ScreenWrap = ({ children, screenKey, direction = 'forward' }) => (
  <div
    key={screenKey}
    style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)',
      animation: `${direction === 'back' ? 'slideInLeft' : 'slideInRight'} 240ms cubic-bezier(.2,.8,.2,1)`,
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

// Export to window
Object.assign(window, { fmt, fmtCompact, Icon, Wordmark, StockPill, BrandTag, Pressable, ScreenWrap });
