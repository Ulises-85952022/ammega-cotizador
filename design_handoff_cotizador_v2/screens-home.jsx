/* Screens — Login, Home, Catalog, Detail, Cart */

const { useState, useMemo, useEffect, useRef } = React;

// ── LOGIN ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const submit = () => {
    if (!user.trim() || !pass.trim()) { setError('Ingresa usuario y contraseña'); return; }
    setLoading(true);
    setError('');
    setTimeout(() => {
      // Mock auth — accept anything for the prototype
      const role = user.toLowerCase().includes('admin') ? 'admin'
        : user.toLowerCase().includes('dir') ? 'director'
        : 'vendedor';
      onLogin({ user: user.trim(), role, nombre: user.trim() });
    }, 600);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Background accent — soft teal blob */}
      <div style={{
        position: 'absolute', top: -120, right: -100, width: 320, height: 320,
        borderRadius: '50%', background: 'var(--accent)', opacity: 0.06, filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -160, left: -80, width: 280, height: 280,
        borderRadius: '50%', background: 'var(--accent)', opacity: 0.04, filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px', position: 'relative', zIndex: 1 }}>
        {/* Brand */}
        <div style={{ marginBottom: 48 }}>
          <Wordmark size={34} />
          <div style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            COTIZADOR · B2B
          </div>
        </div>

        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Cotiza en segundos.
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-mute)', marginBottom: 32, lineHeight: 1.5 }}>
          Catálogo Megadyne y Jasson de México. Acceso para distribuidores autorizados.
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block' }}>
              Usuario
            </label>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              onFocus={() => setFocused('user')}
              onBlur={() => setFocused(null)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="vendedor01"
              autoCapitalize="none"
              autoCorrect="off"
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: 12, border: '1.5px solid',
                borderColor: focused === 'user' ? 'var(--accent)' : 'var(--border)',
                background: 'var(--surface)', color: 'var(--text)',
                fontSize: 15, fontFamily: 'var(--font)',
                outline: 'none', transition: 'border-color 150ms, box-shadow 150ms',
                boxShadow: focused === 'user' ? '0 0 0 4px var(--accent-glow)' : 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onFocus={() => setFocused('pass')}
              onBlur={() => setFocused(null)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: 12, border: '1.5px solid',
                borderColor: focused === 'pass' ? 'var(--accent)' : 'var(--border)',
                background: 'var(--surface)', color: 'var(--text)',
                fontSize: 15, fontFamily: 'var(--font)',
                outline: 'none', transition: 'border-color 150ms, box-shadow 150ms',
                boxShadow: focused === 'pass' ? '0 0 0 4px var(--accent-glow)' : 'none',
              }}
            />
          </div>

          {error && (
            <div style={{ fontSize: 13, color: 'var(--err-fg)', background: 'var(--err-bg)', padding: '10px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="info" size={14} />
              {error}
            </div>
          )}

          <Pressable
            onClick={submit}
            disabled={loading}
            style={{
              marginTop: 6, padding: '15px 20px',
              borderRadius: 12, border: 'none',
              background: 'var(--accent)', color: 'var(--accent-fg)',
              fontSize: 15, fontWeight: 600, fontFamily: 'var(--font)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 10px 24px -8px var(--accent-shadow)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <span style={{ width: 16, height: 16, border: '2px solid var(--accent-fg)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 700ms linear infinite' }} />
            ) : (
              <>Ingresar <Icon name="arrowRight" size={16} /></>
            )}
          </Pressable>

          <div style={{ fontSize: 11, color: 'var(--text-mute)', textAlign: 'center', marginTop: 6, lineHeight: 1.5 }}>
            Sugerencias: <code style={{ fontFamily: 'var(--font-mono)' }}>vendedor</code>, <code style={{ fontFamily: 'var(--font-mono)' }}>director</code>, <code style={{ fontFamily: 'var(--font-mono)' }}>admin</code>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 28px 28px', textAlign: 'center', fontSize: 11, color: 'var(--text-mute)', letterSpacing: '0.02em' }}>
        © Jason de México · Distribuidor autorizado
      </div>
    </div>
  );
}

// ── HOME ────────────────────────────────────────────────────────────────
function HomeScreen({ session, onNav, cart, onLogout, recents }) {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const cartValue = cart.reduce((s, i) => s + (i.product.precioBinasa * i.qty), 0);
  const initials = (session?.nombre || '?').slice(0, 2).toUpperCase();

  const allProducts = [...window.CATALOG.bandas, ...window.CATALOG.mangueras];
  const topProducts = recents.length > 0
    ? recents.map(id => allProducts.find(p => p.id === id)).filter(Boolean).slice(0, 4)
    : allProducts.slice(0, 4);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Wordmark size={20} />
        <div style={{ flex: 1 }} />
        <Pressable
          onClick={() => onNav('notifications')}
          style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
        >
          <Icon name="bell" size={16} />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
        </Pressable>
        <Pressable
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 4px', borderRadius: 20, border: 'none', background: 'var(--surface-2)', cursor: 'pointer' }}
          title="Cerrar sesión"
        >
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{session?.nombre?.split(' ')[0]}</span>
        </Pressable>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 12px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Hola, {session?.nombre?.split(' ')[0]}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 4 }}>
            ¿Qué cotizamos<br/>hoy?
          </div>
        </div>

        {/* Search jump */}
        <Pressable
          onClick={() => onNav('catalog')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', borderRadius: 14,
            background: 'var(--surface-2)', border: '1.5px solid var(--border)',
            cursor: 'pointer', textAlign: 'left',
            marginBottom: 20,
          }}
        >
          <Icon name="search" size={18} style={{ color: 'var(--text-mute)' }} />
          <span style={{ flex: 1, fontSize: 14, color: 'var(--text-mute)' }}>Buscar SKU, marca o medida…</span>
          <kbd style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-mute)', background: 'var(--bg)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)' }}>⌘K</kbd>
        </Pressable>

        {/* Quick categories — large tappable */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <CategoryTile
            title="Bandas"
            sub="Megadyne"
            count={window.CATALOG.bandas.length}
            accent="var(--accent)"
            onClick={() => onNav('catalog', { tab: 'bandas' })}
            logo="megadyne-logo.png"
          />
          <CategoryTile
            title="Mangueras"
            sub="Jasson"
            count={window.CATALOG.mangueras.length}
            accent="var(--accent-2)"
            onClick={() => onNav('catalog', { tab: 'mangueras' })}
            logo="jasson-logo.png"
          />
        </div>

        {/* Active quote bar */}
        {totalItems > 0 && (
          <Pressable
            onClick={() => onNav('cart')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderRadius: 14,
              background: 'var(--accent)', color: 'var(--accent-fg)',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              marginBottom: 20,
              boxShadow: '0 8px 24px -8px var(--accent-shadow)',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="cart" size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Cotización en curso</div>
              <div style={{ fontSize: 11, opacity: 0.85, fontFamily: 'var(--font-mono)' }}>{totalItems} producto{totalItems !== 1 ? 's' : ''} · {fmt(cartValue)}</div>
            </div>
            <Icon name="chevron" size={16} />
          </Pressable>
        )}

        {/* Shortcuts row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <ShortcutCard icon="swap" label="Equivalencias" sub={`${window.EQUIVALENCIAS.length} refs`} onClick={() => onNav('xref')} />
          <ShortcutCard icon="history" label="Recientes" sub={`${recents.length}`} onClick={() => onNav('recents')} />
          <ShortcutCard icon="box" label="Back-orders" sub={`${window.BACKORDERS.length}`} onClick={() => onNav('backorders')} />
        </div>

        {/* Section: top products */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {recents.length > 0 ? 'Tus recientes' : 'Más cotizados'}
          </div>
          <button onClick={() => onNav('catalog')} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Ver todo</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topProducts.map(p => (
            <MiniProductRow key={p.id} product={p} onClick={() => onNav('detail', { product: p })} />
          ))}
        </div>
      </div>

      {/* Bottom tab bar */}
      <BottomNav active="home" onNav={onNav} cartCount={totalItems} />
    </div>
  );
}

