"""
ACTUALIZADOR DE INVENTARIO - Cotizador Bandas PT
================================================
Uso: python actualizar_inventario.py
  o: arrastra el archivo Excel encima de este script

Sube el nuevo archivo Excel de inventario y este script
actualiza automaticamente el cotizador_bandas.html
"""

import sys
import os
import json
import glob

try:
    import pandas as pd
except ImportError:
    print("Instalando pandas...")
    os.system(f"{sys.executable} -m pip install pandas openpyxl -q")
    import pandas as pd

# ── Configuracion ─────────────────────────────────────────────────────────────
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
HTML_FILE    = os.path.join(SCRIPT_DIR, "cotizador_bandas.html")
BACKUP_DIR   = os.path.join(SCRIPT_DIR, "backups_inventario")

# ── Buscar el archivo Excel ───────────────────────────────────────────────────
def encontrar_excel(arg=None):
    if arg and os.path.isfile(arg):
        return arg
    # Buscar en la misma carpeta
    xls = glob.glob(os.path.join(SCRIPT_DIR, "INVENTARIO*.xlsx"))
    xls += glob.glob(os.path.join(SCRIPT_DIR, "inventario*.xlsx"))
    xls += glob.glob(os.path.join(SCRIPT_DIR, "*.xlsx"))
    if xls:
        # El mas reciente
        return sorted(xls, key=os.path.getmtime, reverse=True)[0]
    # Buscar en Descargas
    downloads = os.path.join(os.path.expanduser("~"), "Downloads")
    xls = glob.glob(os.path.join(downloads, "INVENTARIO*.xlsx"))
    xls += glob.glob(os.path.join(downloads, "inventario*.xlsx"))
    if xls:
        return sorted(xls, key=os.path.getmtime, reverse=True)[0]
    return None

# ── Leer Excel de inventario ──────────────────────────────────────────────────
def leer_inventario(path):
    print(f"  Leyendo: {os.path.basename(path)}")
    df = pd.read_excel(path)

    # Detectar columnas (flexible por si cambia el formato)
    cols = [c.strip().upper() for c in df.columns]
    col_map = {}
    for i, c in enumerate(cols):
        if "ARTICULO" in c or "CODIGO" in c or "CODE" in c:
            col_map["codigo"] = df.columns[i]
        if "DISPONIBLE" in c or "STOCK" in c or "EXISTENCIA" in c or "QTY" in c:
            col_map["stock"] = df.columns[i]

    if "codigo" not in col_map or "stock" not in col_map:
        print(f"  Columnas detectadas: {list(df.columns)}")
        raise ValueError("No se encontraron columnas ARTICULO y DISPONIBLE en el Excel")

    # Normalizar unidades si existe la columna
    df["_codigo"] = df[col_map["codigo"]].astype(str).str.strip()
    df["_stock"]  = pd.to_numeric(df[col_map["stock"]], errors="coerce").fillna(0)

    # Consolidar por codigo (sumar almacenes)
    inv = df.groupby("_codigo")["_stock"].sum()

    # Solo items con stock > 0
    inv = inv[inv > 0]
    result = {k: round(float(v), 2) for k, v in inv.items()}
    print(f"  Items con stock > 0: {len(result)}")
    return result

# ── Extraer catalogo del HTML ─────────────────────────────────────────────────
def extraer_cat_codes(html):
    import re
    return set(re.findall(r'"c":"([^"]+)"', html))

# ── Inyectar inventario en HTML ───────────────────────────────────────────────
def inyectar(html, inv_dict, cat_codes):
    import re

    # Filtrar solo items del catalogo
    inv_filtrado = {k: v for k, v in inv_dict.items() if k in cat_codes}
    print(f"  Coincidencias con catalogo: {len(inv_filtrado)}")

    inv_json = json.dumps(inv_filtrado, ensure_ascii=False, separators=(",", ":"))

    # Reemplazar el bloque INV={...} dentro del script de datos
    # Patron: const INV={...};
    nuevo, n = re.subn(
        r'(const INV=)\{[^;]*\}(;)',
        lambda m: m.group(1) + inv_json + m.group(2),
        html,
        count=1
    )
    if n == 0:
        raise ValueError("No se encontro 'const INV=' en el HTML. Verifica que sea cotizador_bandas.html")
    return nuevo

# ── Backup ────────────────────────────────────────────────────────────────────
def hacer_backup(html_path):
    from datetime import datetime
    os.makedirs(BACKUP_DIR, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = os.path.join(BACKUP_DIR, f"cotizador_bandas_bak_{ts}.html")
    with open(html_path, "r", encoding="utf-8") as f:
        contenido = f.read()
    with open(bak, "w", encoding="utf-8") as f:
        f.write(contenido)
    print(f"  Backup: {os.path.basename(bak)}")
    return contenido

# ── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    print("=" * 55)
    print("  ACTUALIZADOR DE INVENTARIO — Cotizador Bandas PT")
    print("=" * 55)

    # 1. Verificar que existe el HTML
    if not os.path.isfile(HTML_FILE):
        print(f"\n ERROR: No se encontro {HTML_FILE}")
        print("  Asegurate de que este script este en la misma")
        print("  carpeta que cotizador_bandas.html")
        input("\nPresiona Enter para salir...")
        return

    # 2. Encontrar Excel
    excel_arg = sys.argv[1] if len(sys.argv) > 1 else None
    excel_path = encontrar_excel(excel_arg)

    if not excel_path:
        print("\n No se encontro archivo Excel de inventario.")
        print("  Opciones:")
        print("  a) Arrastra el archivo Excel encima de este script")
        print("  b) Copia el Excel a esta carpeta y vuelve a ejecutar")
        ruta = input("\n  O escribe la ruta completa del Excel: ").strip().strip('"')
        if ruta and os.path.isfile(ruta):
            excel_path = ruta
        else:
            print("  Archivo no valido. Saliendo.")
            input("\nPresiona Enter para salir...")
            return

    print(f"\n[1/4] Excel encontrado:")
    print(f"  {excel_path}")

    # 3. Leer inventario
    print("\n[2/4] Leyendo inventario...")
    try:
        inv = leer_inventario(excel_path)
    except Exception as e:
        print(f"  ERROR al leer Excel: {e}")
        input("\nPresiona Enter para salir...")
        return

    # 4. Backup + inyectar
    print("\n[3/4] Haciendo backup y actualizando HTML...")
    try:
        html_original = hacer_backup(HTML_FILE)
        cat_codes = extraer_cat_codes(html_original)
        print(f"  Productos en catalogo: {len(cat_codes)}")

        html_nuevo = inyectar(html_original, inv, cat_codes)

        with open(HTML_FILE, "w", encoding="utf-8") as f:
            f.write(html_nuevo)
        print(f"  Archivo actualizado: {os.path.basename(HTML_FILE)}")
        print(f"  Tamano: {len(html_nuevo)//1024} KB")
    except Exception as e:
        print(f"  ERROR: {e}")
        input("\nPresiona Enter para salir...")
        return

    # 5. Listo
    print("\n[4/4] LISTO!")
    print("  El cotizador_bandas.html ya tiene el inventario actualizado.")
    print("  Vuelve a subir el HTML a Drive/Netlify para compartirlo.")
    print("=" * 55)
    input("\nPresiona Enter para cerrar...")

if __name__ == "__main__":
    main()
