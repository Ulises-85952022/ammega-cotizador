"""
ACTUALIZADOR DE PRECIOS E INVENTARIO — Cotizador Ammega
=======================================================
Lee el archivo Excel de lista de precios y actualiza data.js con:
  - precioLista   → columna PUBLICO  (hoja "Listas por Artículo")
  - precioBinasa  → columna PRIME    (hoja "Listas por Artículo")
  - stock         → suma DISPONIBLE  (hoja "existencias XXXX")

Uso:
  python actualizar_precios.py
  python actualizar_precios.py "mi lista precios.xlsx"

El script conserva todos los campos especiales del catálogo existente
(esBandaMetrica, paso, longitud, anchoOpciones, unidad, marca, etc.)
"""

import sys, os, re, json, glob
from datetime import datetime

try:
    import pandas as pd
except ImportError:
    print("Instalando pandas y openpyxl…")
    os.system(f"{sys.executable} -m pip install pandas openpyxl -q")
    import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_JS    = os.path.join(SCRIPT_DIR, "data.js")

# ── Buscar Excel ───────────────────────────────────────────────────────────────

def encontrar_excel(arg=None):
    if arg and os.path.isfile(arg):
        return arg
    candidatos = []
    for pat in ["lista*.xlsx", "Lista*.xlsx", "precios*.xlsx", "Precios*.xlsx",
                "inventario*.xlsx", "Inventario*.xlsx", "*.xlsx"]:
        candidatos += glob.glob(os.path.join(SCRIPT_DIR, pat))
    if candidatos:
        return sorted(candidatos, key=os.path.getmtime, reverse=True)[0]
    return None

# ── Detectar hoja de existencias ───────────────────────────────────────────────

def hoja_existencias(xl):
    for name in xl.sheet_names:
        if "exis" in name.lower() or "stock" in name.lower() or "inventario" in name.lower():
            return name
    return None

# ── Leer precios ───────────────────────────────────────────────────────────────

def leer_precios(xl):
    """
    Hoja 'Listas por Artículo': encabezado real en fila 6 (índice 6).
    Columnas requeridas: Item, PRIME (precioBinasa), PUBLICO (precioLista).
    """
    hoja = None
    for name in xl.sheet_names:
        if "lista" in name.lower() or "art" in name.lower() or "precio" in name.lower():
            hoja = name
            break
    if not hoja:
        hoja = xl.sheet_names[1]  # segunda hoja por convención

    df = xl.parse(hoja, header=6)   # fila 7 como encabezado (0-indexed = 6)

    # Normalizar nombres de columna
    df.columns = [str(c).strip() for c in df.columns]

    required = {"Item", "PRIME", "PUBLICO"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Faltan columnas en '{hoja}': {missing}\n"
                         f"Columnas disponibles: {list(df.columns)}")

    df = df[df["Item"].notna() & (df["Item"].astype(str).str.strip() != "")].copy()
    df["Item"] = df["Item"].astype(str).str.strip()
    df["PRIME"]   = pd.to_numeric(df["PRIME"],   errors="coerce")
    df["PUBLICO"] = pd.to_numeric(df["PUBLICO"], errors="coerce")
    df = df.dropna(subset=["PRIME", "PUBLICO"])

    precios = {}
    for _, row in df.iterrows():
        item = row["Item"]
        extra = {}
        for col in ["Grupo", "Categoria", "Description", "Clase"]:
            if col in df.columns and pd.notna(row.get(col)):
                extra[col] = str(row[col]).strip()
        precios[item] = {
            "precioBinasa": round(float(row["PRIME"]),   2),
            "precioLista":  round(float(row["PUBLICO"]), 2),
            **extra,
        }

    print(f"  [{hoja}] {len(precios)} productos con precio")
    return precios

# ── Leer stock ─────────────────────────────────────────────────────────────────

def leer_stock(xl):
    """
    Hoja de existencias: suma DISPONIBLE por ARTICULO.
    """
    hoja = hoja_existencias(xl)
    if not hoja:
        print("  ⚠  No se encontró hoja de existencias — stock no se actualizará")
        return {}

    df = xl.parse(hoja)
    df.columns = [str(c).strip().upper() for c in df.columns]

    # Buscar columna SKU: preferir coincidencia exacta "ARTICULO"
    exact = [c for c in df.columns if c == "ARTICULO"]
    col_art = exact[0] if exact else next(
        (c for c in df.columns if "ARTICULO" in c and "D" not in c and "A" not in c), None
    )
    col_dis = next((c for c in df.columns if c == "DISPONIBLE"), None) or next(
        (c for c in df.columns if "DISPONIBLE" in c or "STOCK" in c), None
    )

    if not col_art or not col_dis:
        print(f"  ⚠  Columnas de inventario no detectadas en '{hoja}'. Cols: {list(df.columns)}")
        return {}

    df["_art"] = df[col_art].astype(str).str.strip()
    df["_dis"] = pd.to_numeric(df[col_dis], errors="coerce").fillna(0)

    stock = df.groupby("_art")["_dis"].sum()
    result = {k: round(float(v), 2) for k, v in stock.items()}
    print(f"  [{hoja}] {len(result)} artículos con stock")
    return result

