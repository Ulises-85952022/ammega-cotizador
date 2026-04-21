# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ammega-cotizador** is a browser-based quotation system for Jason de Mexico, a Mexican industrial products company. It generates quotes for belts (bandas) and hoses (mangueras). It is built with **vanilla HTML5/JavaScript** — no framework, no npm, no build step. It is designed to work offline using `localStorage` as the primary persistence layer, with optional cloud sync.

## Running the App

Open `index.html` directly in a browser. There is no build step, dev server, or package manager. To test changes, refresh the browser.

## Helper Scripts (Python, standalone)

- `python actualizar_inventario.py` — Syncs an Excel inventory file into the HTML quoters (replaces inline JSON catalog data)
- `python check_html.py` — Validates that JSON data blocks inside the HTML files are well-formed
- `python fix_preview.py` — Injects delivery-time columns into quote tables

There is no test suite and no linter.

## Architecture

### Entry Point and Auth Flow

`index.html` is the login page. On login it:
1. Loads `access_config.json` (via fetch) to seed localStorage with users, resellers, and sync credentials
2. Hashes the entered password with SHA-256 client-side and compares it
3. Redirects by role: `admin` → `admin.html`, `director` → `dashboard.html`, reseller/vendedor → `cotizador_tpl.html`

### Central Configuration: `access_config.json`

This is the single source of truth for all runtime configuration, committed to git:
- `users[]` — `{user, passHash, role, nombre}`
- `resellers[]` — `{nombre, user, descuento, logo}` (logo is Base64-encoded PNG)
- `clientes[]` — per-customer discount percentages
- `quotesBinId` / `quotesBinKey` — JSONBin.io credentials for cloud sync
- `syncToken` / `syncOwner` / `syncRepo` — GitHub token and repo for auto-commit sync

### localStorage Schema

All runtime state lives in localStorage under these keys:

| Key | Contents |
|-----|----------|
| `jdm_session` | `{user, role, loginAt}` |
| `jdm_users` | Seeded from `access_config.json` on login |
| `jdm_resellers` | Reseller list |
| `jdm_clientes` | Customer discount map |
| `jdm_bin_id` / `jdm_bin_key` | JSONBin.io credentials |
| `jdm_sync_token` / `jdm_sync_owner` / `jdm_sync_repo` | GitHub auto-sync credentials |
| `savedQuotes_TIPO` | Saved quotes by product type (`BANDAS`, `MANGUERAS`) |

### Key Pages and Their Roles

- **`cotizador_tpl.html`** — Product-type selector (Bandas vs. Mangueras)
- **`cotizador_v4_tpl.html`** — Main quoter for belts/bandas; contains inline JSON (`RAW_CAT` catalog, `INV` inventory) and all quoting logic
- **`admin.html`** — Admin panel: upload inventory Excel, manage users/resellers, configure sync credentials
- **`dashboard.html`** — Director/manager KPI view: aggregates quotes from localStorage + JSONBin, shows stats

### Quote Lifecycle

1. User selects product type → `cotizador_tpl.html`
2. Quote is built in the product-specific quoter (loads catalog + inventory from inline JSON, allows margin adjustment for resellers)
3. Quote saved to `savedQuotes_TIPO` in localStorage
4. Sync runs: `syncQuotesToBin()` uploads to JSONBin.io; `syncToGitHub()` auto-commits to the configured GitHub repo
5. Dashboard fetches from localStorage + JSONBin, merges, and displays

### Cloud Sync

Two sync mechanisms coexist:
- **JSONBin.io**: lightweight shared storage for multi-device access; credentials live in `access_config.json` and localStorage
- **GitHub auto-sync**: commits quote JSON directly to a GitHub repo (zero-touch CI/CD pattern); uses a personal access token stored in `access_config.json`

Both are optional — the app works fully offline without them.

## Development Branch

Active development happens on `claude/create-claude-docs-W4bHx`. Push changes there.
