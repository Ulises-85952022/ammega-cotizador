import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

files = {
    'bandas':    ('E:/ESCRITORIO/Nueva carpeta/cotizador_v4_tpl.html',    'it.descFinal'),
    'mangueras': ('E:/ESCRITORIO/Nueva carpeta/MANGUERAS/cotizador_mangueras_tpl.html', 'it.d'),
}

ENTREGA_FUNC = """
function entregaTextoItem(code,qty){
  const s=INV[code];
  if(s==null)return{txt:"?",color:"#888"};
  if(s>=qty)return{txt:"24-48h",color:"#166534"};
  return{txt:"8-12s*",color:"#9a3412"};
}"""

TH_NEW = '<th style="padding:4px 6px;border:1px solid #ccc;text-align:center;width:60px">Entrega</th>'

for key,(path,desc_field) in files.items():
    with open(path,'r',encoding='utf-8') as f:
        c = f.read()

    # 1. Add entregaTextoItem function if missing
    if 'entregaTextoItem' not in c:
        c = c.replace('function entregaBadge(', ENTREGA_FUNC.strip()+'\nfunction entregaBadge(', 1)
        print(key+': added entregaTextoItem')

    # 2. Add TH after descripcion header
    desc_th = '<th style="padding:4px 6px;border:1px solid #ccc;text-align:left">Descripci\u00f3n</th>'
    if desc_th in c and TH_NEW not in c:
        c = c.replace(desc_th, desc_th+'\n          '+TH_NEW, 1)
        print(key+': added Entrega TH')

    # 3. Convert rows map to block body to inject _et variable
    OLD_MAP = 'const rows=items.map((it,i)=>`'
    NEW_MAP = 'const rows=items.map((it,i)=>{const _et=entregaTextoItem(it.c,it.totalQty);return`'
    if OLD_MAP in c and NEW_MAP not in c:
        c = c.replace(OLD_MAP, NEW_MAP, 1)
        # Close block - find the backtick+).join after last </tr>
        c = c.replace('</tr>`).join(\'\');\n  const padRows', '</tr>`}).join(\'\');\n  const padRows', 1)
        print(key+': converted map to block')

    # 4. Inject <td> after description td
    desc_td  = '<td style="padding:4px 6px;border:1px solid #e0e0e0">${'+ desc_field +'}</td>'
    ent_td   = '<td style="padding:4px 6px;border:1px solid #e0e0e0;text-align:center;font-size:9px;font-weight:700;color:${_et.color}">${_et.txt}</td>'
    qty_td   = '<td style="padding:4px 6px;border:1px solid #e0e0e0;text-align:center">${it.totalQty}'
    if desc_td in c and ent_td not in c:
        c = c.replace(desc_td+'\n      '+qty_td, desc_td+'\n      '+ent_td+'\n      '+qty_td, 1)
        print(key+': injected entrega TD')

    # 5. Fix colspan 6->7
    c = c.replace('colspan="6" style="border:1px solid #e0e0e0"', 'colspan="7" style="border:1px solid #e0e0e0"')
    print(key+': fixed colspan')

    with open(path,'w',encoding='utf-8') as f:
        f.write(c)
    print(key+': saved\n')

print('ALL DONE')
