# Handoff: Cotizador Ammega — App B2B Vendedores de Campo

## Overview
Aplicación B2B móvil para vendedores de campo de **Distribuidora Binasa** (distribuidor autorizado Megadyne y Jasson). Permite consultar precios/stock de bandas industriales y mangueras hidráulicas, generar cotizaciones con margen personalizado y exportar PDF con logo de empresa.

Complementa un **Panel Admin web** para gestionar empresas, usuarios, catálogo CSV, back-orders y equivalencias de competidores.

---

## About the Design Files
Los archivos incluidos en este paquete son **prototipos de referencia creados en HTML** — muestran el aspecto visual, las interacciones y el flujo de usuario intendidos, pero **NO son código de producción**. La tarea es **recrear estos diseños en React Native (Expo) para la app móvil** y en **Next.js para el panel admin**, usando los patrones y librerías establecidos del stack objetivo.

---

## Fidelity
**Alta fidelidad (hifi)**: Los prototipos son mockups pixel-precisos con colores finales, tipografía, espaciado e interacciones completas. El desarrollador debe recrear la UI con la mayor fidelidad posible usando el stack de producción.

---

## Tech Stack Recomendado

### App Móvil
- **React Native** (Expo) + TypeScript
- **NativeWind** (Tailwind para React Native)
- **React Navigation** (navegación)
- **Zustand** o Context API (estado global)
- **react-native-pdf** o **PDFKit via Expo** (generación PDF)
- **AsyncStorage** (persistencia local)
- **Expo Notifications** (notificaciones back-orders)

### Backend
- **Node.js + Express**
- **PostgreSQL** con **Prisma ORM**
- **JWT** (autenticación via link de invitación)
- **Multer** (upload CSV)
- **csv-parse / exceljs** (parseo de archivos)

### Panel Admin Web
- **Next.js 14+** (App Router)
- **Tailwind CSS**
- **shadcn/ui** o **Radix UI**
- **React Query** (data fetching)
- **ExcelJS** (exportar Excel)

---

## Design Tokens

### Colores
```
--teal:          #1a7a78   (color primario Ammega)
--teal-dark:     #0f5a58   (hover/activo)
--teal-light:    #e8f5f5   (fondos, badges)
--teal-mid:      #2a9896   (acentos)
--amber:         #d97706   (Jasson / advertencias)
--amber-light:   #fef3c7
--red:           #dc2626   (errores / sin stock)
--red-light:     #fee2e2
--green:         #16a34a   (stock OK / success)
--green-light:   #dcfce7
--purple:        #7c3aed   (cotizaciones / rol supervisor)
--blue:          #0891b2   (back-orders / rol vendedor)
--gray-50:       #f8f9fa
--gray-100:      #f1f3f4
--gray-200:      #e8eaed
--gray-300:      #dadce0
--gray-400:      #bdc1c6
--gray-500:      #9aa0a6
--gray-600:      #80868b
--gray-700:      #5f6368
--gray-800:      #3c4043
--gray-900:      #202124
```

### Tipografía
```
Font principal: DM Sans (Google Fonts)
Font mono:      DM Mono (Google Fonts)

Tamaños:
  xs:   10px
  sm:   11-12px
  base: 13-14px
  md:   15-16px
  lg:   18px
  xl:   22-28px
  2xl:  26-32px

Pesos: 300, 400, 500, 600, 700, 800
```

### Espaciado
```
Padding card:   12-16px
Gap elementos:  8-12px
Radius sm:      8px
Radius base:    12px
Radius lg:      16px
Radius pill:    20px
```

### Sombras
```
shadow-sm: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)
shadow:    0 4px 12px rgba(0,0,0,.1), 0 2px 4px rgba(0,0,0,.06)
shadow-lg: 0 8px 32px rgba(0,0,0,.14), 0 4px 8px rgba(0,0,0,.08)
```

---

## Estructura de Datos

### Producto (Catálogo)
```typescript
interface Producto {
  id: string;              // SKU: ej. "AX34", "076R0600-5"
  desc: string;            // Descripción completa
  grupo: string;           // "BANDA INDUSTRIAL" | "MANGUERA HIDRAULICA" | etc.
  categoria: string;       // "BANDA CLASICA" | "ALTA PRESION" | etc.
  precioLista: number;     // Precio de lista (MXN)
  precioBinasa: number;    // Precio distribuidor (≈62% descuento)
  stock: number;           // Unidades disponibles
  unidad: string;          // "pz" | "mt" | "mm"
  marca: 'Megadyne' | 'Jasson';
  esBandaMetrica?: boolean;  // true para bandas sincrónicas métricas
  paso?: string;             // "3M" | "5M" | "8M" | "14M" (solo métricas)
  longitud?: number;         // mm de longitud (solo métricas)
  anchoOpciones?: number[];  // anchos estándar disponibles en mm
}
```

