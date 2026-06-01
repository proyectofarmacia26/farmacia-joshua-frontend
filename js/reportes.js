initLayout('reportes');
document.getElementById('page-title').textContent = '📊 Reportes';

document.getElementById('main-content').innerHTML = `
  <div class="page-header"><div><h2>Reportes del Sistema</h2><p>Análisis de ventas e inventario</p></div></div>
  <div style="display:flex;gap:6px;margin-bottom:20px;border-bottom:2px solid var(--gris-claro);">
    <button class="tab-btn active" onclick="mostrarTab('ventas-dia')"  id="tab-ventas-dia">📅 Ventas del Día</button>
    <button class="tab-btn"        onclick="mostrarTab('ventas-mes')"  id="tab-ventas-mes">📆 Ventas Mensuales</button>
    <button class="tab-btn"        onclick="mostrarTab('top-prods')"   id="tab-top-prods">🏆 Más Vendidos</button>
    <button class="tab-btn"        onclick="mostrarTab('inventario-rep')" id="tab-inventario-rep">📦 Inventario</button>
  </div>
  <div id="tab-content-ventas-dia"></div>
  <div id="tab-content-ventas-mes"     style="display:none;"></div>
  <div id="tab-content-top-prods"      style="display:none;"></div>
  <div id="tab-content-inventario-rep" style="display:none;"></div>
`;

const style = document.createElement('style');
style.textContent = `.tab-btn{padding:8px 16px;background:none;border:none;border-bottom:3px solid transparent;font-family:'Nunito',sans-serif;font-size:.875rem;font-weight:700;color:var(--gris-texto);cursor:pointer;transition:all .2s;margin-bottom:-2px;}.tab-btn.active,.tab-btn:hover{color:var(--verde-principal);border-bottom-color:var(--verde-principal);}`;
document.head.appendChild(style);

function mostrarTab(id) {
  ['ventas-dia','ventas-mes','top-prods','inventario-rep'].forEach(t => {
    document.getElementById(`tab-content-${t}`).style.display = t === id ? 'block' : 'none';
    document.getElementById(`tab-${t}`).classList.toggle('active', t === id);
  });
  if (id === 'ventas-dia')      cargarVentasDia();
  if (id === 'ventas-mes')      cargarVentasMes();
  if (id === 'top-prods')       cargarTopProductos();
  if (id === 'inventario-rep')  cargarInventarioRep();
}

// ── Ventas del día ───────────────────────────────────────
async function cargarVentasDia() {
  const el  = document.getElementById('tab-content-ventas-dia');
  const hoy = new Date().toISOString().split('T')[0];
  el.innerHTML = `
    <div class="card" style="margin-bottom:16px;">
      <div style="display:flex;gap:12px;align-items:center;">
        <label class="form-label" style="margin:0;white-space:nowrap;">Seleccionar fecha:</label>
        <input type="date" id="fecha-dia" class="form-control" style="width:180px;" value="${hoy}" onchange="cargarReporteDia(this.value)">
      </div>
    </div>
    <div id="reporte-dia-content"><div class="spinner"></div></div>
  `;
  cargarReporteDia(hoy);
}

