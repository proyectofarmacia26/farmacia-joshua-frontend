initLayout('alertas');
document.getElementById('page-title').textContent = '🔔 Alertas del Sistema';

document.getElementById('main-content').innerHTML = `
  <div class="page-header">
    <div><h2>Alertas del Sistema</h2><p>Stock bajo, vencimientos próximos y productos vencidos</p></div>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-secondary" onclick="revisarVencimientos()">🔄 Revisar Vencimientos</button>
      <button class="btn btn-primary" onclick="atenderTodas()">✅ Atender Todas</button>
    </div>
  </div>

  <!-- Resumen badges -->
  <div class="kpi-grid" style="margin-bottom:24px;">
    <div class="kpi-card"><div class="kpi-icon rojo">⚠️</div><div class="kpi-body"><div class="kpi-label">Vencidos</div><div class="kpi-value" id="cnt-vencido">—</div></div></div>
    <div class="kpi-card"><div class="kpi-icon naranja">📉</div><div class="kpi-body"><div class="kpi-label">Stock Bajo</div><div class="kpi-value" id="cnt-stock">—</div></div></div>
    <div class="kpi-card"><div class="kpi-icon naranja">📅</div><div class="kpi-body"><div class="kpi-label">Próximos a Vencer</div><div class="kpi-value" id="cnt-prox">—</div></div></div>
    <div class="kpi-card"><div class="kpi-icon verde">✅</div><div class="kpi-body"><div class="kpi-label">Total Activas</div><div class="kpi-value" id="cnt-total">—</div></div></div>
  </div>

  <!-- Filtros -->
  <div class="card" style="margin-bottom:20px;">
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
      <select id="filtro-tipo" class="form-control" style="width:200px;" onchange="cargarAlertas()">
        <option value="">Todos los tipos</option>
        <option value="vencido">Vencidos</option>
        <option value="stock_bajo">Stock Bajo</option>
        <option value="proximo_vencer">Próximos a Vencer</option>
      </select>
      <select id="filtro-atendida" class="form-control" style="width:180px;" onchange="cargarAlertas()">
        <option value="false">Pendientes</option>
        <option value="true">Atendidas</option>
        <option value="all">Todas</option>
      </select>
    </div>
  </div>

  <div class="card">
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Tipo</th><th>Producto</th><th>Mensaje</th><th>Stock</th><th>Vencimiento</th><th>Fecha Alerta</th><th>Acciones</th></tr></thead>
        <tbody id="tabla-alertas"><tr class="loading-row"><td colspan="7"><div class="spinner"></div></td></tr></tbody>
      </table>
    </div>
  </div>
`;

async function cargarResumen() {
  const data = await get('/alertas/resumen');
  if (!data?.ok) return;
  const d = data.data;
  document.getElementById('cnt-vencido').textContent = d.vencido;
  document.getElementById('cnt-stock').textContent   = d.stock_bajo;
  document.getElementById('cnt-prox').textContent    = d.proximo_vencer;
  document.getElementById('cnt-total').textContent   = d.total;
}

async function cargarAlertas() {
  const tipo     = document.getElementById('filtro-tipo').value;
  const atendida = document.getElementById('filtro-atendida').value;
  let url = `/alertas/?atendida=${atendida}`;
  if (tipo) url += `&tipo=${tipo}`;

  document.getElementById('tabla-alertas').innerHTML = '<tr class="loading-row"><td colspan="7"><div class="spinner"></div></td></tr>';
  const data = await get(url);
  if (!data?.ok) return;
  const alertas = data.data;

  const tipoBadge = (t) => {
    if (t === 'vencido')        return '<span class="badge badge-rojo">❌ Vencido</span>';
    if (t === 'stock_bajo')     return '<span class="badge badge-rojo">📉 Stock Bajo</span>';
    if (t === 'proximo_vencer') return '<span class="badge badge-naranja">⚠️ Próx. Vencer</span>';
    return t;
  };

  document.getElementById('tabla-alertas').innerHTML = alertas.length === 0
    ? `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">✅</div><p>Sin alertas en esta categoría</p></div></td></tr>`
    : alertas.map(a => `<tr>
        <td>${tipoBadge(a.tipo)}</td>
        <td style="font-weight:700;">${a.producto_nombre}</td>
        <td style="font-size:.82rem;color:var(--gris-texto);">${a.mensaje}</td>
        <td style="font-weight:700;color:${a.stock<a.stock_minimo?'var(--rojo)':'var(--texto-oscuro)'};">${a.stock}</td>
        <td style="font-size:.82rem;">${a.fecha_vencimiento ? fmt.fecha(a.fecha_vencimiento) : '—'}</td>
        <td style="font-size:.78rem;color:var(--gris-texto);">${fmt.fechaHora(a.created_at)}</td>
        <td>${!a.atendida ? `<button class="btn btn-secondary btn-sm" onclick="atender('${a.id}')">✅ Atender</button>` : '<span class="badge badge-verde">Atendida</span>'}</td>
      </tr>`).join('');
}

async function atender(id) {
  const data = await put(`/alertas/${id}/atender`);
  if (data?.ok) { toast('Alerta atendida.'); cargarAlertas(); cargarResumen(); }
  else toast(data?.message || 'Error.', 'error');
}

async function atenderTodas() {
  if (!confirmar('¿Marcar todas las alertas pendientes como atendidas?')) return;
  const data = await put('/alertas/atender-todas');
  if (data?.ok) { toast('Todas las alertas atendidas.'); cargarAlertas(); cargarResumen(); }
  else toast(data?.message || 'Error.', 'error');
}

async function revisarVencimientos() {
  const data = await post('/alertas/revisar-vencimientos');
  if (data?.ok) { toast(data.message || 'Revisión completada.'); cargarAlertas(); cargarResumen(); }
  else toast(data?.message || 'Error.', 'error');
}

// Al cargar alertas, primero revisar vencimientos para que aparezcan actualizadas
(async () => {
  await post('/alertas/revisar-vencimientos');
  cargarResumen();
  cargarAlertas();
})();