### Item de Carrito
```typescript
interface CartItem {
  product: Producto;
  qty: number;
  ancho?: number;          // Solo para bandas métricas (mm o pulg)
  anchoUnidad?: 'mm' | 'in';
}
```

### Cotización
```typescript
interface Cotizacion {
  folio: string;           // "COT-2026-XXXX"
  fecha: Date;
  clientName: string;
  clientEmpresa: string;
  entrega: string;         // "3-5 días hábiles" | etc.
  margin: number;          // Porcentaje (0-60)
  items: CartItem[];
  subtotal: number;        // Con margen aplicado
  iva: number;             // 16%
  total: number;
  vendedor?: string;
  empresa?: Empresa;
}
```

### Empresa
```typescript
interface Empresa {
  id: string;
  nombre: string;
  rfc: string;
  email: string;
  tel: string;
  ciudad: string;
  direccion: string;
  color: string;           // hex primario
  colorSec: string;        // hex secundario
  logo?: string;           // URL del logo
  activa: boolean;
  vigencia: number;        // días de vigencia de cotización
  iva: number;             // porcentaje IVA
  moneda: 'MXN' | 'USD';
  notas?: string;
}
```

### Usuario
```typescript
type Rol = 'Vendedor' | 'Supervisor' | 'Admin';
type StatusUsuario = 'activo' | 'inactivo' | 'pendiente' | 'cancelado';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  empresa: string;         // ID de empresa
  status: StatusUsuario;
  ultimoAcceso?: Date;
  cotizaciones: number;
  permisos: {
    catalogo: boolean;
    cotizar: boolean;
    backorders: boolean;
    equivalencias: boolean;
    adminPrecios: boolean;  // Ver precio de lista (costo)
    adminUsuarios?: boolean;
  };
}
```

### Back-order
```typescript
type StatusBO = 'pendiente' | 'en_camino' | 'llegado';

interface BackOrder {
  id: string;              // "BO-001"
  producto: string;        // SKU
  desc: string;
  empresa: string;         // ID empresa
  vendedor: string;        // Nombre vendedor
  cliente: string;
  fecha: string;           // ISO date
  estimado?: string;       // Fecha estimada llegada
  cantidad: number;
  unidad: string;
  status: StatusBO;
  nota?: string;
}
```

### Equivalencia (Cross-reference)
```typescript
interface Equivalencia {
  competidor: 'Gates' | 'Optibelt' | 'Parker' | 'SKF' | 'Dunlop';
  ref: string;             // Referencia del competidor
  descripcion: string;
  equivalente: string;     // SKU Binasa equivalente
  marca: 'Megadyne' | 'Jasson';
  tipo: 'Bandas' | 'Mangueras';
}
```

---

## App Móvil — Pantallas

### 1. Home (`/`)
**Propósito:** Dashboard principal del vendedor.

**Layout:** Scroll vertical. TopBar fija (logo + íconos campana/carrito). Cuadrícula 2×2 de acciones rápidas. Lista de productos recientes. Bottom nav fija con 4 items.

**Componentes:**
- **TopBar**: fondo blanco, logo Ammega izq, íconos derecha (notificación con badge rojo si hay back-orders en camino, carrito con contador)
- **Acciones rápidas**: 4 cards en grid 2×2, fondo `gray-50`, borde `gray-200`, radio 12px. Cada card: ícono grande (24px), título 13px bold, subtítulo 11px gray
  - 🔍 Buscar catálogo (`teal`)
  - 🔄 Equivalentes (`amber`)
  - 📋 Cotizaciones (`purple`)
  - 📦 Back-orders (`blue`)
- **Bottom Nav**: 4 tabs (Inicio, Catálogo, Equivalencias, Cotizar), ícono 20px + label 10px, color activo `teal`

---

### 2. Catálogo (`/catalogo`)
**Propósito:** Búsqueda y filtrado del catálogo de productos.

**Layout:** TopBar con back + título + contador + carrito. Tabs (Megadyne/Jasson). Barra de búsqueda. Chips de categoría (scroll horizontal). Lista de productos.

