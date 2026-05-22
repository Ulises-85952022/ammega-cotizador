/* Cart (cotización), success, and aux screens */

const { useState: useS3, useMemo: useM3 } = React;

// ── CART / COTIZACIÓN ───────────────────────────────────────────────────
function CartScreen({ cart, onBack, onNav, onRemove, onChangeQty, onGenerate, session }) {
  const [margin, setMargin] = useS3(25);
  const [client, setClient] = useS3({ nombre: '', empresa: '', email: '' });
  const [entrega, setEntrega] = useS3('3-5 días hábiles');
  const [showClient, setShowClient] = useS3(false);

  const calcLinea = (i) => {
    const p = i.product;
    if (p.esBandaMetrica && i.ancho) return p.precioBinasa * (i.ancho / 25.4) * i.qty;
    return p.precioBinasa * i.qty;
  };

  const subtotal = useM3(() => cart.reduce((s, i) => s + calcLinea(i), 0), [cart]);
  const margenMonto = subtotal * (margin / 100);
  const totalSinIva = subtotal + margenMonto;
  const iva = totalSinIva * 0.16;
  const total = totalSinIva + iva;
  const ventaUtilidad = margenMonto;

  if (cart.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pressable onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="back" size={18} />
          </Pressable>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Cotización</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="cart" size={32} style={{ color: 'var(--text-mute)' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Sin productos</div>
            <div style={{ fontSize: 13, color: 'var(--text-mute)' }}>Agrega productos desde el catálogo</div>
          </div>
          <Pressable
            onClick={() => onNav('catalog')}
            style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            Ver catálogo <Icon name="arrowRight" size={14} />
          </Pressable>
        </div>
        <BottomNav active="cart" onNav={onNav} cartCount={0} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Pressable onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="back" size={18} />
        </Pressable>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Cotización</div>
          <div style={{ fontSize: 11, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
            {cart.length} líneas · {cart.reduce((s, i) => s + i.qty, 0)} piezas
          </div>
        </div>
        <Pressable
          onClick={() => onNav('catalog')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          <Icon name="plus" size={12} stroke={2.5} /> Agregar
        </Pressable>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 12px' }}>
        {/* Client info */}
        <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1.5px solid var(--border)', overflow: 'hidden', marginBottom: 10 }}>
          <button
            onClick={() => setShowClient(s => !s)}
            style={{ width: '100%', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="user" size={14} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Cliente</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {client.nombre || client.empresa ? `${client.nombre}${client.empresa ? ' · ' + client.empresa : ''}` : 'Sin datos del cliente'}
              </div>
            </div>
            <Icon name="chevron" size={16} style={{ color: 'var(--text-mute)', transform: showClient ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 200ms' }} />
          </button>
          {showClient && (
            <div style={{ padding: '4px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border)' }}>
              <input value={client.nombre} onChange={e => setClient({ ...client, nombre: e.target.value })} placeholder="Nombre contacto" style={inputSm} />
              <input value={client.empresa} onChange={e => setClient({ ...client, empresa: e.target.value })} placeholder="Empresa" style={inputSm} />
              <input value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} placeholder="email@empresa.com" style={inputSm} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 10 }}>
                <Icon name="truck" size={14} style={{ color: 'var(--text-mute)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>Entrega:</span>
                <select value={entrega} onChange={e => setEntrega(e.target.value)} style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font)' }}>
                  <option>Inmediata (en stock)</option>
                  <option>1-2 días hábiles</option>
                  <option>3-5 días hábiles</option>
                  <option>1 semana</option>
                  <option>2 semanas</option>
                  <option>Bajo pedido (3-4 sem)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Line items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {cart.map((item, idx) => {
            const p = item.product;
            const linea = calcLinea(item);
            return (
              <div key={p.id + (item.ancho || '')} style={{
                background: 'var(--surface)', borderRadius: 12,
                border: '1.5px solid var(--border)', padding: '10px 12px',
                animation: 'slideUpFade 240ms cubic-bezier(.2,.8,.2,1)',
              }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 3, background: p.marca === 'Megadyne' ? 'var(--accent)' : 'var(--accent-2)', borderRadius: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-mute)' }}>{p.id}</span>
                      {item.ancho && (
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--accent)', background: 'var(--accent-soft)', padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>{item.ancho}mm</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{p.desc}</div>
                  </div>
                  <button onClick={() => onRemove(p.id, item.ancho)} style={{ width: 24, height: 24, border: 'none', background: 'transparent', color: 'var(--text-mute)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, flexShrink: 0 }}>
                    <Icon name="close" size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingLeft: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-2)', borderRadius: 8, padding: 1 }}>
                    <button onClick={() => onChangeQty(p.id, item.ancho, Math.max(1, item.qty - 1))} style={{ width: 26, height: 26, border: 'none', background: 'transparent', color: 'var(--text)', cursor: 'pointer', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="minus" size={12} stroke={2.5} />
                    </button>
                    <div style={{ minWidth: 32, textAlign: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{item.qty}</div>
                    <button onClick={() => onChangeQty(p.id, item.ancho, item.qty + 1)} style={{ width: 26, height: 26, border: 'none', background: 'transparent', color: 'var(--text)', cursor: 'pointer', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="plus" size={12} stroke={2.5} />
                    </button>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>{fmt(linea)}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Margin slider */}
        <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1.5px solid var(--border)', padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Margen comercial</div>
              <div style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>Utilidad: {fmt(ventaUtilidad)}</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>{margin}<span style={{ fontSize: 14, opacity: 0.7 }}>%</span></div>
          </div>
          <input
            type="range" min="0" max="60" value={margin}
            onChange={e => setMargin(+e.target.value)}
            style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {[15, 20, 25, 30, 40].map(m => (
              <button
                key={m}
                onClick={() => setMargin(m)}
                style={{
                  flex: 1, padding: '6px 0', borderRadius: 6,
                  border: '1.5px solid', borderColor: margin === m ? 'var(--accent)' : 'var(--border)',
                  background: margin === m ? 'var(--accent-soft)' : 'var(--surface-2)',
                  color: margin === m ? 'var(--accent)' : 'var(--text-mute)',
                  fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >{m}%</button>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div style={{ background: 'var(--text)', color: 'var(--bg)', borderRadius: 14, padding: '14px 16px' }}>
          <TotalRow label="Subtotal Binasa" value={fmt(subtotal)} muted />
          <TotalRow label={`Margen (${margin}%)`} value={fmt(margenMonto)} muted />
          <TotalRow label="IVA 16%" value={fmt(iva)} muted />
          <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.7 }}>Total cliente</div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>{fmt(total)}</div>
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div style={{ padding: '12px 14px 14px', display: 'flex', gap: 8, flexShrink: 0, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <Pressable
          onClick={() => onGenerate({ cart, client, entrega, margin, subtotal, total, iva, margenMonto })}
          style={{
            flex: 1, padding: '14px',
            borderRadius: 12, border: 'none',
            background: 'var(--accent)', color: 'var(--accent-fg)',
            fontSize: 14, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 8px 20px -8px var(--accent-shadow)',
          }}
        >
          <Icon name="doc" size={16} /> Generar PDF · {fmt(total)}
        </Pressable>
      </div>
    </div>
  );
}

const inputSm = {
  width: '100%', padding: '9px 12px', borderRadius: 9,
  border: '1.5px solid var(--border)',
  background: 'var(--surface-2)', color: 'var(--text)',
  fontSize: 13, fontFamily: 'var(--font)', outline: 'none',
};

function TotalRow({ label, value, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3px 0' }}>
      <div style={{ fontSize: 12, opacity: muted ? 0.6 : 1 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', opacity: muted ? 0.85 : 1 }}>{value}</div>
    </div>
  );
}

// ── SUCCESS ─────────────────────────────────────────────────────────────
function SuccessScreen({ quote, onDone, onNav }) {
  const folio = 'COT-' + Date.now().toString().slice(-6);
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, gap: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'var(--ok-bg)', color: 'var(--ok-fg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'popIn 360ms cubic-bezier(.2,1.4,.4,1)',
        }}>
          <Icon name="check" size={36} stroke={3} />
        </div>
        <div style={{ textAlign: 'center', animation: 'slideUpFade 360ms 120ms backwards' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Cotización lista</div>
          <div style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 6, lineHeight: 1.5 }}>
            Folio <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 4 }}>{folio}</span>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 280, background: 'var(--surface)', borderRadius: 14, border: '1.5px solid var(--border)', padding: 16, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>Cliente</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{quote.client.empresa || quote.client.nombre || 'Sin nombre'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>Productos</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{quote.cart.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>{fmt(quote.total)}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 18px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Pressable
          onClick={() => alert('PDF descargado (demo)')}
          style={{ padding: '14px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 20px -8px var(--accent-shadow)' }}
        >
          <Icon name="download" size={16} /> Descargar PDF
        </Pressable>
        <div style={{ display: 'flex', gap: 8 }}>
          <Pressable
            onClick={() => alert('Compartido (demo)')}
            style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Icon name="send" size={14} /> Enviar
          </Pressable>
          <Pressable
            onClick={onDone}
            style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Nueva cotización
          </Pressable>
        </div>
      </div>
    </div>
  );
}

// ── EQUIVALENCIAS (Cross-reference) ─────────────────────────────────────
function XrefScreen({ onBack, onNav }) {
  const [search, setSearch] = useS3('');
  const filtered = window.EQUIVALENCIAS.filter(e => {
    const q = search.toLowerCase();
    return !q || e.ref.toLowerCase().includes(q) || e.descripcion.toLowerCase().includes(q) || e.competidor.toLowerCase().includes(q);
  });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 8px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Pressable onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="back" size={18} />
        </Pressable>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Equivalencias</div>
          <div style={{ fontSize: 11, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>Gates · Optibelt · Parker → Megadyne / Jasson</div>
        </div>
      </div>

      <div style={{ padding: '8px 16px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', borderRadius: 12, padding: '11px 14px' }}>
          <Icon name="search" size={16} style={{ color: 'var(--text-mute)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar referencia competencia…"
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text)' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 12px' }}>
        {filtered.map((e, idx) => {
          const eq = [...window.CATALOG.bandas, ...window.CATALOG.mangueras].find(p => p.id === e.equivalente);
          return (
            <Pressable
              key={idx}
              onClick={() => eq && onNav('detail', { product: eq })}
              style={{
                width: '100%', display: 'block',
                padding: '14px', borderRadius: 12,
                background: 'var(--surface)', border: '1.5px solid var(--border)',
                cursor: 'pointer', textAlign: 'left',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: 'var(--warn-bg)', color: 'var(--warn-fg)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {e.competidor}
                </span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text)', fontWeight: 600 }}>{e.ref}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 10 }}>{e.descripcion}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--accent-soft)', borderRadius: 8 }}>
                <Icon name="arrowRight" size={14} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Equivale a</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', marginLeft: 'auto' }}>{e.equivalente}</span>
              </div>
            </Pressable>
          );
        })}
      </div>

      <BottomNav active="xref" onNav={onNav} cartCount={0} />
    </div>
  );
}

Object.assign(window, { CartScreen, SuccessScreen, XrefScreen });
