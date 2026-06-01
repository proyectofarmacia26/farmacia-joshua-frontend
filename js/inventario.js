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
          <div style="font-size:.84rem;opacity:.8;">Compara el stock del sistema con tu conteo físico real.</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px;">
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
        <div class="search-bar" style="max-width:280px;"><span class="search-icon">🔍</span><input type="text" id="filtro-exist" placeholder="Buscar producto..." oninput="filtrarExistencias()"></div>
        <select id="filtro-cat-exist" class="form-control" style="width:180px;" onchange="filtrarExistencias()">
          <option value="">Todas las categorías</option>
        </select>
        <div style="margin-left:auto;display:flex;gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="imprimirExistencias()">🖨️ Imprimir</button>
          <button class="btn btn-primary btn-sm" onclick="exportarPDF()">📄 Guardar PDF</button>
        </div>
      </div>
    </div>

    <div class="card" id="card-existencias">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
        <div class="card-title" style="margin:0;">📋 Existencias en Sistema</div>
        <div style="font-size:.78rem;color:var(--gris-texto);">Generado: <strong id="fecha-generacion"></strong></div>
      </div>
      <div class="table-wrapper">
        <table id="tabla-existencias">
          <thead>
            <tr>
              <th>Código</th><th>Producto</th><th>Categoría</th>
              <th>Cant. Sistema</th><th>Stock Mínimo</th><th>Estado</th>
              <th>Conteo Físico</th><th>Diferencia</th>
            </tr>
          </thead>
          <tbody id="tbody-exist"><tr class="loading-row"><td colspan="8"><div class="spinner"></div></td></tr></tbody>
        </table>
      </div>
      <div id="exist-info" style="text-align:center;font-size:.8rem;color:var(--gris-texto);margin-top:10px;"></div>
    </div>
  </div>

  <!-- Ventana PDF (oculta, se muestra al exportar) -->
  <div id="panel-pdf" style="display:none;margin-top:20px;">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div class="card-title" style="margin:0;">📄 Vista Previa del Reporte</div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary btn-sm" onclick="imprimirDesdePanel()">🖨️ Imprimir / Guardar PDF</button>
          <button class="btn btn-secondary btn-sm" onclick="cerrarPanelPDF()">✕ Cerrar</button>
        </div>
      </div>
      <div id="contenido-pdf" style="background:white;border:1px solid var(--gris-claro);border-radius:8px;padding:32px;font-family:'Nunito',sans-serif;"></div>
    </div>
  </div>
