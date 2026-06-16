"""
ACTUALIZADOR DE PRECIOS E INVENTARIO — Cotizador Ammega
=======================================================
Lee el archivo Excel de lista de precios y actualiza data.js con:
  - precioLista   → columna "Precio de Lista"   (hoja "_Datos")
  - precioBinasa  → columna "Precio Binasa"      (hoja "_Datos")
  - stock         → columna "Disponible"         (hoja "Consolidado_Inv")

Separación bandas / mangueras según columna "Tabla" en _Datos.

Uso:
  python actualizar_precios.py
  python actualizar_precios.py "Mi_lista_de_precios_Junio_2026.xlsx"
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
    for pat in ["Mi_lista*.xlsx", "lista*.xlsx", "Lista*.xlsx", "precios*.xlsx",
                "Precios*.xlsx", "inventario*.xlsx", "Inventario*.xlsx", "*.xlsx"]:
        candidatos += glob.glob(os.path.join(SCRIPT_DIR, pat))
    if candidatos:
        return sorted(candidatos, key=os.path.getmtime, reverse=True)[0]
    return None

# ── Leer precios desde _Datos ──────────────────────────────────────────────────

def leer_precios(xl):
    """
    Hoja '_Datos': encabezado en fila 1.
    Columnas: Artículo, Descripción, Unidad, Categoría, Precio de Lista, Precio Binasa, Tabla
    Retorna dict: {sku: {...}} separado por tabla (Bandas / Mangueras)
    """
    # Buscar la hoja _Datos
    hoja = None
    for name in xl.sheet_names:
        if "_datos" in name.lower() or name.strip() == "_Datos":
            hoja = name
            break
    if not hoja:
        raise ValueError(f"No se encontró hoja '_Datos'. Hojas disponibles: {xl.sheet_names}")

    df = xl.parse(hoja, header=0)
    df.columns = [str(c).strip() for c in df.columns]

    required = {"Artículo", "Precio de Lista", "Precio Binasa"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Faltan columnas en '{hoja}': {missing}\n"
                         f"Columnas disponibles: {list(df.columns)}")

    df = df[df["Artículo"].notna() & (df["Artículo"].astype(str).str.strip() != "")].copy()
    df["Artículo"]       = df["Artículo"].astype(str).str.strip()
    df["Precio de Lista"] = pd.to_numeric(df["Precio de Lista"], errors="coerce")
    df["Precio Binasa"]  = pd.to_numeric(df["Precio Binasa"],   errors="coerce")
    df = df.dropna(subset=["Precio de Lista", "Precio Binasa"])

    precios_bandas    = {}
    precios_mangueras = {}

    for _, row in df.iterrows():
        sku  = row["Artículo"]
        tabla = str(row.get("Tabla", "")).strip().lower() if "Tabla" in df.columns else ""
        desc  = str(row.get("Descripción", sku)).strip() if "Descripción" in df.columns else sku
        unidad = str(row.get("Unidad", "pz")).strip() if "Unidad" in df.columns else "pz"
        cat   = str(row.get("Categoría", "GENERAL")).strip().upper() if "Categoría" in df.columns else "GENERAL"

        entry = {
            "precioBinasa": round(float(row["Precio Binasa"]),   2),
            "precioLista":  round(float(row["Precio de Lista"]), 2),
            "desc":         desc,
            "unidad":       unidad,
            "categoria":    cat,
        }

        if tabla == "mangueras":
            precios_mangueras[sku] = entry
        else:
            precios_bandas[sku] = entry

    print(f"  [{hoja}] Bandas: {len(precios_bandas)} | Mangueras: {len(precios_mangueras)}")
    return precios_bandas, precios_mangueras

# ── Leer stock desde Consolidado_Inv ──────────────────────────────────────────

def leer_stock(xl):
    """
    Hoja 'Consolidado_Inv': columnas Artículo, Disponible.
    """
    hoja = None
    for name in xl.sheet_names:
        n = name.lower()
        if "consolidado" in n or "consol" in n:
            hoja = name
            break
    if not hoja:
        for name in xl.sheet_names:
            n = name.lower()
            if "exis" in n or "stock" in n or "inventario" in n:
                hoja = name
                break

    if not hoja:
        print("  ⚠  No se encontró hoja de inventario — stock no se actualizará")
        return {}

    df = xl.parse(hoja, header=0)
    df.columns = [str(c).strip() for c in df.columns]

    col_art = next((c for c in df.columns if c.lower() == "artículo" or c.lower() == "articulo"), None)
    col_dis = next((c for c in df.columns if c.lower() == "disponible" or c.lower() == "stock"), None)

    if not col_art or not col_dis:
        print(f"  ⚠  Columnas no detectadas en '{hoja}'. Cols: {list(df.columns)}")
        return {}

    df["_art"] = df[col_art].astype(str).str.strip()
    df["_dis"] = pd.to_numeric(df[col_dis], errors="coerce").fillna(0)
    df = df[df["_art"] != "" ]

    stock = df.groupby("_art")["_dis"].sum()
    result = {k: round(float(v), 2) for k, v in stock.items()}
    print(f"  [{hoja}] {len(result)} artículos con stock")
    return result

# ── Parsear data.js ────────────────────────────────────────────────────────────

def leer_data_js():
    with open(DATA_JS, encoding="utf-8") as f:
        content = f.read()

    m_start = content.find("window.CATALOG=")
    if m_start == -1:
        raise ValueError("No se encontró window.CATALOG en data.js")
    json_start = m_start + len("window.CATALOG=")

    m_next = re.search(r';\s*\n?window\.', content[json_start:])
    if m_next:
        json_end = json_start + m_next.start() + 1
    else:
        json_end = len(content)

    catalog_str = content[json_start:json_end].rstrip().rstrip(";")
    catalog = json.loads(catalog_str)
    return content, catalog, json_start, json_end

# ── Actualizar una sección del catálogo (bandas o mangueras) ──────────────────

def actualizar_seccion(items, precios, stock, nombre_seccion):
    updated = skipped = new_products = 0

    for prod in items:
        pid = prod.get("id", "").strip()
        if pid in precios:
            p = precios[pid]
            prod["precioLista"]  = p["precioLista"]
            prod["precioBinasa"] = p["precioBinasa"]
            if p.get("categoria"):
                prod["categoria"] = p["categoria"]
            updated += 1
        else:
            skipped += 1

        prod["stock"] = int(stock.get(pid, prod.get("stock", 0)))

    existing_ids = {p["id"] for p in items}
    for pid, p in precios.items():
        if pid not in existing_ids:
            items.append({
                "id":           pid,
                "desc":         p.get("desc", pid),
                "grupo":        "GENERAL",
                "categoria":    p.get("categoria", "GENERAL"),
                "precioLista":  p["precioLista"],
                "precioBinasa": p["precioBinasa"],
                "stock":        int(stock.get(pid, 0)),
                "unidad":       p.get("unidad", "pz"),
                "marca":        "Megadyne",
            })
            new_products += 1

    print(f"  [{nombre_seccion}] Actualizados: {updated} | Sin match: {skipped} | Nuevos: {new_products}")
    return items

# ── Escribir data.js ───────────────────────────────────────────────────────────

def escribir_data_js(content, catalog, json_start, json_end):
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

    print("\n[2/4] Leyendo Excel…")
    xl = pd.ExcelFile(excel_path)
    print(f"  Hojas encontradas: {xl.sheet_names}")

    try:
        precios_bandas, precios_mangueras = leer_precios(xl)
    except Exception as e:
        print(f"\n  ERROR leyendo precios: {e}")
        input("\nPresiona Enter para salir…")
        return

    stock = leer_stock(xl)

    print("\n[3/4] Actualizando catálogo…")
    content, catalog, json_start, json_end = leer_data_js()

    print(f"  Bandas antes:    {len(catalog.get('bandas', []))}")
    print(f"  Mangueras antes: {len(catalog.get('mangueras', []))}")

    catalog["bandas"]    = actualizar_seccion(catalog.get("bandas",    []), precios_bandas,    stock, "bandas")
    catalog["mangueras"] = actualizar_seccion(catalog.get("mangueras", []), precios_mangueras, stock, "mangueras")

    print(f"  Bandas después:    {len(catalog['bandas'])}")
    print(f"  Mangueras después: {len(catalog['mangueras'])}")

    print("\n[4/4] Guardando…")
    escribir_data_js(content, catalog, json_start, json_end)

    print("\n✓ LISTO — Recarga index.html en el navegador para ver los cambios.")
    print("=" * 55)


if __name__ == "__main__":
    main()