**Componentes:**
- **Tabs con logos reales**: Botón izq con `megadyne-logo.png` (h:24px, grayscale cuando inactivo), botón der con `jasson-logo.png`. Indicador de línea 2px abajo. Label 10px uppercase bold.
- **Barra de búsqueda**: fondo `gray-100`, radio 10px, ícono lupa, placeholder "Buscar por código, descripción…"
- **Chips de categoría**: scroll horizontal, radio 20px, borde `gray-300`, activo fondo `teal` texto blanco
- **ProductCard**: fondo blanco, borde `gray-200` 1.5px, radio 12px, sombra sm. Barra de acento izq 4px de color (teal=Megadyne, amber=Jasson). Cuerpo: SKU mono 11px, descripción 13px bold, chips grupo+stock. Derecha: precio Binasa 15px bold teal-dark, precio lista 11px tachado, botón "+" circular 30px teal.
- **StockBadge**: verde (≥10), ámbar (<10), rojo (0) — texto "X unidad" o "Sin stock"

---

### 3. Detalle de Producto (`/producto/:id`)
**Propósito:** Ver detalle, elegir especificaciones y agregar a cotización.

**Layout:** TopBar con back en color de marca. Hero de color (nombre, marca, SKU). Cuerpo scrollable con cards de precio, configurador (si aplica), disponibilidad, cantidad. Botón primario fijo abajo.

**Componentes:**
- **Hero**: fondo `teal` (Megadyne) o `amber` (Jasson), texto blanco. Marca+categoría 11px uppercase, descripción 18px bold, SKU mono 12px.
- **Price card**: fondo `teal-light` (o `amber-light`), precio principal 28px bold, precio lista tachado 13px, descuento %, nota.
- **Configurador de Banda Métrica** (solo si `esBandaMetrica: true`):
  - Card con borde `teal` 1.5px, radio 12px
  - Título: "Paso Xm · Ymm longitud"
  - Botones de anchos estándar (de `anchoOpciones`): radio 8px, seleccionado fondo `teal` blanco, no seleccionado fondo `gray-50`
  - Input libre + selector mm/pulg
  - Preview de precio calculado en tiempo real: `precioBinasa * (ancho / 25.4)`
- **Selector de cantidad**: 3 elementos en fila (−, número, +), fondo `gray-100`, radio 10px
- **Sin stock**: card rojo con mensaje y sugerencia de back-order
- **Botón agregar**: `btn-primary` deshabilitado (gris) si banda métrica sin ancho seleccionado

---

### 4. Cotización (`/cotizacion`)
**Propósito:** Ver carrito, configurar margen y datos del cliente antes de generar PDF.

**Layout:** TopBar. Sección datos cliente (2 inputs + select entrega). Lista de items. Sección margen. Card totales. Botón generar PDF.

**Componentes:**
- **Datos cliente**: fondo blanco, borde `gray-200`, 2 filas:
  - Fila 1: Input "Nombre" + Input "Empresa" (flex 1-1, fondo `gray-100`, radio 8px, ícono 👤 y 🏢)
  - Fila 2: Select entrega (opciones: Inmediata / 1-2 días / 3-5 días / 1 semana / 2 semanas / Bajo pedido), ícono 🚚
- **CartItem**: fondo blanco, borde `gray-200`, radio 12px. Top: SKU mono + descripción + badge ancho (bandas métricas). Bottom: qty selector (100px) + precio unitario 11px + total 14px bold teal
- **Margen slider**: 0-60%, accent-color `teal`. Label "%", valores subtotal vs utilidad 11px
- **Totales card**: fondo `teal`, texto blanco. Rows subtotal/IVA 13px, total 22px bold
- **Botón PDF**: `btn-primary` full width, ícono 📄

**Lógica precio bands métricas:**
```typescript
const precioItem = (item: CartItem): number => {
  if (item.product.esBandaMetrica && item.ancho) {
    const anchoMm = item.anchoUnidad === 'in' ? item.ancho * 25.4 : item.ancho;
    return item.product.precioBinasa * (anchoMm / 25.4) * item.qty;
  }
  return item.product.precioBinasa * item.qty;
};
```

---

### 5. Vista Previa PDF (`/cotizacion/pdf`)
**Propósito:** Ver el PDF generado antes de enviarlo. El margen NO aparece en el documento.

**Layout:** TopBar con botón "Enviar". Área de preview (fondo gris, documento blanco centrado, proporciones carta 216×279mm). Botones Editar / Enviar abajo.

**Estructura del PDF (de arriba a abajo):**
1. **Franja de color** (4px, color primario empresa)
2. **Header** (2 columnas):
   - Izq: Logo Megadyne (h:18px) + logo empresa (si tiene) + nombre empresa 8px + subtítulo 7px
   - Der: Folio "COT-YYYY-XXXX" 10px bold teal + fecha + vigencia + "COTIZACIÓN COMERCIAL" label
