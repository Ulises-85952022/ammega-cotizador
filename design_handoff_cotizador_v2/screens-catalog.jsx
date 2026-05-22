/* Catalog + Detail screens */

const { useState: useS2, useMemo: useM2, useEffect: useE2, useRef: useR2 } = React;

// ── CATALOG ─────────────────────────────────────────────────────────────
function CatalogScreen({ onNav, cart, initialTab = 'bandas', onAddToCart, onBack }) {
  const [tab, setTab] = useS2(initialTab);
  const [search, setSearch] = useS2('');
  const [cat, setCat] = useS2('Todos');
  const [view, setView] = useS2('list'); // list | grid
  const searchRef = useR2(null);

  const allProducts = tab === 'bandas' ? window.CATALOG.bandas : window.CATALOG.mangueras;
  const cats = useM2(() => ['Todos', ...new Set(allProducts.map(p => p.categoria))], [tab]);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const filtered = useM2(() => {
    const q = search.toLowerCase().trim();
    return allProducts.filter(p => {
      const matchSearch = !q || p.id.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q);
      const matchCat = cat === 'Todos' || p.categoria === cat;
      return matchSearch && matchCat;
    });
  }, [allProducts, search, cat]);

  // Group by category when no filter
  const grouped = useM2(() => {
    if (cat !== 'Todos' || search) return null;
    const g = {};
    filtered.forEach(p => {
      if (!g[p.categoria]) g[p.categoria] = [];
      g[p.categoria].push(p);
    });
    return g;
  }, [filtered, cat, search]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Pressable onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="back" size={18} />
        </Pressable>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Catálogo</div>
          <div style={{ fontSize: 11, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>{filtered.length} productos</div>
        </div>
        <Pressable
          onClick={() => setView(v => v === 'list' ? 'grid' : 'list')}
          style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Icon name={view === 'list' ? 'grid' : 'list'} size={16} />
        </Pressable>
      </div>

      {/* Tab switcher — segmented control */}
      <div style={{ padding: '0 16px 12px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', gap: 4, padding: 4,
          background: 'var(--surface-2)', borderRadius: 12,
          position: 'relative',
        }}>
          {[
            { key: 'bandas', label: 'Bandas', sub: 'Megadyne', count: window.CATALOG.bandas.length },
            { key: 'mangueras', label: 'Mangueras', sub: 'Jasson', count: window.CATALOG.mangueras.length },
          ].map(t => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setCat('Todos'); }}
                style={{
                  flex: 1, padding: '10px 12px',
                  background: isActive ? 'var(--surface)' : 'transparent',
                  border: 'none', borderRadius: 9,
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'background 180ms, box-shadow 180ms',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? 'var(--text)' : 'var(--text-mute)' }}>
                  {t.label}
                  <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, color: 'var(--text-mute)' }}>{t.count}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 1, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{t.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '0 16px 10px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--surface-2)', borderRadius: 12,
          padding: '11px 14px',
          border: '1.5px solid transparent',
          transition: 'border-color 150ms',
        }}>
          <Icon name="search" size={16} style={{ color: 'var(--text-mute)' }} />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SKU, descripción, medida…"
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--border)', color: 'var(--text-mute)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
              <Icon name="close" size={12} stroke={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 6, padding: '0 16px 12px', overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none' }} className="hide-scroll">
        {cats.map(c => {
          const active = c === cat;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                padding: '6px 12px', borderRadius: 20,
                border: '1.5px solid',
                borderColor: active ? 'var(--accent)' : 'var(--border)',
                background: active ? 'var(--accent)' : 'var(--surface)',
                color: active ? 'var(--accent-fg)' : 'var(--text)',
                fontSize: 11, fontWeight: 600,
                whiteSpace: 'nowrap', cursor: 'pointer',
                fontFamily: 'var(--font)', letterSpacing: '0.01em',
                transition: 'all 150ms',
                flexShrink: 0,
              }}
            >{c}</button>
          );
        })}
      </div>

      {/* Product list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 80px' }}>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-mute)' }}>
            <Icon name="search" size={32} style={{ opacity: 0.4, marginBottom: 12 }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>Sin resultados</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Prueba con otra búsqueda</div>
          </div>
        )}

        {view === 'list' && (
          grouped ? (
            Object.entries(grouped).map(([catName, prods]) => (
              <div key={catName}>
                <div style={{ padding: '14px 4px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
                  {catName}
                  <span style={{ marginLeft: 6, opacity: 0.6 }}>{prods.length}</span>
                </div>
                {prods.map(p => <ProductRow key={p.id} product={p} onNav={onNav} onAdd={onAddToCart} cart={cart} />)}
              </div>
            ))
          ) : (
            filtered.map(p => <ProductRow key={p.id} product={p} onNav={onNav} onAdd={onAddToCart} cart={cart} />)
          )
        )}

        {view === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 4 }}>
            {filtered.map(p => <ProductGridCard key={p.id} product={p} onNav={onNav} onAdd={onAddToCart} cart={cart} />)}
          </div>
        )}
      </div>

      {/* Floating cart bar */}
      {totalItems > 0 && (
        <FloatingCartBar cart={cart} onClick={() => onNav('cart')} />
      )}

      <BottomNav active="catalog" onNav={onNav} cartCount={totalItems} />
    </div>
  );
}

