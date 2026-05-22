/* Main app — routing, theme, state, Tweaks integration */

const { useState: useApp, useEffect: useAppE, useMemo: useAppM } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "#1d6c70"
}/*EDITMODE-END*/;

// Accent hex → palette config
const ACCENT_HEX_MAP = {
  '#1d6c70': 'teal',
  '#c25a2a': 'ember',
  '#4654c4': 'indigo',
};

// Theme palettes — applied via CSS variables
const THEMES = {
  light: {
    '--bg': '#fafaf8',
    '--surface': '#ffffff',
    '--surface-2': '#f3f3f0',
    '--border': 'oklch(92% 0.005 180)',
    '--text': 'oklch(18% 0.008 200)',
    '--text-mute': 'oklch(50% 0.012 200)',
    '--ok-bg': 'oklch(94% 0.04 155)',
    '--ok-fg': 'oklch(42% 0.12 155)',
    '--warn-bg': 'oklch(94% 0.05 75)',
    '--warn-fg': 'oklch(48% 0.14 60)',
    '--err-bg': 'oklch(94% 0.04 25)',
    '--err-fg': 'oklch(48% 0.18 25)',
  },
  dark: {
    '--bg': 'oklch(14% 0.012 200)',
    '--surface': 'oklch(18% 0.014 200)',
    '--surface-2': 'oklch(22% 0.014 200)',
    '--border': 'oklch(28% 0.014 200)',
    '--text': 'oklch(96% 0.005 200)',
    '--text-mute': 'oklch(62% 0.012 200)',
    '--ok-bg': 'oklch(28% 0.06 155)',
    '--ok-fg': 'oklch(78% 0.14 155)',
    '--warn-bg': 'oklch(30% 0.08 75)',
    '--warn-fg': 'oklch(82% 0.14 75)',
    '--err-bg': 'oklch(30% 0.08 25)',
    '--err-fg': 'oklch(78% 0.16 25)',
  },
  brand: {
    '--bg': 'oklch(96% 0.012 195)',
    '--surface': '#ffffff',
    '--surface-2': 'oklch(94% 0.018 195)',
    '--border': 'oklch(88% 0.022 195)',
    '--text': 'oklch(22% 0.04 200)',
    '--text-mute': 'oklch(50% 0.03 200)',
    '--ok-bg': 'oklch(94% 0.04 155)',
    '--ok-fg': 'oklch(42% 0.12 155)',
    '--warn-bg': 'oklch(94% 0.05 75)',
    '--warn-fg': 'oklch(48% 0.14 60)',
    '--err-bg': 'oklch(94% 0.04 25)',
    '--err-fg': 'oklch(48% 0.18 25)',
  },
};

const ACCENTS = {
  // Polished from the original #005762
  teal:  { fg: 'oklch(46% 0.08 195)', glow: 'oklch(46% 0.08 195 / 0.12)', shadow: 'oklch(46% 0.08 195 / 0.4)', soft: 'oklch(95% 0.025 195)' },
  // Optional alt — slightly warmer
  ember: { fg: 'oklch(54% 0.16 35)', glow: 'oklch(54% 0.16 35 / 0.12)', shadow: 'oklch(54% 0.16 35 / 0.4)', soft: 'oklch(96% 0.025 35)' },
  // Cooler indigo
  indigo:{ fg: 'oklch(48% 0.16 265)', glow: 'oklch(48% 0.16 265 / 0.12)', shadow: 'oklch(48% 0.16 265 / 0.4)', soft: 'oklch(96% 0.025 265)' },
};

function applyTheme(theme, accentHex) {
  const root = document.documentElement;
  const t = THEMES[theme] || THEMES.light;
  Object.entries(t).forEach(([k, v]) => root.style.setProperty(k, v));

  const accentKey = ACCENT_HEX_MAP[accentHex] || 'teal';
  const a = ACCENTS[accentKey] || ACCENTS.teal;
  root.style.setProperty('--accent', a.fg);
  root.style.setProperty('--accent-fg', '#ffffff');
  root.style.setProperty('--accent-glow', a.glow);
  root.style.setProperty('--accent-shadow', a.shadow);
  root.style.setProperty('--accent-soft', theme === 'dark' ? 'oklch(26% 0.04 195)' : a.soft);

  // Secondary (Jasson amber-ish, always)
  root.style.setProperty('--accent-2', 'oklch(54% 0.14 50)');
  root.style.setProperty('--accent-2-soft', theme === 'dark' ? 'oklch(26% 0.04 50)' : 'oklch(96% 0.025 50)');
}

