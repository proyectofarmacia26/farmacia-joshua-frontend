initLayout('proveedores');
document.getElementById('page-title').textContent = '🚚 Proveedores';
let paginaActual = 1; const LIMIT = 15;

document.getElementById('main-content').innerHTML = `
  <div class="page-header">
    <div><h2>Gestión de Proveedores</h2><p>Administra los proveedores de la farmacia</p></div>
    <button class="btn btn-primary" onclick="abrirModal()">➕ Nuevo Proveedor</button>
  </div>
  <div class="card" style="margin-bottom:20px;">
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <div class="search-bar"><span class="search-icon">🔍</span><input type="text" id="filtro-q" placeholder="Buscar proveedor..." oninput="filtrar()"></div>
      <button class="btn btn-secondary btn-sm" onclick="limpiarFiltros()">✕ Limpiar</button>
    </div>
  </div>
  <div class="card">
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Nombre</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody id="tabla-proveedores"><tr class="loading-row"><td colspan="6"><div class="spinner"></div></td></tr></tbody>
      </table>
    </div>
    <div id="paginacion"></div>
  </div>
  <div class="modal-overlay" id="modal-prov">
    <div class="modal"><div class="modal-header"><h3 id="modal-titulo">Nuevo Proveedor</h3><button class="btn-close-modal" onclick="cerrarModal()">✕</button></div>
    <div class="modal-body">
      <input type="hidden" id="prov-id">
      <div class="form-group"><label class="form-label">Nombre *</label><input type="text" id="prov-nombre" class="form-control"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Contacto</label><input type="text" id="prov-contacto" class="form-control"></div>
        <div class="form-group"><label class="form-label">Teléfono</label><input type="text" id="prov-telefono" class="form-control"></div>
      </div>
      <div class="form-group"><label class="form-label">Email</label><input type="email" id="prov-email" class="form-control"></div>
      <div class="form-group"><label class="form-label">Dirección</label><textarea id="prov-direccion" class="form-control" rows="2"></textarea></div>
    </div>
    <div class="modal-footer"><button class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button><button class="btn btn-primary" onclick="guardar()">💾 Guardar</button></div>
    </div>
  </div>
`;

async function cargarProveedores() {
  const q = document.getElementById('filtro-q').value.trim();
  const data = await get(`/proveedores/?page=${paginaActual}&limit=${LIMIT}${q?'&q='+encodeURIComponent(q):''}`);
  if (!data?.ok) return;
  const { proveedores, total, total_pages } = data.data;
  document.getElementById('tabla-proveedores').innerHTML = proveedores.length === 0
    ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🚚</div><p>No hay proveedores</p></div></td></tr>`
    : proveedores.map(p => `<tr>
        <td style="font-weight:700;">${p.nombre}</td><td>${p.contacto||'—'}</td>
        <td>${p.telefono||'—'}</td><td>${p.email||'—'}</td>
        <td>${p.activo?'<span class="badge badge-verde">Activo</span>':'<span class="badge badge-gris">Inactivo</span>'}</td>
        <td><div style="display:flex;gap:6px;">
          <button class="btn btn-secondary btn-sm" onclick='editar(${JSON.stringify(p).replace(/"/g,"&quot;")})'>✏️</button>
          ${Auth.isAdmin()?`<button class="btn btn-danger btn-sm" onclick="eliminar('${p.id}','${p.nombre.replace(/'/g,"\\'")}')">🗑️</button>`:''}
        </div></td>
      </tr>`).join('');
  renderPagination('paginacion', paginaActual, total_pages, 'cambiarPagina');
}

function cambiarPagina(p){paginaActual=p;cargarProveedores();}
let ft; function filtrar(){clearTimeout(ft);ft=setTimeout(()=>{paginaActual=1;cargarProveedores();},400);}
function limpiarFiltros(){document.getElementById('filtro-q').value='';paginaActual=1;cargarProveedores();}
function abrirModal(){document.getElementById('modal-titulo').textContent='Nuevo Proveedor';document.getElementById('prov-id').value='';['prov-nombre','prov-contacto','prov-telefono','prov-email','prov-direccion'].forEach(id=>document.getElementById(id).value='');document.getElementById('modal-prov').classList.add('active');}
function editar(p){document.getElementById('modal-titulo').textContent='Editar Proveedor';document.getElementById('prov-id').value=p.id;document.getElementById('prov-nombre').value=p.nombre;document.getElementById('prov-contacto').value=p.contacto||'';document.getElementById('prov-telefono').value=p.telefono||'';document.getElementById('prov-email').value=p.email||'';document.getElementById('prov-direccion').value=p.direccion||'';document.getElementById('modal-prov').classList.add('active');}
function cerrarModal(){document.getElementById('modal-prov').classList.remove('active');}
async function guardar(){const id=document.getElementById('prov-id').value;const body={nombre:document.getElementById('prov-nombre').value.trim(),contacto:document.getElementById('prov-contacto').value.trim()||null,telefono:document.getElementById('prov-telefono').value.trim()||null,email:document.getElementById('prov-email').value.trim()||null,direccion:document.getElementById('prov-direccion').value.trim()||null};if(!body.nombre){toast('El nombre es requerido.','warning');return;}const data=id?await put(`/proveedores/${id}`,body):await post('/proveedores/',body);if(data?.ok){toast(id?'Proveedor actualizado.':'Proveedor creado.');cerrarModal();cargarProveedores();}else toast(data?.message||'Error.','error');}
async function eliminar(id,nombre){if(!confirmar(`¿Desactivar al proveedor "${nombre}"?`))return;const data=await del(`/proveedores/${id}`);if(data?.ok){toast('Proveedor desactivado.');cargarProveedores();}else toast(data?.message||'Error.','error');}
cargarProveedores();