function CategoryTile({ title, sub, count, accent, onClick, logo }) {
  return (
    <Pressable
      onClick={onClick}
      style={{
        position: 'relative', padding: '16px 14px',
        borderRadius: 16, border: '1.5px solid var(--border)',
        background: 'var(--surface)',
        cursor: 'pointer', textAlign: 'left',
        height: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-mute)' }}>
        {count}
      </div>
      <img src={logo} alt={sub} style={{ height: 22, width: 'auto', objectFit: 'contain', alignSelf: 'flex-start', opacity: 0.85, maxWidth: '70%' }} />
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{sub}</div>
      </div>
      <div style={{ position: 'absolute', bottom: -6, right: -6, width: 60, height: 60, borderRadius: '50%', background: accent, opacity: 0.08 }} />
    </Pressable>
  );
}

function ShortcutCard({ icon, label, sub, onClick }) {
  return (
    <Pressable
      onClick={onClick}
      style={{
        flex: 1, padding: '12px 10px',
        borderRadius: 12, border: '1.5px solid var(--border)',
        background: 'var(--surface)', cursor: 'pointer', textAlign: 'left',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}
    >
      <Icon name={icon} size={16} style={{ color: 'var(--accent)' }} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{sub}</div>
      </div>
    </Pressable>
  );
}

function MiniProductRow({ product: p, onClick }) {
  return (
    <Pressable
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 12,
        background: 'var(--surface)', border: '1.5px solid var(--border)',
        cursor: 'pointer', textAlign: 'left',
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 8,
        background: p.marca === 'Megadyne' ? 'var(--accent-soft)' : 'var(--accent-2-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={p.marca === 'Megadyne' ? 'sparkle' : 'swap'} size={16} style={{ color: p.marca === 'Megadyne' ? 'var(--accent)' : 'var(--accent-2)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-mute)', marginBottom: 2 }}>{p.id}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.desc}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>{fmtCompact(p.precioBinasa)}</div>
        <div style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>/{p.unidad}</div>
      </div>
    </Pressable>
  );
}

// ── BOTTOM NAV ──────────────────────────────────────────────────────────
function BottomNav({ active, onNav, cartCount }) {
  const items = [
    { key: 'home', icon: 'home', label: 'Inicio' },
    { key: 'catalog', icon: 'grid', label: 'Catálogo' },
    { key: 'xref', icon: 'swap', label: 'Equiv.' },
    { key: 'cart', icon: 'cart', label: 'Cotización' },
  ];
  return (
    <div style={{
      display: 'flex', flexShrink: 0,
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '6px 8px 10px',
    }}>
      {items.map(item => {
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onNav(item.key)}
            style={{
              flex: 1, padding: '8px 4px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer',
              color: isActive ? 'var(--accent)' : 'var(--text-mute)',
              position: 'relative',
              transition: 'color 150ms',
            }}
          >
            <span style={{ position: 'relative' }}>
              <Icon name={item.icon} size={20} stroke={isActive ? 2.2 : 1.8} />
              {item.key === 'cart' && cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  background: 'var(--accent)', color: 'var(--accent-fg)',
                  fontSize: 9, fontWeight: 700,
                  minWidth: 14, height: 14, borderRadius: 7,
                  padding: '0 4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                }}>{cartCount}</span>
              )}
            </span>
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, letterSpacing: '0.02em' }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { LoginScreen, HomeScreen, BottomNav });