// ── ROOT APP ────────────────────────────────────────────────────────────
function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [session, setSession] = useApp(null);
  const [screen, setScreen] = useApp('home');
  const [screenData, setScreenData] = useApp({});
  const [navDir, setNavDir] = useApp('forward');
  const [cart, setCart] = useApp([]);
  const [recents, setRecents] = useApp([]);
  const [lastQuote, setLastQuote] = useApp(null);

  // Apply theme on any tweak change
  useAppE(() => {
    applyTheme(tweaks.theme, tweaks.accent);
  }, [tweaks.theme, tweaks.accent]);

  // Restore session
  useAppE(() => {
    try {
      const s = JSON.parse(localStorage.getItem('ammega_session'));
      if (s) setSession(s);
    } catch {}
  }, []);

  const nav = (to, data = {}, dir = 'forward') => {
    setNavDir(dir);
    setScreen(to);
    setScreenData(data);
  };

  const back = () => nav('home', {}, 'back');

  const handleLogin = (s) => {
    setSession(s);
    localStorage.setItem('ammega_session', JSON.stringify(s));
    setScreen('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('ammega_session');
    setSession(null);
    setCart([]);
    setScreen('home');
  };

  const addToCart = (product, qty = 1, ancho = null) => {
    setCart(prev => {
      const key = product.id + (ancho || '');
      const existing = prev.find(i => (i.product.id + (i.ancho || '')) === key);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { product, qty, ancho }];
    });
    setRecents(prev => [product.id, ...prev.filter(id => id !== product.id)].slice(0, 6));
  };

  const removeFromCart = (id, ancho) => {
    setCart(prev => prev.filter(i => !(i.product.id === id && (i.ancho || null) === (ancho || null))));
  };

  const changeQty = (id, ancho, qty) => {
    setCart(prev => prev.map(i => (i.product.id === id && (i.ancho || null) === (ancho || null)) ? { ...i, qty } : i));
  };

  const handleGenerate = (quote) => {
    setLastQuote(quote);
    nav('success');
    setCart([]);
  };

  // ── Render
  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  let body = null;
  switch (screen) {
    case 'home':
      body = <HomeScreen session={session} onNav={nav} cart={cart} onLogout={handleLogout} recents={recents} />;
      break;
    case 'catalog':
      body = <CatalogScreen onNav={nav} cart={cart} initialTab={screenData.tab} onAddToCart={addToCart} onBack={back} />;
      break;
    case 'detail':
      body = <DetailScreen product={screenData.product} onBack={() => nav('catalog', {}, 'back')} onAddToCart={addToCart} cart={cart} />;
      break;
    case 'cart':
      body = <CartScreen cart={cart} onBack={back} onNav={nav} onRemove={removeFromCart} onChangeQty={changeQty} onGenerate={handleGenerate} session={session} />;
      break;
    case 'success':
      body = <SuccessScreen quote={lastQuote} onDone={() => nav('home', {}, 'back')} onNav={nav} />;
      break;
    case 'xref':
      body = <XrefScreen onBack={back} onNav={nav} />;
      break;
    default:
      body = <HomeScreen session={session} onNav={nav} cart={cart} onLogout={handleLogout} recents={recents} />;
  }

  return (
    <>
      <div key={screen} style={{ width: '100%', height: '100%', animation: `${navDir === 'back' ? 'slideInLeft' : 'slideInRight'} 220ms cubic-bezier(.2,.8,.2,1)` }}>
        {body}
      </div>
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Tema" />
        <window.TweakRadio
          label="Modo"
          value={tweaks.theme}
          onChange={(v) => setTweak('theme', v)}
          options={[
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Oscuro' },
            { value: 'brand', label: 'Brand' },
          ]}
        />
        <window.TweakSection label="Acento" />
        <window.TweakColor
          label="Color"
          value={tweaks.accent}
          onChange={(v) => setTweak('accent', v)}
          options={['#1d6c70', '#c25a2a', '#4654c4']}
        />
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
