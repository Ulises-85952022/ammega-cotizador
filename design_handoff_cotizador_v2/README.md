# Handoff — Cotizador Ammega v2 (móvil B2B)

> Rediseño del cotizador móvil para `Ulises-85952022/ammega-cotizador`.
> Enfocado en **velocidad de cotización**: que un vendedor llegue del catálogo al PDF en pocos toques.

---

## 1. Sobre los archivos de este paquete

Los archivos HTML / JSX dentro de esta carpeta son **referencias de diseño** — un prototipo construido con React + Babel inline para mostrar la apariencia y el comportamiento previsto. **No son código de producción para copiar tal cual al repo.**

La tarea es **recrear estos diseños dentro del repositorio existente** (`index.html`, `cotizador_tpl.html`, `cotizador_v4_tpl.html`, etc.), respetando la arquitectura actual:

- HTML estático servido directamente (sin bundler)
- React 18 + Babel Standalone cargados por CDN
- Auth contra `access_config.json` (SHA-256 hashing)
- Catálogo desde `data.js` (window.CATALOG, window.EQUIVALENCIAS, window.BACKORDERS)
- Estado de sesión en `localStorage` bajo `jdm_session` / `ammega_session`
- Logos PNG ya presentes en el repo

El prototipo está modularizado en varios `.jsx` para legibilidad — al portar al repo puedes fusionarlos en un solo archivo si así está organizado el original.

---

## 2. Fidelidad

**Alta fidelidad (hifi).** Los colores, tipografía, espaciados, animaciones y estados están definidos con precisión y deben replicarse pixel-perfect. El sistema de design tokens (sección 8) lo cubre todo.

---

## 3. Estructura del prototipo

```
Cotizador Ammega.html       ← shell con marco de iPhone + carga de scripts
app.jsx                     ← root: routing, theme, estado global (carrito, sesión), tweaks
components.jsx              ← primitivos compartidos: Icon, Wordmark, StockPill, Pressable, etc.
screens-home.jsx            ← LoginScreen + HomeScreen + BottomNav
screens-catalog.jsx         ← CatalogScreen + DetailScreen + ProductRow/GridCard + FloatingCartBar
screens-cart.jsx            ← CartScreen + SuccessScreen + XrefScreen (equivalencias)
tweaks-panel.jsx            ← panel de tweaks (puede omitirse en el repo final — es para preview)
data.js                     ← copia del catálogo real (ya existe en el repo)
```

Cada `screens-*.jsx` exporta sus componentes a `window` (porque cada `<script type="text/babel">` tiene scope propio). Si en tu repo todo va en un solo archivo, esto no aplica.

---

## 4. Pantallas (Screens / Views)

### 4.1 LoginScreen
- **Propósito**: Acceso de vendedor / director / admin antes de entrar al cotizador.
- **Layout**: Una columna, centrada verticalmente, padding lateral 28 px.
  - Wordmark `ammega MX` arriba con subtítulo monospace `COTIZADOR · B2B`
  - Título H1 grande `Cotiza en segundos.`
  - Subtítulo gris explicativo
  - Inputs `Usuario` y `Contraseña` con labels en uppercase mono
  - Botón primario `Ingresar →` ancho completo, con `loading spinner` cuando se valida
  - Footer copyright al fondo
- **Decoración**: dos blobs radiales suaves del color de acento (`opacity: 0.04–0.06`, `filter: blur(40–60px)`) — uno arriba-derecha, otro abajo-izquierda.
- **Estados**:
  - Focus en input: borde `var(--accent)` + box-shadow `0 0 0 4px var(--accent-glow)`
  - Error: caja roja con ícono info + texto del error
  - Loading: spinner blanco 16×16, opacity 0.7 en el botón
- **Auth real (al portar)**: usar el mismo flujo de `index.html` actual (fetch `access_config.json`, SHA-256 de la contraseña, comparar contra `cfg.users[]`).

