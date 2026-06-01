initLayout('inventario');
document.getElementById('page-title').textContent = '📦 Inventario';
let paginaActual = 1; const LIMIT = 20;

document.getElementById('main-content').innerHTML = `
  <div class="page-header"><div><h2>Control de Inventario</h2><p>Movimientos y existencias físicas</p></div></div>

  <div style="display:flex;gap:6px;margin-bottom:20px;border-bottom:2px solid var(--gris-claro);">
    <button class="tab-btn active" onclick="mostrarTab('movimientos')" id="tab-mov">📜 Movimientos</button>
    <button class="tab-btn" onclick="mostrarTab('existencias')" id="tab-exist">🏥 Existencias Físicas</button>
  </div>

  <!-- Tab Movimientos -->
  <div id="content-movimientos">
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
        <div><label class="form-label" style="margin-bottom:5px;">Tipo</label>
          <select id="filtro-tipo" class="form-control" style="width:160px;" onchange="filtrar()">
            <option value="">Todos</option><option value="entrada">Entradas</option>
            <option value="salida">Salidas</option><option value="ajuste">Ajustes</option>
          </select></div>
        <div><label class="form-label" style="margin-bottom:5px;">Desde</label><input type="date" id="filtro-desde" class="form-control" style="width:155px;" onchange="filtrar()"></div>
        <div><label class="form-label" style="margin-bottom:5px;">Hasta</label><input type="date" id="filtro-hasta" class="form-control" style="width:155px;" onchange="filtrar()"></div>
        <button class="btn btn-secondary btn-sm" style="margin-top:20px;" onclick="limpiarFiltros()">✕ Limpiar</button>
      </div>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Stock Antes</th><th>Stock Después</th><th>Usuario</th><th>Descripción</th></tr></thead>
          <tbody id="tabla-inv"><tr class="loading-row"><td colspan="8"><div class="spinner"></div></td></tr></tbody>
        </table>
      </div>
      <div id="paginacion"></div>
      <div id="tabla-info" style="text-align:center;font-size:.8rem;color:var(--gris-texto);margin-top:10px;"></div>
    </div>
  </div>

  <!-- Tab Existencias Físicas -->
  <div id="content-existencias" style="display:none;">
    <div class="card" style="margin-bottom:16px;background:linear-gradient(135deg,var(--verde-oscuro),var(--verde-medio));color:white;border:none;">
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="font-size:2rem;">🏥</div>
        <div>
          <div style="font-family:'Merriweather Sans',sans-serif;font-size:1.1rem;font-weight:700;">Reporte de Existencias Físicas</div>
          <div style="font-size:.84rem;opacity:.8;">Usa esta tabla para comparar con tu conteo físico. El sistema muestra cuántas unidades deberías tener en la farmacia en este momento.</div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:16px;">
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
        <div class="search-bar" style="max-width:280px;"><span class="search-icon">🔍</span><input type="text" id="filtro-exist" placeholder="Buscar producto..." oninput="filtrarExistencias()"></div>
        <select id="filtro-cat-exist" class="form-control" style="width:180px;" onchange="filtrarExistencias()">
          <option value="">Todas las categorías</option>
        </select>
        <button class="btn btn-secondary btn-sm" onclick="imprimirExistencias()">🖨️ Imprimir</button>
      </div>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
        <div class="card-title" style="margin:0;">📋 Lista de Existencias en Sistema</div>
        <div style="font-size:.78rem;color:var(--gris-texto);">Generado: <strong id="fecha-generacion"></strong></div>
      </div>
      <div class="table-wrapper">
        <table id="tabla-existencias">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Cantidad en Sistema</th>
              <th>Stock Mínimo</th>
              <th>Estado</th>
              <th>Conteo Físico</th>
              <th>Diferencia</th>
            </tr>
          </thead>
          <tbody id="tbody-exist"><tr class="loading-row"><td colspan="8"><div class="spinner"></div></td></tr></tbody>
        </table>
      </div>
      <div id="exist-info" style="text-align:center;font-size:.8rem;color:var(--gris-texto);margin-top:10px;"></div>
    </div>
  </div>
`;