3. **Separador** línea 1.5px color empresa
4. **Datos cliente** (grid 2×2): Cliente / Empresa / Vendedor / Tiempo de entrega
5. **Tabla productos** con columnas: SKU (mono) / Descripción / Qty / P.Unit / Total
   - Cabecera: fondo color empresa, texto blanco, 7px uppercase
   - Filas alternas: blanca / `gray-50`
   - Bandas métricas: descripción incluye `(Xmm ancho)`
   - Precios = `precioBinasa * (1 + margin/100)` — el margen NO se muestra
6. **Sección inferior** (flex row):
   - Izq: Card "Tiempo de entrega" (fondo `teal-light`, borde izq teal) + notas de vigencia
   - Der: Totales (Subtotal / IVA 16% / TOTAL en bold grande)
7. **Footer**: datos de contacto, disclaimer 7px
8. **Franja inferior** (4px, degradado teal)

---

### 6. Equivalencias Cross-reference (`/equivalencias`)
**Propósito:** Buscar referencia de competidor → encontrar equivalente Binasa.

**Layout:** TopBar. Barra búsqueda. Lista de XRef cards.

**XRef Card:** borde `gray-200`, radio 12px. Badge competidor (Gates=rojo, Optibelt=ámbar, Parker=azul), ref mono. Descripción. Flecha → SKU equivalente en `teal` mono + precio si existe.

---

### 7. Back-orders Vendedor (`/backorders`)
**Propósito:** Ver solicitudes activas y crear nueva.

**BO Card:** borde `gray-200`, radio 12px. Top: ID mono + badge status. Descripción 13px bold. Meta: cliente + cantidad + fecha. Si `en_camino`: banner teal "🚚 Mercancía en camino".

**Status badges:**
- `pendiente` → ámbar
- `en_camino` → teal
- `llegado` → verde

---

## Panel Admin Web — Secciones

### Dashboard
- Grid 4 stats: Empresas / Vendedores activos / Cotizaciones / Registros catálogo
- Actividad reciente (lista con íconos de colores)
- Resumen back-orders: 3 cards métricas (Pendientes/En camino/Llegados) + lista compacta
- Card "Logo Ammega Distribuidor Oficial" con preview PDF

### Empresas
- Lista izquierda (cards clickeables)
- Panel derecho: stats empresa (4 métricas), identidad visual (color picker + logo upload), datos, PDF preview en tiempo real
- PDF preview refleja cambios de color/logo instantáneamente

### Usuarios
- Cards de roles diferenciados (Vendedor/Supervisor/Admin) con descripción de permisos
- Tabla con columnas: Usuario/Empresa/Rol/Estado/Último acceso/Cotizaciones/Acciones
- Acciones: Editar | Link de acceso | Toggle activo/inactivo | Cancelar acceso | Eliminar
- Modal edición/invitación: datos + permisos individuales por toggle
- **Permisos por rol:**
  - Vendedor: catalogo, cotizar, backorders
  - Supervisor: todo lo anterior + equivalencias + adminPrecios
  - Admin: acceso completo

### Catálogo CSV
- Zona drag & drop con barra de progreso animada
- Historial de archivos activos
- Guía de formato (columnas requeridas para precios e inventario)

### Back-orders Admin
- 3 cards de stats clickeables (filtran la tabla)
- Tabla: ID/Producto/Empresa+Vendedor/Cliente/Cantidad/F.Solicitud/F.Estimada/Estado/Acciones
- Edición inline de fecha estimada
- Acciones: cambiar status + botón 🔔 Notificar vendedor
- Exportar CSV/Excel

### Equivalencias Admin
- 2 catálogos visuales: Megadyne (Bandas) y Jasson (Mangueras) con logos reales, clickeables como filtro
- Tabla con tabs (Todos / Bandas / Mangueras)
- Fila inline para agregar nueva equivalencia

---

## Flujos Principales

### Flujo 1: Cotización estándar
```
Home → Catálogo → (buscar/filtrar) → ProductCard tap → Detalle
  → (elegir cantidad) → Agregar → Cotización
  → (datos cliente + entrega + margen) → Generar PDF
  → Vista previa → Enviar
```

### Flujo 2: Banda métrica
```
Catálogo → Detalle banda métrica
  → Selector ancho (botones estándar O input libre + mm/pulg)
  → Precio se calcula en tiempo real
  → Botón habilitado solo con ancho seleccionado
  → Agregar con ancho incluido → Cotización
```

