# Cotizador Jason de Mexico — guía rápida

Sistema de cotizaciones web (HTML + JS puro, sin build step, sin backend). Funciona abriendo los archivos desde un server estático (GitHub Pages, Netlify, Vercel).

## Arquitectura

```
index.html                   Login — lee access_config.json y redirige por rol
cotizador_tpl.html           Menú — enlaza a bandas o mangueras
cotizador_bandas.html   (62 KB)  UI + lógica de bandas
cotizador_mangueras.html (63 KB)  UI + lógica de mangueras
data/bandas.js         (~700 KB)  LOGO_B64 + RAW_CAT + INV de bandas
data/mangueras.js      (~750 KB)  LOGO_B64 + RAW_CAT + INV + GATES_XREF + BRAND_XREF
admin.html                   Panel admin — usuarios, resellers, clientes, tokens de sync
dashboard.html               Stats y cotizaciones agregadas (director/admin)
access_config.json           Seed de usuarios + resellers + tokens (auto-published)
build_data.py                Regenera data/*.js desde Excel de inventario
actualizar_inventario.py     (legacy) Versión vieja, solo actualiza INV en HTML
```

## Regla #1 — NO leer ni editar data/*.js directamente

Pesan ~700 KB, revientan el contexto. Para actualizar inventario usar `build_data.py`. Para cambiar catálogo hace falta editar el Excel maestro y correr el script.

Los HTML (`cotizador_bandas.html`, `cotizador_mangueras.html`) ahora son editables normalmente (~60 KB cada uno).

## Roles y pricing

| Rol | localStorage | Pricing | Destino post-login |
|---|---|---|---|
| `admin` | `jdm_session` | todos | `admin.html` |
| `director` | `jdm_session` | todos | `dashboard.html` |
| `vendedor` | `jdm_session` | por cliente (Brr/Applied/Motion/Binasa → `p.b`/`p.a`/`p.m`/`p.n`) | `cotizador_tpl.html` |
| `reseller` | `jdm_reseller_user` + `_nombre` + `_discount` + `_logo` | `p.l * (1 - discount/100)` → luego margen en preview | `cotizador_tpl.html` |

En los cotizadores las vars clave son `_IS_RESELLER`, `_RS_DISCOUNT`, `_RS_LOGO`, `_RS_NOMBRE`. Función de precio: `precioCliente(p, cli)` en ambos HTML.

## Flujo reseller

1. Admin crea reseller en `admin.html` (define `descuento` y `logo` base64)
2. Reseller loguea → entra a `cotizador_tpl.html` con logo propio en header
3. Elige tipo (bandas/mangueras) → ve precios = público − su descuento (su costo)
4. En pantalla de preview hay `#reseller-margin-panel`: ingresa nombre de su cliente + % margen
5. `aplicarMargenReseller()` → precios finales = costo × (1 + margen/100)
6. Imprime PDF con **su logo** y **nombre de su empresa** (no Jason)

## Sync entre dispositivos

- Usuarios/resellers/clientes: via `access_config.json` en repo (auto-publicado por admin)
- Cotizaciones y back orders: via JSONBin (`jdm_bin_id` + `jdm_bin_key` en localStorage)
- Tokens GitHub: `jdm_sync_token` + `jdm_sync_owner` + `jdm_sync_repo`

## Cómo modificar algo

| Quiero... | Edito... |
|---|---|
| Cambiar UI/colores/textos | `cotizador_bandas.html` o `_mangueras.html` directamente |
| Agregar cliente nuevo | `CLIENTES`/`CLI_KEY`/`CLI_DESC` constantes en los HTML + columna en data/*.js |
| Actualizar inventario | `python build_data.py <ruta_excel>` |
| Cambiar login/usuarios | `access_config.json` (o desde `admin.html`) |
| Ajustar lógica de precios | función `precioCliente()` en cada HTML |
| Ajustar cálculo reseller | función `aplicarMargenReseller()` + `renderPreview()` |

## Archivos que se pueden borrar (legacy/duplicados)

- `cotizador_v4_tpl.html` — template viejo sin reseller features, no lo uses
- `cotizador_v4_template.html` — aún más viejo
- `cotizador_tpl.html` dentro del .html principal NO es template, es el menú (confuso)
- `cotizador_mangueras_tpl.html` — template de mangueras sin splitting de datos
- `index2.html` — versión vieja del login
- `check_html.py`, `fix_preview.py` — scripts one-off de migración

Dejados por ahora como backup. Borrar cuando se confirme que el flujo nuevo funciona en producción.

## Branch de trabajo

`claude/fix-quoter-loop-5o5ym` — rama donde se hizo el split datos/HTML.

## Contexto histórico (por qué el split)

Antes los HTML tenían el catálogo embebido → ~800 KB cada uno. Leer/editar en Claude Code reventaba el contexto y bloqueaba las sesiones. La solución fue mover los datos (que casi nunca cambian) a archivos JS externos. Los HTML quedaron manejables y las features siguen 100% intactas.