// Estilos tabs
const style = document.createElement('style');
style.textContent = `.tab-btn{padding:8px 16px;background:none;border:none;border-bottom:3px solid transparent;font-family:'Nunito',sans-serif;font-size:.875rem;font-weight:700;color:var(--gris-texto);cursor:pointer;transition:all .2s;margin-bottom:-2px;}.tab-btn.active,.tab-btn:hover{color:var(--verde-principal);border-bottom-color:var(--verde-principal);} @media print { .sidebar,.main-content>.topbar,.page-header,.card:not(.print-card) { display:none!important; } .print-area { display:block!important; } }`;
document.head.appendChild(style);

function mostrarTab(tab) {
  document.getElementById('content-movimientos').style.display = tab==='movimientos'?'block':'none';
  document.getElementById('content-existencias').style.display = tab==='existencias'?'block':'none';
  document.getElementById('tab-mov').classList.toggle('active', tab==='movimientos');
  document.getElementById('tab-exist').classList.toggle('active', tab==='existencias');
  if (tab==='existencias') cargarExistencias();
}

// ── MOVIMIENTOS ──────────────────────────────────────────
let todosExistencias = [];

async function cargarMovimientos() {
  const tipo  = document.getElementById('filtro-tipo').value;
  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;
  let url = `/reportes/inventario/movimientos?page=${paginaActual}&limit=${LIMIT}`;
  if (tipo)  url += `&tipo=${tipo}`;
  if (desde) url += `&fecha_inicio=${desde}`;
  if (hasta) url += `&fecha_fin=${hasta}`;
  document.getElementById('tabla-inv').innerHTML = '<tr class="loading-row"><td colspan="8"><div class="spinner"></div></td></tr>';
  const data = await get(url);
  if (!data?.ok) return;
  const { movimientos, total, total_pages } = data.data;
  document.getElementById('tabla-info').textContent = `Mostrando ${movimientos.length} de ${total} movimientos`;
  const tipoBadge = (t) => {
    if (t==='entrada') return '<span class="badge badge-verde">⬆️ Entrada</span>';
    if (t==='salida')  return '<span class="badge badge-rojo">⬇️ Salida</span>';
    return '<span class="badge badge-azul">🔄 Ajuste</span>';
  };
  document.getElementById('tabla-inv').innerHTML = movimientos.length === 0
    ? `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📦</div><p>No se encontraron movimientos</p></div></td></tr>`
    : movimientos.map(m => `<tr>
        <td style="font-size:.8rem;">${fmt.fechaHora(m.created_at)}</td>
        <td style="font-weight:700;">${m.producto_nombre}<br><span style="font-size:.72rem;color:var(--gris-texto);">${m.producto_codigo}</span></td>
        <td>${tipoBadge(m.tipo)}</td>
        <td style="font-weight:800;color:${m.tipo==='salida'?'var(--rojo)':'var(--verde-principal)'};">
          ${m.tipo==='salida'?'- ':'+ '} ${Math.abs(m.cantidad)}
        </td>
        <td style="color:var(--gris-texto);">${m.stock_antes}</td>
        <td style="font-weight:700;">${m.stock_despues}</td>
        <!-- FIX: mostrar nombre usuario, no solo línea vacía -->
        <td style="font-size:.82rem;color:var(--gris-texto);">
          ${m.usuario_nombre && m.usuario_nombre !== 'null' ? m.usuario_nombre : '<span style="color:var(--gris-borde)">—</span>'}
        </td>
        <td style="font-size:.82rem;color:var(--gris-texto);">${m.descripcion||'—'}</td>
      </tr>`).join('');
  renderPagination('paginacion', paginaActual, total_pages, 'cambiarPagina');
}