### 4.2 HomeScreen
- **Propósito**: Lanzar acciones rápidas — buscar, ir a Bandas/Mangueras, ver cotización activa, equivalencias, recientes, back-orders.
- **Layout**: vertical scroll, padding 18 px lateral. Estructura:
  1. **Header** (no scroll): wordmark izq, botón notificaciones + chip de usuario der.
  2. **Greeting**: `HOLA, NOMBRE` (mono pequeño) + `¿Qué cotizamos\nhoy?` (H1 grande, line-break manual).
  3. **Search jump**: pseudo input con ícono lupa + placeholder + tecla `⌘K`. Tap → `CatalogScreen`.
  4. **Category tiles** (grid 2 col, gap 10):
     - Bandas / Megadyne — logo PNG arriba, título "Bandas", contador
     - Mangueras / Jasson — logo PNG arriba, título "Mangueras", contador
     - Cada tile alto fijo 130 px, esquinas 16, blob decorativo bottom-right
  5. **Active quote bar** (visible solo si carrito > 0): card teal full-width con ícono carrito, cuenta de productos y total. Tap → `CartScreen`.
  6. **Shortcuts row**: 3 cards iguales — Equivalencias / Recientes / Back-orders.
  7. **Section header**: `MÁS COTIZADOS` (o `TUS RECIENTES` si hay recientes) + link "Ver todo".
  8. **MiniProductRow list**: 4 productos compactos.
  9. **BottomNav**: barra inferior fija — Inicio / Catálogo / Equiv. / Cotización.

### 4.3 CatalogScreen
- **Propósito**: Listar todo el catálogo (bandas o mangueras) con filtros y agregar rápido al carrito.
- **Layout**:
  1. Header con `back`, título "Catálogo", contador de productos, toggle vista lista/grid.
  2. **Segmented control** Bandas / Mangueras dentro de un track con fondo `--surface-2` y "thumb" que se desliza. Cada segmento muestra título + subtítulo de marca + contador mono.
  3. Input de búsqueda con ícono lupa + botón clear (×).
  4. Row scroll-horizontal de **category chips** — el activo en `--accent`, los demás outline.
  5. Lista o grid de productos:
     - **ProductRow** (vista lista): franja vertical de 3 px con color de marca + SKU mono + paso (badge si es banda métrica) + descripción 2 líneas + StockPill + categoría minúscula + precio mono grande + botón `+` 30×30.
     - **ProductGridCard** (vista grid 2 col): franja superior 3 px + SKU + descripción 2 líneas + StockPill + precio + botón `+` chico.
     - El botón `+` se vuelve un check verde con badge de cantidad cuando ya está en carrito. Para productos con stock=0 está deshabilitado. Para `esBandaMetrica` siempre redirige al detalle (necesita ancho).
  6. **FloatingCartBar**: cuando hay items, aparece flotando justo encima del BottomNav — pill teal con `qty` (avatar mono) + label "Cotización" + total mono + flecha. Animación `slideUpFade` al montar.
  7. **BottomNav** abajo.
- **Agrupación**: cuando el filtro de categoría es "Todos" y la búsqueda está vacía, los productos se agrupan visualmente con headers `MAYÚSCULAS MONO` por `categoria`.
- **Estado vacío**: ícono lupa grande + "Sin resultados" + sugerencia.

### 4.4 DetailScreen
- **Propósito**: Ver detalle de un producto, configurar (ancho para bandas métricas) y agregar a cotización.
- **Layout** vertical scroll + barra sticky inferior:
  1. Header con back + breadcrumb `Detalle / SKU` mono.
  2. **Hero card** (color suave de la marca):
     - BrandTag (Megadyne/Jasson) + separador + categoría mono mayúsculas
     - Descripción grande (20 px, weight 700)
     - **Precio principal mono 28 px** + `/ unidad` mono
     - Precio lista tachado + chip `-NN%` descuento (verde)
  3. **Specs card**: filas separadas por borde — SKU (mono), Grupo, Categoría, Disponibilidad (StockPill), + Paso y Longitud si es banda métrica.
  4. **Selector de ancho** (solo bandas métricas):
     - Título "ANCHO DEL CORTE" + valor actual mono a la derecha
     - Botones mono para cada `anchoOpciones` — activo en `--accent`
     - Input numérico libre para ancho personalizado en mm
     - Borde del input se vuelve `--accent` cuando se usa
  5. **Cantidad y subtotal** card:
     - Título "CANTIDAD" + stepper `− 1 +` (44 px touch target)
     - Divider
     - "SUBTOTAL DE LÍNEA" + total mono grande, dinámico
  6. **Sticky bottom bar**: botón ancho full
     - Si requiere ancho y no hay: "Selecciona el ancho"
     - Si stock=0: "Sin stock — solicitar back-order"
     - Normal: `+ Agregar N pz · $XX.XX`
     - Después de agregar: 1.4 s en verde con check "Agregado a cotización"