function ProductRow({ product: p, onNav, onAdd, cart }) {
  const inCart = cart.find(i => i.product.id === p.id);
  return (
    <Pressable
      onClick={() => onNav('detail', { product: p })}
      style={{
        width: '100%', display: 'flex', alignItems: 'stretch', gap: 0,
        padding: 0, borderRadius: 12,
        background: 'var(--surface)', border: '1.5px solid var(--border)',
        cursor: 'pointer', textAlign: 'left',
        marginBottom: 6, overflow: 'hidden',
      }}
    >
      <div style={{ width: 3, background: p.marca === 'Megadyne' ? 'var(--accent)' : 'var(--accent-2)' }} />
      <div style={{ flex: 1, minWidth: 0, padding: '11px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-mute)', letterSpacing: '-0.01em' }}>{p.id}</span>
          {p.esBandaMetrica && (
            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{p.paso}</span>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.desc}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <StockPill stock={p.stock} unidad={p.unidad} />
          <span style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>·</span>
          <span style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', textTransform: 'lowercase' }}>{p.categoria.toLowerCase()}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', padding: '11px 12px', flexShrink: 0, gap: 6 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', lineHeight: 1 }}>{fmt(p.precioBinasa)}</div>
          <div style={{ fontSize: 9, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>por {p.unidad}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); if (p.stock > 0 && !p.esBandaMetrica) onAdd(p, 1); else onNav('detail', { product: p }); }}
          disabled={p.stock === 0}
          style={{
            width: 30, height: 30, borderRadius: 8,
            border: 'none',
            background: p.stock === 0 ? 'var(--surface-2)' : (inCart ? 'var(--ok-bg)' : 'var(--accent)'),
            color: p.stock === 0 ? 'var(--text-mute)' : (inCart ? 'var(--ok-fg)' : 'var(--accent-fg)'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 150ms',
            position: 'relative',
          }}
        >
          {inCart ? <Icon name="check" size={14} stroke={2.5} /> : <Icon name="plus" size={14} stroke={2.5} />}
          {inCart && (
            <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: 9, fontWeight: 700, minWidth: 14, height: 14, borderRadius: 7, padding: '0 3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>
              {inCart.qty}
            </span>
          )}
        </button>
      </div>
    </Pressable>
  );
}

function ProductGridCard({ product: p, onNav, onAdd, cart }) {
  const inCart = cart.find(i => i.product.id === p.id);
  return (
    <Pressable
      onClick={() => onNav('detail', { product: p })}
      style={{
        padding: '12px 12px 10px', borderRadius: 12,
        background: 'var(--surface)', border: '1.5px solid var(--border)',
        cursor: 'pointer', textAlign: 'left',
        display: 'flex', flexDirection: 'column', gap: 8,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: p.marca === 'Megadyne' ? 'var(--accent)' : 'var(--accent-2)' }} />
      <div style={{ paddingTop: 4 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-mute)' }}>{p.id}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 32 }}>{p.desc}</div>
      </div>
      <StockPill stock={p.stock} unidad={p.unidad} />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>{fmtCompact(p.precioBinasa)}</div>
          <div style={{ fontSize: 9, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>/{p.unidad}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); if (p.stock > 0 && !p.esBandaMetrica) onAdd(p, 1); else onNav('detail', { product: p }); }}
          disabled={p.stock === 0}
          style={{
            width: 28, height: 28, borderRadius: 7, border: 'none',
            background: p.stock === 0 ? 'var(--surface-2)' : (inCart ? 'var(--ok-bg)' : 'var(--accent)'),
            color: p.stock === 0 ? 'var(--text-mute)' : (inCart ? 'var(--ok-fg)' : 'var(--accent-fg)'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {inCart ? <Icon name="check" size={12} stroke={2.5} /> : <Icon name="plus" size={12} stroke={2.5} />}
        </button>
      </div>
    </Pressable>
  );
}

function FloatingCartBar({ cart, onClick }) {
  const total = cart.reduce((s, i) => {
    const p = i.product;
    if (p.esBandaMetrica && i.ancho) return s + p.precioBinasa * (i.ancho / 25.4) * i.qty;
    return s + p.precioBinasa * i.qty;
  }, 0);
  const qty = cart.reduce((s, i) => s + i.qty, 0);
  return (
    <div style={{
      position: 'absolute', bottom: 78, left: 12, right: 12,
      zIndex: 10,
      animation: 'slideUpFade 280ms cubic-bezier(.2,.8,.2,1)',
    }}>
      <Pressable
        onClick={onClick}
        style={{
          width: '100%',
          background: 'var(--accent)', color: 'var(--accent-fg)',
          borderRadius: 14, padding: '12px 16px',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 12px 32px -8px var(--accent-shadow)',
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
        }}>{qty}</div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 500 }}>Cotización</div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>{fmt(total)}</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          Ver <Icon name="arrowRight" size={14} />
        </div>
      </Pressable>
    </div>
  );
}

// ── DETAIL ──────────────────────────────────────────────────────────────
function DetailScreen({ product: p, onBack, onAddToCart, cart }) {
  const [qty, setQty] = useS2(1);
  const [ancho, setAncho] = useS2(p.esBandaMetrica && p.anchoOpciones ? p.anchoOpciones[0] : null);
  const [anchoCustom, setAnchoCustom] = useS2('');
  const [added, setAdded] = useS2(false);

  const inCart = cart.find(i => i.product.id === p.id);
  const isMega = p.marca === 'Megadyne';
  const accent = isMega ? 'var(--accent)' : 'var(--accent-2)';
  const accentSoft = isMega ? 'var(--accent-soft)' : 'var(--accent-2-soft)';

  const anchoFinal = anchoCustom ? Number(anchoCustom) : ancho;
  const precioEfectivo = p.esBandaMetrica && anchoFinal
    ? p.precioBinasa * (anchoFinal / 25.4)
    : p.precioBinasa;
  const totalLinea = precioEfectivo * qty;
  const descuento = Math.round((1 - p.precioBinasa / p.precioLista) * 100);

  const handleAdd = () => {
    if (p.esBandaMetrica && !anchoFinal) return;
    onAddToCart(p, qty, anchoFinal);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Pressable onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="back" size={18} />
        </Pressable>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
          Detalle / <span style={{ color: 'var(--text)' }}>{p.id}</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 16px' }}>
        {/* Hero card */}
        <div style={{
          background: accentSoft,
          borderRadius: 16, padding: '20px 18px',
          marginBottom: 14,
          position: 'relative', overflow: 'hidden',
          border: '1.5px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <BrandTag marca={p.marca} />
            <span style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>·</span>
            <span style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.categoria}</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1.25, letterSpacing: '-0.01em', marginBottom: 10 }}>
            {p.desc}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {fmt(p.precioBinasa)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>/ {p.unidad}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ textDecoration: 'line-through' }}>Lista {fmt(p.precioLista)}</span>
            <span style={{ background: 'var(--ok-bg)', color: 'var(--ok-fg)', padding: '1px 6px', borderRadius: 3, fontWeight: 600 }}>−{descuento}%</span>
          </div>
        </div>

        {/* Specs */}
        <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1.5px solid var(--border)', overflow: 'hidden', marginBottom: 14 }}>
          <SpecRow label="SKU" value={p.id} mono />
          <SpecRow label="Grupo" value={p.grupo} />
          <SpecRow label="Categoría" value={p.categoria} />
          <SpecRow label="Disponibilidad" valueEl={<StockPill stock={p.stock} unidad={p.unidad} />} />
          {p.esBandaMetrica && (
            <>
              <SpecRow label="Paso" value={p.paso} mono />
              <SpecRow label="Longitud" value={`${p.longitud} mm`} mono />
            </>
          )}
        </div>

        {/* Banda métrica — ancho selector */}
        {p.esBandaMetrica && (
          <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1.5px solid var(--border)', padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ancho del corte</div>
              <div style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>{anchoFinal ? `${anchoFinal}mm` : '— mm'}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {p.anchoOpciones.map(a => {
                const active = ancho === a && !anchoCustom;
                return (
                  <button
                    key={a}
                    onClick={() => { setAncho(a); setAnchoCustom(''); }}
                    style={{
                      padding: '8px 14px', borderRadius: 10,
                      border: '1.5px solid', borderColor: active ? accent : 'var(--border)',
                      background: active ? accent : 'var(--surface)',
                      color: active ? 'var(--accent-fg)' : 'var(--text)',
                      fontSize: 13, fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer', transition: 'all 150ms',
                    }}
                  >{a}<span style={{ fontSize: 9, marginLeft: 2, opacity: 0.7 }}>mm</span></button>
                );
              })}
            </div>
            <input
              type="number"
              value={anchoCustom}
              onChange={e => { setAnchoCustom(e.target.value); setAncho(null); }}
              placeholder="o ancho personalizado (mm)"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                border: '1.5px solid', borderColor: anchoCustom ? accent : 'var(--border)',
                background: 'var(--surface-2)', color: 'var(--text)',
                fontSize: 13, fontFamily: 'var(--font-mono)', outline: 'none',
              }}
            />
          </div>
        )}

        {/* Quantity + price summary */}
        <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1.5px solid var(--border)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cantidad</div>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-2)', borderRadius: 10, padding: 2 }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: 'var(--text)', cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="minus" size={14} stroke={2.5} />
              </button>
              <div style={{ minWidth: 44, textAlign: 'center', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{qty}</div>
              <button onClick={() => setQty(q => q + 1)} style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: 'var(--text)', cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="plus" size={14} stroke={2.5} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Subtotal de línea</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>{fmt(totalLinea)}</div>
          </div>
        </div>
      </div>

      {/* Sticky add bar */}
      <div style={{ padding: '12px 18px 16px', flexShrink: 0, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <Pressable
          onClick={handleAdd}
          disabled={p.esBandaMetrica && !anchoFinal || p.stock === 0}
          style={{
            width: '100%', padding: '15px 20px',
            borderRadius: 12, border: 'none',
            background: added ? 'var(--ok-fg)' : (p.stock === 0 ? 'var(--surface-2)' : accent),
            color: p.stock === 0 ? 'var(--text-mute)' : 'var(--accent-fg)',
            fontSize: 15, fontWeight: 700, fontFamily: 'var(--font)',
            cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: p.stock === 0 ? 'none' : '0 8px 20px -8px var(--accent-shadow)',
            transition: 'background 220ms',
          }}
        >
          {added ? (
            <><Icon name="check" size={18} stroke={2.5} /> Agregado a cotización</>
          ) : p.stock === 0 ? (
            <>Sin stock — solicitar back-order</>
          ) : p.esBandaMetrica && !anchoFinal ? (
            <>Selecciona el ancho</>
          ) : (
            <>+ Agregar {qty} {p.unidad} · {fmt(totalLinea)}</>
          )}
        </Pressable>
      </div>
    </div>
  );
}

function SpecRow({ label, value, valueEl, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: mono ? 'var(--font-mono)' : 'var(--font)' }}>
        {valueEl || value}
      </div>
    </div>
  );
}

Object.assign(window, { CatalogScreen, DetailScreen, FloatingCartBar });
