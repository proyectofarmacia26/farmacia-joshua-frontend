// configuracion.js
initLayout('configuracion');
document.getElementById('page-title').textContent = '⚙️ Configuración';

document.getElementById('main-content').innerHTML = `
  <div class="page-header">
    <div>
      <h2>Configuración del Sistema</h2>
      <p>Personaliza los datos de tu farmacia, recibo y alertas</p>
    </div>
  </div>

  <div class="spinner" id="config-spinner"></div>

  <div id="config-form" style="display:none;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">

      <!-- Columna izquierda -->
      <div class="card">
        <div class="card-title">🏥 Datos de la Farmacia</div>
        <div class="form-group">
          <label class="form-label">Nombre de la Farmacia</label>
          <input type="text" id="cfg-nombre" class="form-control" placeholder="Farmacia Joshua">
        </div>
        <div class="form-group">
          <label class="form-label">Slogan</label>
          <input type="text" id="cfg-slogan" class="form-control" placeholder="Tu salud, nuestra prioridad">
        </div>
        <div class="form-group">
          <label class="form-label">Dirección</label>
          <textarea id="cfg-direccion" class="form-control" rows="2" placeholder="San Martín Zapotitlán, Retalhuleu"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Teléfono</label>
          <input type="text" id="cfg-telefono" class="form-control" placeholder="(502) 0000-0000">
        </div>
        <div class="form-group">
          <label class="form-label">Correo Electrónico</label>
          <input type="email" id="cfg-email" class="form-control" placeholder="correo@farmaciajoshua.com">
        </div>
      </div>

      <!-- Columna derecha -->
      <div>
        <div class="card" style="margin-bottom:20px;">
          <div class="card-title">💰 Moneda</div>
          <div class="form-group">
            <label class="form-label">Símbolo de Moneda</label>
            <input type="text" id="cfg-moneda" class="form-control" maxlength="5" placeholder="Q">
          </div>
        </div>

        <div class="card" style="margin-bottom:20px;">
          <div class="card-title">📦 Alertas de Inventario</div>
          <div class="form-group">
            <label class="form-label">Días para alerta de vencimiento</label>
            <input type="number" id="cfg-dias-venc" class="form-control" min="1" placeholder="30">
            <small style="color:var(--gris-texto);font-size:.76rem;">Cuántos días antes del vencimiento se genera la alerta</small>
          </div>
          <div class="form-group">
            <label class="form-label">Stock mínimo por defecto</label>
            <input type="number" id="cfg-stock-min" class="form-control" min="0" placeholder="5">
            <small style="color:var(--gris-texto);font-size:.76rem;">Se aplica a productos nuevos que no tienen mínimo definido</small>
          </div>
        </div>

        <div class="card">
          <div class="card-title">🧾 Texto del Recibo</div>
          <div class="form-group">
            <label class="form-label">Política de cambios</label>
            <textarea id="cfg-politica" class="form-control" rows="3" placeholder="No se aceptan cambios ni devoluciones..."></textarea>
            <small style="color:var(--gris-texto);font-size:.76rem;">Este texto aparece al pie de cada recibo impreso</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón guardar abajo, bien visible -->
    <div style="display:flex;justify-content:flex-end;gap:12px;align-items:center;">
      <span id="cfg-estado" style="font-size:.84rem;color:var(--gris-texto);"></span>
      <button class="btn btn-secondary" onclick="cargarConfig()">↺ Recargar</button>
      <button class="btn btn-primary btn-lg" onclick="guardarConfig()" id="btn-guardar-cfg">
        💾 Guardar Cambios
      </button>
    </div>
  </div>
`;

async function cargarConfig() {
  document.getElementById('config-spinner').style.display = 'block';
  document.getElementById('config-form').style.display = 'none';

  const data = await get('/configuracion/');
  if (!data?.ok) {
    toast('Error al cargar la configuración.', 'error');
    return;
  }

  const c = data.data.config;
  document.getElementById('cfg-nombre').value    = c.farmacia_nombre    || '';
  document.getElementById('cfg-slogan').value    = c.farmacia_slogan    || '';
  document.getElementById('cfg-direccion').value = c.farmacia_direccion || '';
  document.getElementById('cfg-telefono').value  = c.farmacia_telefono  || '';
  document.getElementById('cfg-email').value     = c.farmacia_email     || '';
  document.getElementById('cfg-moneda').value    = c.moneda_simbolo     || 'Q';
  document.getElementById('cfg-dias-venc').value = c.dias_alerta_vencimiento || '30';
  document.getElementById('cfg-stock-min').value = c.stock_minimo_default    || '5';
  document.getElementById('cfg-politica').value  = c.politica_cambios   || '';

  document.getElementById('config-spinner').style.display = 'none';
  document.getElementById('config-form').style.display    = 'block';
  document.getElementById('cfg-estado').textContent = '✅ Configuración cargada';
  setTimeout(() => { document.getElementById('cfg-estado').textContent = ''; }, 2500);
}

async function guardarConfig() {
  const btn = document.getElementById('btn-guardar-cfg');
  const estadoEl = document.getElementById('cfg-estado');
  btn.disabled = true;
  btn.textContent = '⏳ Guardando...';
  estadoEl.textContent = '';

  const body = {
    farmacia_nombre:          document.getElementById('cfg-nombre').value.trim(),
    farmacia_slogan:          document.getElementById('cfg-slogan').value.trim(),
    farmacia_direccion:       document.getElementById('cfg-direccion').value.trim(),
    farmacia_telefono:        document.getElementById('cfg-telefono').value.trim(),
    farmacia_email:           document.getElementById('cfg-email').value.trim(),
    moneda_simbolo:           document.getElementById('cfg-moneda').value.trim(),
    dias_alerta_vencimiento:  document.getElementById('cfg-dias-venc').value,
    stock_minimo_default:     document.getElementById('cfg-stock-min').value,
    politica_cambios:         document.getElementById('cfg-politica').value.trim(),
  };

  const data = await put('/configuracion/', body);
  btn.disabled = false;
  btn.textContent = '💾 Guardar Cambios';

  if (data?.ok) {
    estadoEl.style.color = 'var(--verde-principal)';
    estadoEl.textContent = '✅ ¡Guardado correctamente!';
    toast('Configuración guardada correctamente.', 'success');
    setTimeout(() => { estadoEl.textContent = ''; }, 4000);
  } else {
    estadoEl.style.color = 'var(--rojo)';
    estadoEl.textContent = '❌ Error al guardar';
    toast(data?.message || 'Error al guardar la configuración.', 'error');
  }
}

cargarConfig();