`;

// Estilos tabs + estilos de impresión corregidos
const style = document.createElement('style');
style.textContent = `
  .tab-btn {
    padding:8px 16px;background:none;border:none;
    border-bottom:3px solid transparent;
    font-family:'Nunito',sans-serif;font-size:.875rem;font-weight:700;
    color:var(--gris-texto);cursor:pointer;transition:all .2s;margin-bottom:-2px;
  }
  .tab-btn.active, .tab-btn:hover {
    color:var(--verde-principal);border-bottom-color:var(--verde-principal);
  }

  /* ── Estilos del reporte PDF/impresión ── */
  .reporte-header {
    display:flex;justify-content:space-between;align-items:flex-start;
    margin-bottom:20px;padding-bottom:16px;
    border-bottom:3px solid #1a3a2a;
  }
  .reporte-header h1 { font-size:1.4rem;font-weight:700;color:#1a3a2a;margin:0 0 4px; }
  .reporte-header h1 span { color:#3a7d5a; }
  .reporte-header p { font-size:.8rem;color:#6b7c75;margin:2px 0; }
  .reporte-titulo { font-size:1rem;font-weight:700;color:#1a3a2a;margin:16px 0 12px;text-transform:uppercase;letter-spacing:.05em; }
  .reporte-meta { font-size:.78rem;color:#6b7c75;margin-bottom:16px; }

  .reporte-tabla { width:100%;border-collapse:collapse;font-size:.82rem;margin-bottom:16px; }
  .reporte-tabla thead tr { background:#1a3a2a;color:white; }
  .reporte-tabla thead th { padding:8px 10px;text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em; }
  .reporte-tabla tbody tr { border-bottom:1px solid #e8f0eb; }
  .reporte-tabla tbody tr:nth-child(even) { background:#f4f7f5; }
  .reporte-tabla tbody td { padding:7px 10px;color:#2d4a3a; }
  .reporte-tabla .badge-ok     { background:#d8f3dc;color:#2d6a4f;padding:2px 8px;border-radius:10px;font-size:.72rem;font-weight:700; }
  .reporte-tabla .badge-bajo   { background:#fff3e0;color:#c4580a;padding:2px 8px;border-radius:10px;font-size:.72rem;font-weight:700; }
  .reporte-tabla .badge-agotado{ background:#fde8e9;color:#e63946;padding:2px 8px;border-radius:10px;font-size:.72rem;font-weight:700; }

  .reporte-footer { margin-top:20px;padding-top:14px;border-top:2px dashed #c8ddd0;font-size:.76rem;color:#6b7c75;text-align:center; }
  .reporte-resumen { display:flex;gap:20px;margin-bottom:16px;flex-wrap:wrap; }
  .reporte-resumen-item { background:#f4f7f5;border-radius:8px;padding:10px 16px;min-width:120px; }
  .reporte-resumen-item .rlabel { font-size:.72rem;color:#6b7c75;font-weight:700;text-transform:uppercase; }
  .reporte-resumen-item .rvalue { font-size:1.2rem;font-weight:800;color:#1a2e23;margin-top:2px; }
  .reporte-resumen-item .rvalue.rojo  { color:#e63946; }
  .reporte-resumen-item .rvalue.verde { color:#3a7d5a; }

  @media print {
    /* Ocultar todo el layout */
    .sidebar,
    .topbar,
    .page-header,
    #content-movimientos,
    #content-existencias .card:first-child,
    #content-existencias .card:nth-child(2),
    #content-existencias #card-existencias,
    .tab-btn,
    div[style*="border-bottom:2px solid"],
    div[style*="border-bottom: 2px solid"] {
      display: none !important;
    }

    /* Mostrar solo el panel PDF */
    .main-content { margin-left: 0 !important; }
    .page-content { padding: 0 !important; }
    #panel-pdf { display: block !important; }
    #panel-pdf > .card { box-shadow: none !important; border: none !important; padding: 0 !important; }
    #panel-pdf > .card > div:first-child { display: none !important; }
    #contenido-pdf { border: none !important; padding: 0 !important; }

    /* Estilos del reporte en impresión */
    body { background: white !important; }
    .reporte-tabla thead tr { background: #1a3a2a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .reporte-tabla tbody tr:nth-child(even) { background: #f4f7f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .badge-ok, .badge-bajo, .badge-agotado { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;
document.head.appendChild(style);

function mostrarTab(tab) {
  document.getElementById('content-movimientos').style.display = tab==='movimientos'?'block':'none';
  document.getElementById('content-existencias').style.display = tab==='existencias'?'block':'none';
  document.getElementById('panel-pdf').style.display = 'none';
  document.getElementById('tab-mov').classList.toggle('active', tab==='movimientos');
  document.getElementById('tab-exist').classList.toggle('active', tab==='existencias');
  if (tab==='existencias') cargarExistencias();
}

// ── MOVIMIENTOS ──────────────────────────────────────────
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
        <td style="font-size:.82rem;color:var(--gris-texto);">
          ${m.usuario_nombre && m.usuario_nombre !== 'null' ? m.usuario_nombre : '—'}
        </td>
        <td style="font-size:.82rem;color:var(--gris-texto);">${m.descripcion||'—'}</td>
      </tr>`).join('');

  renderPagination('paginacion', paginaActual, total_pages, 'cambiarPagina');
}

function cambiarPagina(p) { paginaActual=p; cargarMovimientos(); }
let ft;
function filtrar() { clearTimeout(ft); ft=setTimeout(()=>{ paginaActual=1; cargarMovimientos(); },400); }
function limpiarFiltros() {
  ['filtro-tipo','filtro-desde','filtro-hasta'].forEach(id=>document.getElementById(id).value='');
  paginaActual=1; cargarMovimientos();
}

// ── EXISTENCIAS FÍSICAS ──────────────────────────────────
let todosExistencias = [];

async function cargarExistencias() {
  document.getElementById('fecha-generacion').textContent = new Date().toLocaleString('es-GT');
  const [data, cats] = await Promise.all([
    get('/productos/?activo=true&limit=200'),
    get('/productos/catalogos/categorias')
  ]);

  if (cats?.ok) {
    const sel = document.getElementById('filtro-cat-exist');
    sel.innerHTML = '<option value="">Todas las categorías</option>' +
      cats.data.map(c=>`<option value="${c.nombre}">${c.nombre}</option>`).join('');
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
  document.getElementById('exist-info').textContent = `${lista.length} producto(s)`;
  document.getElementById('tbody-exist').innerHTML = lista.length === 0
    ? `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📦</div><p>No hay productos</p></div></td></tr>`
    : lista.map(p => `<tr>
        <td><code style="background:var(--gris-bg);padding:2px 6px;border-radius:4px;font-size:.78rem;">${p.codigo}</code></td>
        <td style="font-weight:700;">${p.nombre}</td>
        <td><span class="badge badge-azul">${p.categoria_nombre||'—'}</span></td>
        <td style="font-weight:800;font-size:1.05rem;color:${p.stock<p.stock_minimo?'var(--rojo)':'var(--verde-principal)'};">${p.stock}</td>
        <td style="color:var(--gris-texto);">${p.stock_minimo}</td>
        <td>${p.estado_stock==='agotado'
          ? '<span class="badge badge-rojo">⚠️ Agotado</span>'
          : p.estado_stock==='stock_bajo'
            ? '<span class="badge badge-naranja">📉 Bajo</span>'
            : '<span class="badge badge-verde">✅ OK</span>'}
        </td>
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

// ── EXPORTAR / IMPRIMIR ──────────────────────────────────
function generarHTMLReporte() {
  const lista = todosExistencias;
  const fecha = new Date().toLocaleString('es-GT', {
    weekday:'long', day:'numeric', month:'long', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });

  const totalProductos = lista.length;
  const agotados   = lista.filter(p => p.estado_stock === 'agotado').length;
  const stockBajo  = lista.filter(p => p.estado_stock === 'stock_bajo').length;
  const stockOk    = lista.filter(p => p.estado_stock === 'ok').length;

  const filas = lista.map(p => {
    const badgeClass = p.estado_stock === 'agotado' ? 'badge-agotado' : p.estado_stock === 'stock_bajo' ? 'badge-bajo' : 'badge-ok';
    const badgeText  = p.estado_stock === 'agotado' ? 'Agotado' : p.estado_stock === 'stock_bajo' ? 'Stock Bajo' : 'OK';
    const conteoEl   = document.getElementById(`conteo-${p.id}`);
    const conteo     = conteoEl?.value || '';
    const diff       = conteo !== '' ? (parseInt(conteo) - p.stock) : '';
    const diffText   = diff === '' ? '—' : diff === 0 ? 'Igual' : diff > 0 ? `+${diff} sobrante` : `${diff} faltante`;
    const diffColor  = diff === '' ? '' : diff === 0 ? 'color:#3a7d5a' : diff > 0 ? 'color:#3a86ff' : 'color:#e63946';
    return `<tr>
      <td>${p.codigo}</td>
      <td><strong>${p.nombre}</strong></td>
      <td>${p.categoria_nombre || '—'}</td>
      <td style="font-weight:800;color:${p.stock < p.stock_minimo ? '#e63946' : '#3a7d5a'};">${p.stock}</td>
      <td>${p.stock_minimo}</td>
      <td><span class="${badgeClass}">${badgeText}</span></td>
      <td style="font-weight:700;">${conteo || '—'}</td>
      <td style="font-weight:700;${diffColor}">${diffText}</td>
    </tr>`;
  }).join('');

  return `
    <div class="reporte-header">
      <div>
        <h1>Farmacia <span>Joshua</span></h1>
        <p>San Martín Zapotitlán, Retalhuleu</p>
        <p>Tu salud, nuestra prioridad</p>
      </div>
      <div style="text-align:right;">
        <div class="reporte-titulo" style="margin:0 0 6px;">Reporte de Existencias Físicas</div>
        <p style="font-size:.78rem;color:#6b7c75;">Generado: ${fecha}</p>
      </div>
    </div>

    <div class="reporte-resumen">
      <div class="reporte-resumen-item">
        <div class="rlabel">Total Productos</div>
        <div class="rvalue">${totalProductos}</div>
      </div>
      <div class="reporte-resumen-item">
        <div class="rlabel">Stock OK</div>
        <div class="rvalue verde">${stockOk}</div>
      </div>
      <div class="reporte-resumen-item">
        <div class="rlabel">Stock Bajo</div>
        <div class="rvalue rojo">${stockBajo}</div>
      </div>
      <div class="reporte-resumen-item">
        <div class="rlabel">Agotados</div>
        <div class="rvalue rojo">${agotados}</div>
      </div>
    </div>

    <table class="reporte-tabla">
      <thead>
        <tr>
          <th>Código</th><th>Producto</th><th>Categoría</th>
          <th>Cant. Sistema</th><th>Stock Mín.</th><th>Estado</th>
          <th>Conteo Físico</th><th>Diferencia</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>

    <div class="reporte-footer">
      <p>Farmacia Joshua · Sistema de Gestión v1.0 · ${fecha}</p>
      <p>Este reporte fue generado automáticamente por el sistema.</p>
    </div>
  `;
}

function exportarPDF() {
  if (todosExistencias.length === 0) {
    toast('Primero carga las existencias.', 'warning'); return;
  }
  const html = generarHTMLReporte();
  document.getElementById('contenido-pdf').innerHTML = html;
  document.getElementById('panel-pdf').style.display = 'block';
  document.getElementById('panel-pdf').scrollIntoView({ behavior: 'smooth', block: 'start' });
  toast('✅ Vista previa lista. Presiona "Imprimir / Guardar PDF".', 'success', 4000);
}

function imprimirDesdePanel() {
  // Asegurarse que el panel tiene contenido antes de imprimir
  const contenido = document.getElementById('contenido-pdf').innerHTML;
  if (!contenido) { exportarPDF(); setTimeout(() => window.print(), 600); return; }
  window.print();
}

function cerrarPanelPDF() {
  document.getElementById('panel-pdf').style.display = 'none';
}

function imprimirExistencias() {
  if (todosExistencias.length === 0) {
    toast('Primero carga las existencias.', 'warning'); return;
  }
  // Generar reporte, mostrarlo y luego imprimir
  const html = generarHTMLReporte();
  document.getElementById('contenido-pdf').innerHTML = html;
  document.getElementById('panel-pdf').style.display = 'block';
  // Pequeña pausa para que el DOM se actualice antes de imprimir
  setTimeout(() => window.print(), 400);
}

cargarMovimientos();
