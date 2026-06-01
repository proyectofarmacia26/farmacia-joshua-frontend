initLayout('clientes');
document.getElementById('page-title').textContent = '👥 Clientes';
let paginaActual = 1; const LIMIT = 15;

document.getElementById('main-content').innerHTML = `
  <div class="page-header">
    <div><h2>Gestión de Clientes</h2><p>Administra el directorio de clientes</p></div>
    <button class="btn btn-primary" onclick="abrirModal()">➕ Nuevo Cliente</button>
  </div>
  <div class="card" style="margin-bottom:20px;">
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
      <div class="search-bar"><span class="search-icon">🔍</span><input type="text" id="filtro-q" placeholder="Buscar por nombre, teléfono..." oninput="filtrar()"></div>
      <button class="btn btn-secondary btn-sm" onclick="limpiarFiltros()">✕ Limpiar</button>
    </div>
  </div>
  <div class="card">
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th>Dirección</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody id="tabla-clientes"><tr class="loading-row"><td colspan="6"><div class="spinner"></div></td></tr></tbody>
      </table>
    </div>
    <div id="paginacion"></div>
  </div>
  <!-- Modal -->
  <div class="modal-overlay" id="modal-cliente">
    <div class="modal"><div class="modal-header"><h3 id="modal-titulo">Nuevo Cliente</h3><button class="btn-close-modal" onclick="cerrarModal()">✕</button></div>
    <div class="modal-body">
      <input type="hidden" id="cli-id">
      <div class="form-group"><label class="form-label">Nombre *</label><input type="text" id="cli-nombre" class="form-control" placeholder="Nombre completo"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Teléfono</label><input type="text" id="cli-telefono" class="form-control" placeholder="5555-0000"></div>
        <div class="form-group"><label class="form-label">Email</label><input type="email" id="cli-email" class="form-control" placeholder="correo@ejemplo.com"></div>
      </div>
      <div class="form-group"><label class="form-label">Dirección</label><textarea id="cli-direccion" class="form-control" rows="2" placeholder="Dirección del cliente"></textarea></div>
    </div>
    <div class="modal-footer"><button class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button><button class="btn btn-primary" onclick="guardar()">💾 Guardar</button></div>
    </div>
  </div>
`;

async function cargarClientes() {
  const q = document.getElementById('filtro-q').value.trim();
  let url = `/clientes/?page=${paginaActual}&limit=${LIMIT}`;
  if (q) url += `&q=${encodeURIComponent(q)}`;
  const data = await get(url);
  if (!data?.ok) return;
  const { clientes, total, total_pages } = data.data;
  document.getElementById('tabla-clientes').innerHTML = clientes.length === 0
    ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">👥</div><p>No se encontraron clientes</p></div></td></tr>`
    : clientes.map(c => `<tr>
        <td style="font-weight:700;">${c.nombre}</td>
        <td>${c.telefono || '—'}</td>
        <td>${c.email || '—'}</td>
        <td style="font-size:.8rem;color:var(--gris-texto);">${c.direccion || '—'}</td>
        <td>${c.activo ? '<span class="badge badge-verde">Activo</span>' : '<span class="badge badge-gris">Inactivo</span>'}</td>
        <td><div style="display:flex;gap:6px;">
          <button class="btn btn-secondary btn-sm" onclick='editar(${JSON.stringify(c).replace(/"/g,"&quot;")})'>✏️</button>
          ${Auth.isAdmin() ? `<button class="btn btn-danger btn-sm" onclick="eliminar('${c.id}','${c.nombre.replace(/'/g,"\\'")}')">🗑️</button>` : ''}
        </div></td>
      </tr>`).join('');
  renderPagination('paginacion', paginaActual, total_pages, 'cambiarPagina');
}

function cambiarPagina(p) { paginaActual = p; cargarClientes(); }
let ft; function filtrar() { clearTimeout(ft); ft = setTimeout(() => { paginaActual=1; cargarClientes(); }, 400); }
function limpiarFiltros() { document.getElementById('filtro-q').value=''; paginaActual=1; cargarClientes(); }

function abrirModal() {
  document.getElementById('modal-titulo').textContent = 'Nuevo Cliente';
  document.getElementById('cli-id').value = '';
  ['cli-nombre','cli-telefono','cli-email','cli-direccion'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('modal-cliente').classList.add('active');
}

function editar(c) {
  document.getElementById('modal-titulo').textContent = 'Editar Cliente';
  document.getElementById('cli-id').value = c.id;
  document.getElementById('cli-nombre').value = c.nombre;
  document.getElementById('cli-telefono').value = c.telefono || '';
  document.getElementById('cli-email').value = c.email || '';
  document.getElementById('cli-direccion').value = c.direccion || '';
  document.getElementById('modal-cliente').classList.add('active');
}

function cerrarModal() { document.getElementById('modal-cliente').classList.remove('active'); }

async function guardar() {
  const id = document.getElementById('cli-id').value;
  const body = { nombre: document.getElementById('cli-nombre').value.trim(), telefono: document.getElementById('cli-telefono').value.trim()||null, email: document.getElementById('cli-email').value.trim()||null, direccion: document.getElementById('cli-direccion').value.trim()||null };
  if (!body.nombre) { toast('El nombre es requerido.', 'warning'); return; }
  const data = id ? await put(`/clientes/${id}`, body) : await post('/clientes/', body);
  if (data?.ok) { toast(id ? 'Cliente actualizado.' : 'Cliente creado.'); cerrarModal(); cargarClientes(); }
  else toast(data?.message || 'Error.', 'error');
}

async function eliminar(id, nombre) {
  if (!confirmar(`¿Desactivar al cliente "${nombre}"?`)) return;
  const data = await del(`/clientes/${id}`);
  if (data?.ok) { toast('Cliente desactivado.'); cargarClientes(); }
  else toast(data?.message || 'Error.', 'error');
}

cargarClientes();
