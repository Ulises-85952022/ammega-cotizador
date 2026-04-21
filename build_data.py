"""
BUILD DATA - Genera data/bandas.js y data/mangueras.js desde el Excel
======================================================================
Uso:
    python build_data.py

Lee el Excel de inventario + catalogo y regenera los archivos JS
que carga el cotizador. Evita tener que tocar los HTML grandes.

Actualmente solo regenera INV (inventario) porque RAW_CAT y LOGO_B64
son estables. Si cambia el catalogo, hay que regenerarlo a mano desde
el Excel maestro de productos (no incluido aqui).
"""

import sys
import os
import json
import re
import glob

try:
    import pandas as pd
except ImportError:
    print("Instalando pandas...")
    os.system(f"{sys.executable} -m pip install pandas openpyxl -q")
    import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "data")


def encontrar_excel():
    patrones = ["INVENTARIO*.xlsx", "inventario*.xlsx", "lista*.xlsx", "*.xlsx"]
    for p in patrones:
        xls = glob.glob(os.path.join(SCRIPT_DIR, p))
        if xls:
            return sorted(xls, key=os.path.getmtime, reverse=True)[0]
    return None


def leer_inventario(path):
    print(f"  Leyendo: {os.path.basename(path)}")
    df = pd.read_excel(path)
    cols = [c.strip().upper() for c in df.columns]
    col_map = {}
    for i, c in enumerate(cols):
        if "ARTICULO" in c or "CODIGO" in c or "CODE" in c:
            col_map["codigo"] = df.columns[i]
        if "DISPONIBLE" in c or "STOCK" in c or "EXISTENCIA" in c or "QTY" in c:
            col_map["stock"] = df.columns[i]
    if "codigo" not in col_map or "stock" not in col_map:
        raise ValueError(f"No hay columnas ARTICULO/DISPONIBLE. Detectadas: {list(df.columns)}")
    df["_codigo"] = df[col_map["codigo"]].astype(str).str.strip()
    df["_stock"] = pd.to_numeric(df[col_map["stock"]], errors="coerce").fillna(0)
    inv = df.groupby("_codigo")["_stock"].sum()
    inv = inv[inv > 0]
    result = {k: round(float(v), 2) for k, v in inv.items()}
    print(f"  Items con stock > 0: {len(result)}")
    return result


def extraer_cat_codes(js_path):
    with open(js_path, "r", encoding="utf-8") as f:
        content = f.read()
    return set(re.findall(r'"c":"([^"]+)"', content))


def actualizar_inv_en_js(js_path, inv):
    with open(js_path, "r", encoding="utf-8") as f:
        content = f.read()
    cat_codes = set(re.findall(r'"c":"([^"]+)"', content))
    inv_filtrado = {k: v for k, v in inv.items() if k in cat_codes}
    print(f"  Coincidencias con catalogo: {len(inv_filtrado)}")
    inv_json = json.dumps(inv_filtrado, ensure_ascii=False, separators=(",", ":"))
    nuevo, n = re.subn(
        r'(const INV=)\{[^;]*\};',
        lambda m: m.group(1) + inv_json + ";",
        content,
        count=1,
    )
    if n == 0:
        raise ValueError(f"No se encontro 'const INV=' en {os.path.basename(js_path)}")
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(nuevo)
    print(f"  Actualizado: {os.path.basename(js_path)} ({len(nuevo)//1024} KB)")


def main():
    print("=" * 55)
    print("  BUILD DATA - Cotizador Jason de Mexico")
    print("=" * 55)

    excel_path = sys.argv[1] if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]) else encontrar_excel()
    if not excel_path:
        print("\n  No se encontro archivo Excel en la carpeta.")
        sys.exit(1)
    print(f"\n[1/3] Excel: {os.path.basename(excel_path)}")

    print("\n[2/3] Leyendo inventario...")
    inv = leer_inventario(excel_path)

    print("\n[3/3] Actualizando data/*.js...")
    for nombre in ("bandas.js", "mangueras.js"):
        js_path = os.path.join(DATA_DIR, nombre)
        if not os.path.isfile(js_path):
            print(f"  Saltando {nombre} (no existe)")
            continue
        actualizar_inv_en_js(js_path, inv)

    print("\nLISTO.")


if __name__ == "__main__":
    main()