function cambiarPagina(p) { paginaActual=p; cargarMovimientos(); }
let ft; function filtrar() { clearTimeout(ft); ft=setTimeout(()=>{ paginaActual=1; cargarMovimientos(); },400); }
function limpiarFiltros() { ['filtro-tipo','filtro-desde','filtro-hasta'].forEach(id=>document.getElementById(id).value=''); paginaActual=1; cargarMovimientos(); }

// ── EXISTENCIAS FÍSICAS ──────────────────────────────────
async function cargarExistencias() {
  document.getElementById('fecha-generacion').textContent = new Date().toLocaleString('es-GT');
  const data = await get('/productos/?activo=true&limit=200');
  const cats = await get('/productos/catalogos/categorias');

  if (cats?.ok) {
    const sel = document.getElementById('filtro-cat-exist');
    sel.innerHTML = '<option value="">Todas las categorías</option>' + cats.data.map(c=>`<option value="${c.nombre}">${c.nombre}</option>`).join('');
  }

  if (!data?.ok) return;
  todosExistencias = data.data.productos;
  renderExistencias(todosExistencias);
}

function filtrarExistencias() {
  const q   = document.getElementById('filtro-exist').value.toLowerCase();
  const cat = document.getElementById('filtro-cat-exist').value;
  let lista = todosExistencias;
  if (q)   lista = lista.filter(p => p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q));
  if (cat) lista = lista.filter(p => p.categoria_nombre === cat);
  renderExistencias(lista);
}

function renderExistencias(lista) {
  document.getElementById('exist-info').textContent = `${lista.length} producto(s) en existencia`;
  document.getElementById('tbody-exist').innerHTML = lista.length === 0
    ? `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📦</div><p>No hay productos</p></div></td></tr>`
    : lista.map(p => `<tr>
        <td><code style="background:var(--gris-bg);padding:2px 6px;border-radius:4px;font-size:.78rem;">${p.codigo}</code></td>
        <td style="font-weight:700;">${p.nombre}</td>
        <td><span class="badge badge-azul">${p.categoria_nombre||'—'}</span></td>
        <td style="font-weight:800;font-size:1.05rem;color:${p.stock<p.stock_minimo?'var(--rojo)':'var(--verde-principal)'};">${p.stock}</td>
        <td style="color:var(--gris-texto);">${p.stock_minimo}</td>
        <td>${p.estado_stock==='agotado'?'<span class="badge badge-rojo">⚠️ Agotado</span>':p.estado_stock==='stock_bajo'?'<span class="badge badge-naranja">📉 Bajo</span>':'<span class="badge badge-verde">✅ OK</span>'}</td>
        <td><input type="number" min="0" placeholder="Conteo" style="width:90px;padding:5px 8px;border:2px solid var(--gris-borde);border-radius:6px;font-family:'Nunito',sans-serif;font-size:.84rem;font-weight:700;" oninput="calcularDiferencia(this,${p.stock})" id="conteo-${p.id}"></td>
        <td id="diff-${p.id}" style="font-weight:700;">—</td>
      </tr>`).join('');
}

function calcularDiferencia(input, stockSistema) {
  const conteo = parseInt(input.value);
  const prodId = input.id.replace('conteo-','');
  const diffEl = document.getElementById(`diff-${prodId}`);
  if (isNaN(conteo)) { diffEl.textContent='—'; diffEl.style.color=''; return; }
  const diff = conteo - stockSistema;
  diffEl.textContent = diff === 0 ? '✅ Igual' : diff > 0 ? `+${diff} sobrante` : `${diff} faltante`;
  diffEl.style.color = diff === 0 ? 'var(--verde-principal)' : diff > 0 ? 'var(--azul)' : 'var(--rojo)';
}

function imprimirExistencias() { window.print(); }

cargarMovimientos();