### 4.5 CartScreen
- **Propósito**: Editar líneas, datos del cliente, margen comercial y generar el PDF.
- **Layout**:
  1. Header back + título + contador "N líneas · M piezas" + botón "Agregar" outline.
  2. **Cliente collapsible** card — al colapsar muestra ícono + label "CLIENTE" + resumen / "Sin datos del cliente" + chevron rotativo. Expandido: inputs Nombre, Empresa, Email, + select Entrega con plazos predefinidos.
  3. **Line items**:
     - Franja vertical 3 px del color de marca
     - SKU mono + badge ancho si aplica
     - Descripción
     - Botón ✕ borrar arriba derecha
     - Stepper `− qty +` chico + precio de línea mono a la derecha
     - Animación `slideUpFade` al montar
  4. **Margin card**:
     - "MARGEN COMERCIAL" + nota mono "Utilidad: $XX.XX"
     - Valor grande mono `25%` en color de acento
     - Slider 0-60% con `accent-color: var(--accent)`
     - 5 chips de presets: 15 / 20 / 25 / 30 / 40
  5. **Totals card** — fondo `--text` (negro/oscuro), texto inverso:
     - Subtotal Binasa
     - Margen (N%) 
     - IVA 16%
     - Divider sutil
     - **Total cliente** grande mono
  6. **Sticky bar**: botón ancho `Generar PDF · $TOTAL` con ícono doc.
- **Vacío**: cuando carrito = 0, mostrar ícono grande + "Sin productos" + CTA "Ver catálogo".

### 4.6 SuccessScreen
- Check verde grande con animación `popIn` (scale 0.5 → 1.08 → 1)
- Título "Cotización lista" + folio `COT-XXXXXX` mono
- Card resumen: cliente, productos, total
- Botones: `Descargar PDF` (primario), `Enviar` + `Nueva cotización` (lado a lado)
- En el repo real: aquí va la lógica de generación de PDF (ver `cotizador_v4_tpl.html` actual).

### 4.7 XrefScreen (Equivalencias)
- Header back + "Equivalencias" + subtitulo "Gates · Optibelt · Parker → Megadyne / Jasson"
- Input búsqueda
- Lista de cards: badge competidor (amber-bg) + ref mono + descripción + caja de equivalencia con flecha → SKU mono
- Tap → abre el detalle del producto equivalente

---

## 5. Interacciones y comportamiento

### Navegación
- `useState` para `screen` + `screenData` en `App`. No router — single component swap.
- Direccionalidad: `navDir = 'forward' | 'back'` — `forward` aplica `slideInRight`, `back` aplica `slideInLeft` (12 px translate + opacity 0→1, 220 ms `cubic-bezier(.2,.8,.2,1)`).
- Cada cambio de pantalla re-monta con `key={screen}` para que la animación se dispare.

### Carrito (estado global en App)
- Cada item: `{ product, qty, ancho }` — `ancho` opcional para bandas métricas.
- **Key del item** = `product.id + (ancho || '')` para permitir el mismo SKU con anchos distintos.
- Al agregar: si existe la misma key, suma qty; si no, push nuevo.
- Cálculo de precio por línea: si `esBandaMetrica && ancho`, `precio = precioBinasa * (ancho / 25.4) * qty`. Si no, `precio = precioBinasa * qty`.
- Cálculo totales en CartScreen: `subtotal → +margen% → +IVA 16% → total`.

### Recents
- Lista de IDs en estado, máx 6. Se actualiza al hacer addToCart. Se muestra en HomeScreen.

### Animaciones (keyframes)
```css
slideInRight   ← navegación forward (220 ms)
slideInLeft    ← navegación back (220 ms)
slideUpFade    ← line items aparecen al agregar (240–280 ms)
popIn          ← success check (360 ms cubic-bezier(.2,1.4,.4,1))
spin           ← loading spinner (700 ms linear infinite)
```

### Estados de inputs
- Default: borde `1.5 px var(--border)`
- Focus: borde `var(--accent)` + glow `0 0 0 4px var(--accent-glow)`
- Transición: 150 ms

### Hover/active de botones primarios
- `Pressable` envuelve botones tappable y aplica `transform: scale(0.97)` mientras se presiona, con transición 120 ms.

### Estados de stock
- `stock === 0`: badge `agotado` rojo, botón `+` deshabilitado (fondo `--surface-2`, color `--text-mute`), en detail-screen muestra "solicitar back-order"
- `stock < 10`: badge ámbar con número
- `stock >= 10`: badge verde con número

---

## 6. State management

