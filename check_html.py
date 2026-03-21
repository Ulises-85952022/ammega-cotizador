import sys, json, re
sys.stdout.reconfigure(encoding='utf-8')

with open(r'E:\ESCRITORIO\Nueva carpeta\MANGUERAS\cotizador_mangueras.html','r',encoding='utf-8') as f:
    html = f.read()

lines = html.split('\n')

# Check CAT
line196 = lines[195].replace('const RAW_CAT=','').rstrip(';')
try:
    cat = json.loads(line196)
    print(f'OK: RAW_CAT valido, {len(cat)} items')
except Exception as e:
    print(f'ERROR RAW_CAT: {e}')
    print('  Inicio:', line196[:120])

# Check INV
line197 = lines[196].replace('const INV=','').rstrip(';')
try:
    inv = json.loads(line197)
    print(f'OK: INV valido, {len(inv)} items')
except Exception as e:
    print(f'ERROR INV: {e}')

# Check xref
line198 = lines[197].replace('const GATES_XREF=','').rstrip(';')
try:
    xref = json.loads(line198)
    print(f'OK: GATES_XREF valido, {len(xref)} items')
    bad = [(k,v['g']) for k,v in xref.items() if '`' in v.get('g','') or '${' in v.get('g','')]
    if bad:
        print(f'  WARN backtick en {len(bad)} valores:', bad[:3])
    else:
        print('  OK: sin backticks en valores')
except Exception as e:
    print(f'ERROR GATES_XREF: {e}')
    print('  Inicio:', line198[:120])

# Check gatesBadgeHTML function structure
fn_start = html.find('function gatesBadgeHTML')
if fn_start >= 0:
    fn_code = html[fn_start:fn_start+200]
    print(f'\nfgatesBadgeHTML:\n{fn_code}')

print('\nDone.')