async function cargarReporteDia(fecha) {
  const data = await get(`/reportes/ventas/diarias?fecha=${fecha}`);
  if (!data?.ok) return;
  const { resumen, ventas } = data.data;
  document.getElementById('reporte-dia-content').innerHTML = `
    <div class="kpi-grid" style="margin-bottom:20px;">
      <div class="kpi-card"><div class="kpi-icon verde">💰</div><div class="kpi-body"><div class="kpi-label">Ingresos</div><div class="kpi-value">${fmt.moneda(resumen.ingresos_totales)}</div></div></div>
      <div class="kpi-card"><div class="kpi-icon azul">🛒</div><div class="kpi-body"><div class="kpi-label">Ventas</div><div class="kpi-value">${resumen.num_ventas}</div></div></div>
      <div class="kpi-card"><div class="kpi-icon naranja">💸</div><div class="kpi-body"><div class="kpi-label">Descuentos</div><div class="kpi-value">${fmt.moneda(resumen.descuentos_totales)}</div></div></div>
      <div class="kpi-card"><div class="kpi-icon rojo">📊</div><div class="kpi-body"><div class="kpi-label">Ticket Promedio</div><div class="kpi-value">${fmt.moneda(resumen.ticket_promedio)}</div></div></div>
    </div>
    <div class="card"><div class="card-title">Detalle de ventas</div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Código</th><th>Fecha/Hora</th><th>Cliente</th><th>Cajero</th><th>Total</th><th>Pago</th><th>Estado</th></tr></thead>
        <tbody>${ventas.length === 0
          ? '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div><p>Sin ventas en esta fecha</p></div></td></tr>'
          : ventas.map(v => `<tr>
              <td><code style="font-size:.75rem;background:var(--gris-bg);padding:2px 6px;border-radius:4px">${v.codigo_venta}</code></td>
              <td style="font-size:.8rem;">${fmt.fechaHora(v.fecha_venta)}</td>
              <td style="font-weight:600;">${v.cliente_nombre}</td>
              <td style="font-size:.82rem;color:var(--gris-texto);">${v.cajero_nombre}</td>
              <td style="font-weight:700;color:var(--verde-principal)">${fmt.moneda(v.total)}</td>
              <td><span class="badge badge-azul" style="text-transform:capitalize">${v.forma_pago}</span></td>
              <td>${v.estado==='completada'?'<span class="badge badge-verde">✅ Completada</span>':'<span class="badge badge-rojo">❌ Anulada</span>'}</td>
            </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
  `;
}

// ── Ventas mensuales ─────────────────────────────────────
async function cargarVentasMes() {
  const el = document.getElementById('tab-content-ventas-mes');
  el.innerHTML = '<div class="spinner"></div>';
  const data = await get('/reportes/ventas/mensuales?meses=12');
  if (!data?.ok) return;
  el.innerHTML = `
    <div class="card">
      <div class="card-title">📆 Ventas por Mes — Últimos 12 meses</div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Mes</th><th>N° Ventas</th><th>Ingresos</th><th>Descuentos</th><th>Ticket Promedio</th></tr></thead>
        <tbody>${data.data.length === 0
          ? '<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📭</div><p>Sin datos</p></div></td></tr>'
          : data.data.map(r => `<tr>
              <td style="font-weight:700;">${r.mes}</td>
              <td>${r.num_ventas}</td>
              <td style="font-weight:700;color:var(--verde-principal)">${fmt.moneda(r.ingresos)}</td>
              <td style="color:var(--rojo)">${fmt.moneda(r.descuentos)}</td>
              <td>${fmt.moneda(r.ticket_promedio)}</td>
            </tr>`).join('')}
        </tbody>
      </table></div>
    </div>`;
}

// ── Top productos ─────────────────────────────────────────
async function cargarTopProductos() {
  const el = document.getElementById('tab-content-top-prods');
  el.innerHTML = `
    <div class="card" style="margin-bottom:16px;">
      <div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;">
        <div><label class="form-label">Desde</label><input type="date" id="top-desde" class="form-control" style="width:160px;"></div>
        <div><label class="form-label">Hasta</label><input type="date" id="top-hasta" class="form-control" style="width:160px;"></div>
        <button class="btn btn-primary btn-sm" onclick="cargarTopData()">🔍 Buscar</button>
      </div>
    </div>
    <div id="top-data"><div class="spinner"></div></div>
  `;
  cargarTopData();
}

async function cargarTopData() {
  const desde = document.getElementById('top-desde')?.value || '';
  const hasta = document.getElementById('top-hasta')?.value || '';
  let url = '/reportes/productos/mas-vendidos?limit=20';
  if (desde) url += `&fecha_inicio=${desde}`;
  if (hasta) url += `&fecha_fin=${hasta}`;
  const data = await get(url);
  if (!data?.ok) return;
  document.getElementById('top-data').innerHTML = `
    <div class="card">
      <div class="card-title">🏆 Productos Más Vendidos</div>
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>Código</th><th>Producto</th><th>Categoría</th><th>Unidades</th><th>Ingresos</th><th>N° Ventas</th></tr></thead>
        <tbody>${data.data.length === 0
          ? '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div><p>Sin datos en el período</p></div></td></tr>'
          : data.data.map((p,i) => `<tr>
              <td style="font-weight:800;color:var(--gris-texto);">${i+1}</td>
              <td><code style="font-size:.75rem;background:var(--gris-bg);padding:2px 6px;border-radius:4px">${p.codigo}</code></td>
              <td style="font-weight:700;">${p.nombre}</td>
              <td>${p.categoria||'—'}</td>
              <td style="font-weight:700;">${p.total_unidades}</td>
              <td style="font-weight:700;color:var(--verde-principal)">${fmt.moneda(p.total_ingresos)}</td>
              <td>${p.num_ventas}</td>
            </tr>`).join('')}
        </tbody>
      </table></div>
    </div>`;
}

// ── Inventario ────────────────────────────────────────────
async function cargarInventarioRep() {
  const el = document.getElementById('tab-content-inventario-rep');
  el.innerHTML = '<div class="spinner"></div>';

  const [bajoStock, vencimientos] = await Promise.all([
    get('/reportes/inventario/bajo-stock'),
    get('/reportes/inventario/vencimientos')
  ]);

  // Tabla stock bajo CON proveedor - datos vienen de v_productos_bajo_stock
  const filasStockBajo = !bajoStock?.ok || bajoStock.data.length === 0
    ? '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">✅</div><p>Todos los productos tienen stock suficiente</p></div></td></tr>'
    : bajoStock.data.map(p => `
        <tr>
          <td><code style="font-size:.75rem;background:var(--gris-bg);padding:2px 6px;border-radius:4px">${p.codigo}</code></td>
          <td style="font-weight:700;">${p.nombre}</td>
          <td style="font-weight:800;font-size:1rem;color:var(--rojo);">${p.stock}</td>
          <td>${p.stock_minimo}</td>
          <td style="color:var(--rojo);font-weight:700;">${p.unidades_faltantes}</td>
          <td style="font-weight:600;color:${p.proveedor_nombre ? 'var(--verde-medio)' : 'var(--gris-texto)'};">
            ${p.proveedor_nombre || '<span style="color:var(--gris-borde);font-style:italic;">Sin proveedor</span>'}
          </td>
          <td style="font-size:.82rem;color:var(--gris-texto);">
            ${p.proveedor_telefono || '—'}
          </td>
        </tr>`).join('');

  // Tabla vencimientos
  const filasVenc = !vencimientos?.ok || vencimientos.data.length === 0
    ? '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">✅</div><p>Sin productos próximos a vencer</p></div></td></tr>'
    : vencimientos.data.map(p => `
        <tr>
          <td><code style="font-size:.75rem;background:var(--gris-bg);padding:2px 6px;border-radius:4px">${p.codigo}</code></td>
          <td style="font-weight:700;">${p.nombre}</td>
          <td>${p.stock}</td>
          <td>${fmt.fecha(p.fecha_vencimiento)}</td>
          <td style="font-weight:700;color:${p.dias_restantes < 0 ? 'var(--rojo)' : p.dias_restantes < 15 ? 'var(--amarillo)' : 'var(--verde-principal)'};">
            ${p.dias_restantes < 0 ? 'VENCIDO' : p.dias_restantes + ' días'}
          </td>
          <td>${p.estado === 'VENCIDO'
            ? '<span class="badge badge-rojo">❌ Vencido</span>'
            : '<span class="badge badge-naranja">⚠️ Próximo</span>'}
          </td>
        </tr>`).join('');

  el.innerHTML = `
    <div class="card" style="margin-bottom:20px;">
      <div class="card-title">📉 Productos con Stock Bajo</div>
      <div class="table-wrapper"><table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Stock Actual</th>
            <th>Stock Mínimo</th>
            <th>Unidades Faltantes</th>
            <th>Proveedor</th>
            <th>Teléfono Proveedor</th>
          </tr>
        </thead>
        <tbody>${filasStockBajo}</tbody>
      </table></div>
    </div>

    <div class="card">
      <div class="card-title">📅 Productos Próximos a Vencer o Vencidos</div>
      <div class="table-wrapper"><table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Stock</th>
            <th>Fecha Vencimiento</th>
            <th>Días Restantes</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>${filasVenc}</tbody>
      </table></div>
    </div>
  `;
}

mostrarTab('ventas-dia');