**Estado en `App` (root):**
- `tweaks` — del hook `useTweaks` (sólo para el preview, no en producción)
- `session` — `{ user, role, nombre } | null`
- `screen` — string, ruta actual
- `screenData` — `{ product?, tab? }` data adicional
- `navDir` — `'forward' | 'back'`
- `cart` — `[{ product, qty, ancho }]`
- `recents` — `[id, ...]`
- `lastQuote` — guardado al generar para mostrar en SuccessScreen

**Persistencia:**
- `localStorage.ammega_session` ← session (JSON)
- Al portar: mantener compatibilidad con la clave actual del repo (`jdm_session`) o migrar suavemente.

---

## 7. Datos requeridos

Ya están en `data.js` del repo. Estructura usada:

```js
window.CATALOG = {
  bandas: [{
    id, desc, grupo, categoria,
    precioLista, precioBinasa,
    stock, unidad,   // 'pz' | 'mt' | 'mm'
    marca,           // 'Megadyne' | 'Jasson'
    // opcionales para bandas métricas:
    esBandaMetrica, paso, longitud, anchoOpciones: [mm]
  }],
  mangueras: [...]
};

window.EQUIVALENCIAS = [{
  competidor, ref, descripcion, equivalente, marca
}];

window.BACKORDERS = [{
  id, producto, desc, cliente, fecha, cantidad, status
}];
```

---

## 8. Design tokens

### Tipografía
- **Display + UI**: `'DM Sans', system-ui, sans-serif` — pesos 400, 500, 600, 700, 800, 900
- **Mono** (SKU, precios, badges técnicos, plazos): `'JetBrains Mono', ui-monospace, monospace` — pesos 400, 500, 600
- Sin tracking automático — usar `letter-spacing` por contexto:
  - Headers H1: `-0.02em`
  - UPPERCASE labels: `0.08em` (suaves) / `0.12em` (mono fuerte)
  - Precios mono: `-0.02em` o `-0.03em` (cierres ópticos)
- Antialiasing: `-webkit-font-smoothing: antialiased`

### Paleta — Modo Claro (default)
| Token              | Valor                            | Uso                           |
| ------------------ | -------------------------------- | ----------------------------- |
| `--bg`             | `#fafaf8`                        | Fondo de pantalla             |
| `--surface`        | `#ffffff`                        | Cards, inputs                 |
| `--surface-2`      | `#f3f3f0`                        | Fondos secundarios, chips     |
| `--border`         | `oklch(92% 0.005 180)`           | Bordes 1.5 px                 |
| `--text`           | `oklch(18% 0.008 200)`           | Texto principal               |
| `--text-mute`      | `oklch(50% 0.012 200)`           | Texto secundario, labels      |
| `--accent`         | `oklch(46% 0.08 195)`            | Teal principal (acción)       |
| `--accent-fg`      | `#ffffff`                        | Texto sobre accent            |
| `--accent-soft`    | `oklch(95% 0.025 195)`           | Fondos accent suaves          |
| `--accent-glow`    | `oklch(46% 0.08 195 / 0.12)`     | Focus ring                    |
| `--accent-shadow`  | `oklch(46% 0.08 195 / 0.4)`      | Sombras bajo botones          |
| `--accent-2`       | `oklch(54% 0.14 50)`             | Naranja Jasson (mangueras)    |
| `--accent-2-soft`  | `oklch(96% 0.025 50)`            | Fondo accent-2 suave          |
| `--ok-bg`/`--ok-fg`   | `oklch(94% 0.04 155)` / `oklch(42% 0.12 155)`  | Verde stock OK |
| `--warn-bg`/`--warn-fg` | `oklch(94% 0.05 75)` / `oklch(48% 0.14 60)`  | Ámbar stock bajo |
| `--err-bg`/`--err-fg`   | `oklch(94% 0.04 25)` / `oklch(48% 0.18 25)`  | Rojo error/agotado |

### Paleta — Modo Oscuro
Misma estructura pero base oklch al 14–28% de L para fondos, 62–96% para texto. Ver `app.jsx` → constante `THEMES.dark`.

### Modo Brand
Variante claro con leve tinte teal (L 96%, C 0.012, H 195) en `--bg`. Ver `THEMES.brand`.

### Espaciado
- Padding lateral de pantallas: 16–18 px
- Gap entre secciones: 14–20 px
- Gap entre line items: 6–8 px
- Touch targets mínimo 30 px (botones `+` chicos), 36 px headers, 44 px steppers detalle

### Radios
- Cards grandes: 14–16 px
- Inputs / chips medianos: 10–12 px
- Pills / botones chicos: 6–10 px
- Avatares circulares: 50 %