# ── Parsear data.js ────────────────────────────────────────────────────────────

def leer_data_js():
    with open(DATA_JS, encoding="utf-8") as f:
        content = f.read()

    # Extraer sección CATALOG (termina antes de window.BACKORDERS u otro window.)
    m_start = content.find("window.CATALOG=")
    if m_start == -1:
        raise ValueError("No se encontró window.CATALOG en data.js")
    json_start = m_start + len("window.CATALOG=")

    # Encontrar el cierre del objeto JSON
    m_next = re.search(r';\s*\n?window\.', content[json_start:])
    if m_next:
        json_end = json_start + m_next.start() + 1  # incluir el ;
    else:
        json_end = len(content)

    catalog_str = content[json_start:json_end].rstrip().rstrip(";")
    catalog = json.loads(catalog_str)
    return content, catalog, json_start, json_end

# ── Actualizar catálogo ────────────────────────────────────────────────────────

def actualizar_catalogo(catalog, precios, stock):
    bandas = catalog.get("bandas", [])
    updated = skipped = new_products = 0

    for prod in bandas:
        pid = prod.get("id", "").strip()
        if pid in precios:
            p = precios[pid]
            prod["precioLista"]  = p["precioLista"]
            prod["precioBinasa"] = p["precioBinasa"]
            if "Grupo" in p and p["Grupo"]:
                prod["grupo"] = p["Grupo"].upper()
            if "Categoria" in p and p["Categoria"]:
                prod["categoria"] = p["Categoria"].upper()
            updated += 1
        else:
            skipped += 1

        if pid in stock:
            prod["stock"] = int(stock[pid])
        else:
            prod["stock"] = 0

    # Agregar productos del Excel que no estaban en el catálogo
    existing_ids = {p["id"] for p in bandas}
    for pid, p in precios.items():
        if pid not in existing_ids:
            grupo = p.get("Grupo", "GENERAL").upper()
            cat   = p.get("Categoria", "GENERAL").upper()
            desc  = p.get("Description", pid)
            bandas.append({
                "id":           pid,
                "desc":         desc,
                "grupo":        grupo,
                "categoria":    cat,
                "precioLista":  p["precioLista"],
                "precioBinasa": p["precioBinasa"],
                "stock":        int(stock.get(pid, 0)),
                "unidad":       "pz",
                "marca":        "Megadyne",
            })
            new_products += 1

    print(f"  Actualizados: {updated} | Sin coincidencia en Excel: {skipped} | Nuevos: {new_products}")
    catalog["bandas"] = bandas
    return catalog

# ── Escribir data.js ───────────────────────────────────────────────────────────

def escribir_data_js(content, catalog, json_start, json_end):
    # Backup
    ts  = datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = DATA_JS.replace(".js", f"_bak_{ts}.js")
    with open(bak, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  Backup: {os.path.basename(bak)}")

    ts_str = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.000Z")
    catalog_json = json.dumps(catalog, ensure_ascii=False, separators=(",", ":"))

    new_content = (
        f"// Catálogo actualizado desde panel admin — {ts_str}\n"
        + "window.CATALOG="
        + catalog_json
        + ";"
        + content[json_end:].lstrip(";")
    )

    with open(DATA_JS, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"  data.js actualizado ({len(new_content)//1024} KB)")

# ── MAIN ───────────────────────────────────────────────────────────────────────

def main():
    print("=" * 55)
    print("  ACTUALIZADOR DE PRECIOS — Cotizador Ammega")
    print("=" * 55)

    # 1. Encontrar Excel
    arg = sys.argv[1] if len(sys.argv) > 1 else None
    excel_path = encontrar_excel(arg)

    if not excel_path:
        print("\n⚠  No se encontró archivo Excel.")
        print("   Opciones:")
        print("   a) Pon el .xlsx en la misma carpeta y vuelve a ejecutar")
        print("   b) Pasa la ruta como argumento:")
        print("      python actualizar_precios.py 'ruta/al/archivo.xlsx'")
        input("\nPresiona Enter para salir…")
        return

    print(f"\n[1/4] Excel: {os.path.basename(excel_path)}")

    # 2. Leer Excel
    print("\n[2/4] Leyendo Excel…")
    xl = pd.ExcelFile(excel_path)
    print(f"  Hojas encontradas: {xl.sheet_names}")

    try:
        precios = leer_precios(xl)
    except Exception as e:
        print(f"\n  ERROR leyendo precios: {e}")
        input("\nPresiona Enter para salir…")
        return

    stock = leer_stock(xl)

    # 3. Parsear data.js actual
    print("\n[3/4] Actualizando catálogo…")
    content, catalog, json_start, json_end = leer_data_js()
    n_antes = len(catalog.get("bandas", []))
    print(f"  Productos antes: {n_antes}")

    catalog = actualizar_catalogo(catalog, precios, stock)
    n_despues = len(catalog.get("bandas", []))
    print(f"  Productos después: {n_despues}")

    # 4. Escribir
    print("\n[4/4] Guardando…")
    escribir_data_js(content, catalog, json_start, json_end)

    print("\n✓ LISTO — Recarga index.html en el navegador para ver los cambios.")
    print("=" * 55)


if __name__ == "__main__":
    main()