### Flujo 3: Back-order
```
Detalle producto (stock=0) → "Solicitar back-order"
  → Form: cliente + cantidad → Enviar
  → Admin recibe notificación → Marca "En camino" + fecha estimada
  → Vendedor recibe push notification → Ve banner en app
```

### Flujo 4: Cross-reference
```
Equivalencias → Buscar ref Gates/Optibelt/Parker
  → Ver SKU equivalente Binasa + precio
  → Tap → Detalle producto → Agregar a cotización
```

### Flujo 5: Admin sube precios
```
Admin Panel → Catálogo CSV → Drag & drop Excel
  → Sistema parsea (validar columnas: Item, Description, Precio de lista, Precio binasa)
  → Progreso animado → Catálogo actualizado en tiempo real
```

---

## Lógica de Negocio Importante

### Cálculo de precios
```typescript
// Precio al cliente (aplicar margen sobre precio Binasa)
const precioCliente = (precioBinasa: number, margin: number) =>
  precioBinasa * (1 + margin / 100);

// Precio banda métrica por ancho
const precioBandaMetrica = (base: number, ancho: number, unidad: 'mm' | 'in') => {
  const anchoMm = unidad === 'in' ? ancho * 25.4 : ancho;
  return base * (anchoMm / 25.4);
};

// IVA México
const calcIVA = (subtotal: number) => subtotal * 0.16;
```

### Generación de folios
```
COT-{YYYY}-{4 dígitos random}
BO-{3 dígitos secuenciales}
```

### Factor de descuento (del Excel)
El precio Binasa = Precio Lista × (1 - factor_descuento)
Factor promedio: ~0.62 (62% descuento sobre lista)

### Autenticación (JWT link de invitación)
- Admin genera link con token JWT (exp: 7 días)
- Usuario abre link → queda autenticado → no necesita contraseña
- Token incluye: userId, empresaId, rol, permisos

---

## Assets Incluidos

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| `megadyne-logo.png` | Logo Megadyne rojo oficial | Tab catálogo Megadyne, PDF header, empresa Binasa |
| `jasson-logo.png` | Logo Jasson mangueras | Tab catálogo Jasson |
| `ammega-logo.png` | Logo Ammega grupo | Referencia de marca |
| `data.js` | Datos mock del catálogo | 20 bandas + 20 mangueras con precios reales de abril 2026 |

---

## Archivos de Diseño

| Archivo | Descripción |
|---------|-------------|
| `Cotizador Ammega.html` | App móvil completa (React+Babel, mock iOS frame) |
| `Admin Panel.html` | Panel admin web completo |
| `data.js` | Datos seed del catálogo (extraídos del Excel real) |

---

## Notas de Implementación

1. **El logo de Ammega/Megadyne siempre aparece en el PDF** como "Distribuidor Oficial", más el logo de la empresa del vendedor si tiene uno configurado.

2. **Bandas métricas**: El configurador de ancho aparece SOLO en detalle, NO en el carrito. El carrito solo muestra el ancho elegido como información.

3. **El margen NUNCA aparece en el PDF** — solo los precios finales al cliente. El margen es información interna del vendedor.

4. **Los colores del PDF se toman de la configuración de la empresa** del vendedor que genera la cotización, no son fijos.

5. **El stock se muestra en la app pero el precio al cliente no incluye el % de descuento** — los vendedores ven el precio Binasa y aplican su propio margen.

6. **Equivalencias**: Al encontrar un equivalente y hacer tap, debe navegar al detalle del producto Binasa correspondiente con el SKU del equivalente.

7. **Parseo del CSV de precios**: Columnas requeridas: `Item`, `Description`, `Tipo`, `Clase`, `Grupo`, `Categoria`, `Precio de lista`, `Precio binasa`, `factor de descuento`.

8. **Parseo del CSV de inventario**: Columnas requeridas: `ARTICULO`, `DESCRIPCION`, `ALMACEN`, `DISPONIBLE`, `UNIDADVENTA`. Sumar `DISPONIBLE` por artículo (hay múltiples almacenes por SKU).

---

## Preguntas para el Desarrollador

Antes de comenzar la implementación, resolver:

1. ¿Se usará Expo Go o bare React Native workflow?
2. ¿La generación de PDF será on-device (react-native-pdf-lib) o server-side (PDFKit/Node)?
3. ¿Las notificaciones de back-orders serán push (Expo Notifications) o solo in-app?
4. ¿El catálogo se carga completamente al iniciar o con paginación/búsqueda server-side? (8,775 productos en el Excel)
5. ¿Se requiere modo offline parcial (catálogo cacheado en AsyncStorage)?
6. ¿La app necesita soporte para Android además de iOS?