### Sombras
- Botón primario: `0 8px 20px -8px var(--accent-shadow)`
- Floating cart: `0 12px 32px -8px var(--accent-shadow)`
- Cards: ninguna por defecto — usar bordes 1.5 px

### Stepper de tamaños
| Elemento          | Size                    |
| ----------------- | ----------------------- |
| Body small        | 11 px                   |
| Body medium       | 13 px                   |
| Body large        | 14–15 px                |
| H3 / label        | 12 px uppercase mono    |
| H2 / subtitle     | 18–20 px                |
| H1 / hero         | 22–28 px, weight 700, tracking -0.02em |

---

## 9. Assets

Todos PNG, ya presentes en el repo:
- `ammega-logo.png` — wordmark del prototipo lo recrea inline en SVG/text (`<Wordmark>` en `components.jsx`). Puedes usar el PNG o replicar el wordmark text-based.
- `megadyne-logo.png` — usado en CategoryTile (bandas) y en el segmented control
- `jasson-logo.png` — usado en CategoryTile (mangueras) y en el segmented control

**Íconos**: todos son SVG inline en `components.jsx → <Icon />`, `stroke="currentColor"`. No hay dependencia externa de iconos. Set actual:
`search, close, back, plus, minus, cart, check, user, bell, box, swap, filter, chevron, doc, download, send, home, book, trash, edit, sparkle, scan, history, info, arrowRight, truck, dollar, star, eye, grid, list`.

---

## 10. Cómo portar al repo existente

Recomendación de pasos:

1. **Empieza por reemplazar `cotizador_tpl.html`** (selector Bandas/Mangueras): usa HomeScreen + LoginScreen como base.
2. **Después `cotizador_v4_tpl.html`** (catálogo + carrito): usa CatalogScreen + DetailScreen + CartScreen.
3. **Mantén `data.js`, `access_config.json`, `dashboard.html`, `admin.html`** intactos — solo cambia el "front" del cotizador.
4. **Reemplaza fuentes**: el repo usa `Inter`. Cambia a `DM Sans + JetBrains Mono` actualizando el `<link>` de Google Fonts y el `--font` global.
5. **Inyecta los CSS vars** del modo claro en `:root` global. El modo oscuro/brand puede agregarse después con un toggle en la barra superior.
6. **Mueve `<style>` inline a un `:root` + clases utilitarias**, o mantenlo inline como hace el repo actual — ambos válidos.
7. **Sustituye el `localStorage` key** `ammega_session` por `jdm_session` para mantener compatibilidad con `dashboard.html` y `admin.html`, o agrega un puente que lea ambos.
8. **Quita `tweaks-panel.jsx`** — es solo para el ambiente de preview.
9. **Conserva la lógica de auth real** (SHA-256 contra `access_config.json`) — el prototipo usa un mock.
10. **Genera PDF** usando lo que ya tiene el repo (parece que hay una plantilla PDF en `cotizador_v4_tpl.html`). Conecta el `onGenerate` de CartScreen a esa función.

---

## 11. Archivos en este paquete

| Archivo                       | Qué es                                          |
| ----------------------------- | ----------------------------------------------- |
| `Cotizador Ammega.html`       | Shell HTML con marco de iPhone + carga scripts  |
| `app.jsx`                     | Root, routing, theme, estado global             |
| `components.jsx`              | Icon, Wordmark, StockPill, BrandTag, Pressable  |
| `screens-home.jsx`            | LoginScreen, HomeScreen, BottomNav              |
| `screens-catalog.jsx`         | CatalogScreen, DetailScreen, FloatingCartBar    |
| `screens-cart.jsx`            | CartScreen, SuccessScreen, XrefScreen           |
| `tweaks-panel.jsx`            | Panel de tweaks (omitir en producción)          |
| `data.js`                     | Catálogo de ejemplo (ya existe en el repo)      |
| `*-logo.png`                  | Logos de marca (ya existen en el repo)          |

Abre `Cotizador Ammega.html` directamente en el navegador (sin servidor) para ver el prototipo. Login acepta cualquier usuario/contraseña — el rol se infiere del nombre (`admin*`, `dir*`, otros → vendedor).

---

## 12. Próximas iteraciones sugeridas (no incluidas)

- Escáner QR/código de barras para SKU desde la cámara
- Equivalencias inline en la pantalla de Detalle (chip "También como Gates AX34")
- Histórico de cotizaciones del vendedor (cache local + pull del backend)
- Modo offline con sync (PWA + service worker)
- Notificaciones push de back-orders cuando llega stock
