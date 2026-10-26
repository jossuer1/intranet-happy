// Revisión visual aislada: todas las llamadas API se responden con datos ficticios.
const { chromium } = require(process.env.HP_PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const base = 'http://127.0.0.1:5180';
const salida = path.resolve('.artifacts/ui');
let navegador;
fs.mkdirSync(salida, { recursive: true });
const personas = [
  ['Camila', 'Andrade', 'Tecnología', 'Desarrolladora frontend'],
  ['Daniel', 'Mendoza', 'Tecnología', 'Analista de sistemas'],
  ['María José', 'Vélez', 'Finanzas', 'Analista financiera'],
  ['Sebastián', 'Vargas', 'Operaciones', 'Coordinador de operaciones'],
  ['Lucía', 'Morales', 'Recursos Humanos', 'Asistente de talento humano'],
  ['Andrés', 'Castro', 'Finanzas', 'Contador'],
].map(([nombre, apellido, area, cargo], i) => ({ idUsuario: i + 10, nombre, apellido, area, cargo,
  cedula: `091234560${i}`, correoEmpresa: `${nombre.split(' ')[0].toLowerCase()}@happypay.test`,
  estado: i !== 4, tieneVacaciones: i !== 4, esJefe: false,
  puedeActualizarPerfil: i === 1, puedeActualizarHasta: '2026-11-10T04:59:59Z', tieneSolicitudPendiente: i === 2,
}));
for (let i = 6; i < 31; i++) personas.push({ ...personas[i % 6], idUsuario: i + 10, nombre: `Colaborador de prueba ${i + 1}`, apellido: 'HappyPay', cedula: String(912345600 + i), correoEmpresa: `persona${i}@happypay.test` });
const perfil = { idUsuario: 1, nombre: 'Valeria', apellido: 'Torres', rol: 'RRHH', cargo: 'Analista de talento humano',
  correoEmpresa: 'valeria@happypay.test', correoPersonal: 'valeria@example.test', estado: true, esJefe: true,
  tieneVacaciones: true, puedeActualizarPerfil: false, fechaNacimiento: '1993-03-14T00:00:00Z', fechaIngreso: '2021-04-01T00:00:00Z',
  diasVacacionesAsignados: 15, idCargo: 1, idCiudad: 1, idGenero: 1, idEstadoCivil: 1, idJefeDirecto: 2,
  nacionalidad: 'ECUATORIANA', tipoContrato: 'INDEFINIDO', jornada: 'COMPLETA',
  celularPersonal: '0991112233', celularEmpresa: '0994445566', direccion: 'Av. Principal 120', region: 'Costa', provincia: 'Guayas', ciudad: 'Guayaquil', genero: 'Femenino', etnia: 'Mestiza', estadoCivil: 'Casada', tipoSangre: 'O+', cargoIess: 'ANALISTA IESS', sectorial: 'SECTORIAL-123', recibeComisiones: false, acumulaDecimos: true,
  contactosEmergencia: [{ idContacto: 1, nombre: 'Luis', apellido: 'Torres', parentesco: 'HERMANO', telefono: '0991234567', direccion: 'Av. Los Almendros 55' }],
  datosBancarios: [{ idDatoBancario: 1, idBanco: 1, banco: 'Banco Pichincha', tipoCuenta: 'Ahorros', numeroCuenta: '1234567890' }],
  familiares: [{ idFamiliar: 1, nombre: 'Santiago', apellido: 'Vargas', parentesco: 'CONYUGE', cedula: '0911122233', fechaUnion: '2014-05-10T00:00:00Z' }],
  titulos: [{ idTitulo: 1, nombreTitulo: 'Ingeniería comercial', institucion: 'Universidad de prueba', fechaObtencion: '2018-02-15T00:00:00Z', culminado: true }],
  periodosIess: [{ idPeriodoIess: 1, fechaIngreso: '2021-04-01T00:00:00Z', fechaSalida: '2023-03-30T00:00:00Z', cargoIess: 'ANALISTA IESS', vigente: false }],
};
const solicitudes = personas.map((p, i) => ({ idSolicitud: i + 1, idUsuario: p.idUsuario,
  solicitanteNombre: `${p.nombre} ${p.apellido}`, fechaInicio: '2026-11-16T00:00:00Z', fechaFin: '2026-11-20T00:00:00Z',
  fechaSolicitud: '2026-10-24T14:30:00Z', diasSolicitados: 5, motivo: i ? 'Descanso planificado' : 'Vacaciones familiares',
  estado: i ? 'APROBADA' : 'PENDIENTE_JEFE', jefeAprobadorNombre: 'Valeria Torres',
}));
const cambios = [{ idSolicitud: 7, idUsuario: 12, empleado: 'María José Vélez', cedula: '0912345602',
  estado: 'PENDIENTE', fechaSolicitud: '2026-10-24T13:30:00Z', campos: [{ campo: 'Dirección', anterior: 'Av. Principal 120', nuevo: 'Av. Los Cedros 450' }], familiares: [], contactosEmergencia: [], titulos: [] }];

async function mock(route, rol = 'RRHH') {
  const u = new URL(route.request().url());
  if (u.origin === base && !u.pathname.toLowerCase().includes('/api/')) return route.continue();
  const p = u.pathname.toLowerCase().replace(/^.*\/api(?=\/)/, '');
  let data = [];
  if (p === '/usuarios/mi-perfil') data = { ...perfil, rol };
  else if (p === '/usuarios') data = personas;
  else if (p === '/usuarios/jefes') data = [ { idUsuario: 1, nombre: 'Valeria', apellido: 'Torres', cargo: 'Talento Humano', estado: true, cantidadEmpleados: 3, cantidadSolicitudesPendientes: 1 }, { idUsuario: 2, nombre: 'Luis', apellido: 'Navarro', cargo: 'Jefe de tecnología', estado: true, cantidadEmpleados: 3, cantidadSolicitudesPendientes: 1 } ];
  else if (p === '/usuarios/mis-empleados' || /\/jefes\/\d+\/empleados/.test(p)) data = personas.slice(0, 3);
  else if (/^\/usuarios\/\d+$/.test(p)) data = { ...perfil, ...personas.find(x => x.idUsuario === Number(p.split('/').at(-1))), departamento: 'Tecnología', jefeDirecto: 'Valeria Torres', idUsuario: Number(p.split('/').at(-1)) };
  else if (p.includes('/saldo/')) data = { idUsuario: 10, diasAsignados: 15, diasDescontados: 5, diasAjustados: 2, diasDisponibles: 12 };
  else if (p.includes('/historial/') || p === '/vacaciones/mis-vacaciones') data = [{ idVacacion: 1, tipoMovimiento: 'Descuento', fechaInicio: '2026-09-14T00:00:00Z', fechaFin: '2026-09-18T00:00:00Z', diasTomados: 5, observacion: 'Vacaciones familiares', registradoPorNombre: 'Valeria Torres', fechaRegistro: '2026-09-01T10:00:00Z' }, { idVacacion: 2, tipoMovimiento: 'Ajuste', diasTomados: 2, observacion: 'Ajuste por antigüedad', registradoPorNombre: 'Valeria Torres', fechaRegistro: '2026-10-01T10:00:00Z' }];
  else if (p === '/vacaciones/resumen') data = personas.map(x => ({ ...x, nombre: `${x.nombre} ${x.apellido}`, departamento: x.area, diasGanados: 15, diasTomados: 5, saldoDisponible: 10, fechaIngreso: '2021-04-01T00:00:00Z' }));
  else if (p === '/vacaciones/solicitudes/pendientes-jefe') data = solicitudes.filter(s => s.estado === 'PENDIENTE_JEFE');
  else if (p.includes('/vacaciones/solicitudes/')) data = solicitudes;
  else if (p === '/solicitudesperfil') data = cambios;
  else if (p === '/imagenes' || p === '/imagenes/todas') data = Array.from({ length: 31 }, (_, i) => ({ idImagen: i + 1, titulo: `Publicación HappyPay ${String(i + 1).padStart(2, '0')}`, descripcion: `Novedad corporativa número ${i + 1}`, estado: i % 3 !== 0, rutaImagen: base + '/src/assets/images/valores_happy.png', orden: i, fechaCreacion: '2026-10-24T14:30:00Z' }));
  else if (/^\/solicitudesperfil\/\d+$/.test(p)) data = cambios[0];
  else if (p === '/catalogos/opciones-fijas') data = { tiposContrato: ['INDEFINIDO'], tiposContratoConFechaFin: [], jornadas: ['COMPLETA'], parentescosFamiliar: ['HIJO', 'CONYUGE'], nacionalidades: ['ECUATORIANA'] };
  else if (p.startsWith('/catalogos/')) {
    const tipo = p.split('/').at(-1);
    const claves = { areas: ['idArea', 'Tecnología'], cargos: ['idCargo', 'Desarrolladora frontend'], bancos: ['idBanco', 'Banco Pichincha'], ciudades: ['idCiudad', 'Guayaquil'], provincias: ['idProvincia', 'Guayas'], regiones: ['idRegion', 'Costa'], generos: ['idGenero', 'Femenino'], 'estados-civiles': ['idEstadoCivil', 'Soltero'], etnias: ['idEtnia', 'Mestizo'], 'tipos-sangre': ['idTipoSangre', 'O+'] };
    const [clave, nombre] = claves[tipo] || ['id', 'Ejemplo'];
    data = [{ [clave]: 1, nombre, estado: true, idArea: 1, idProvincia: 1, idRegion: 1 }];
  } else if (p === '/roles') data = [{ idRol: 1, nombre: 'ADMIN' }, { idRol: 2, nombre: 'RRHH' }];
  else if (p.startsWith('/roles/usuarios')) data = personas.map(x => ({ ...x, rol: 'RRHH', idRol: 2 }));
  if (route.request().method() !== 'GET') data = { mensaje: 'Operación simulada', idUsuario: 50, empleadosTrasladados: 3, solicitudesPendientesTrasladadas: 1 };
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
}

(async () => {
  const browser = navegador = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await context.addInitScript(() => localStorage.setItem('jwt_token', 'revision-visual-ficticia'));
  let rolActual = 'RRHH';
  await context.route('**/*', r => mock(r, rolActual));
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push(e.stack || e.message));
  async function foto(nombre) { await page.screenshot({ path: path.join(salida, nombre + '.png'), fullPage: page.viewportSize().width > 700, animations: 'disabled' }); }
  async function ir(ruta) { await page.goto(base + ruta); await page.waitForLoadState('networkidle'); }
  if (process.argv.includes('--cobertura')) {
    const enviados = [];
    await context.route('**/api/vacaciones/solicitudes', async r => {
      enviados.push(r.request().postDataJSON()); await r.fulfill({json:{mensaje:'Solicitud simulada'}});
    });
    await ir('/mis-vacaciones');
    async function abrir() {
      await page.locator('button').filter({hasText:'Nueva solicitud'}).click();
      await page.getByLabel('Desde',{exact:true}).fill('2027-01-04');
      await page.getByLabel('Hasta',{exact:true}).fill('2027-01-05');
    }
    await abrir();
    const enviar = page.getByRole('button',{name:'Enviar solicitud',exact:true});
    if (await enviar.isEnabled()) throw Error('Permite enviar cobertura incompleta');
    await page.getByLabel('Nombre de la persona encargada',{exact:true}).fill('Ariana Jácome');
    await page.getByLabel('Área de la persona encargada',{exact:true}).fill('Finanzas');
    await page.getByLabel('Actividades que atenderá',{exact:true}).fill('Seguimiento de pagos');
    const esperado = 'Durante mis vacaciones, Ariana Jácome (Finanzas) quedará a cargo de: Seguimiento de pagos.';
    await page.getByText(esperado,{exact:true}).waitFor();
    await page.getByLabel('Actividades que atenderá',{exact:true}).fill('Actividad extensa '.repeat(8));
    if (await enviar.isEnabled()) throw Error('Permite superar los 200 caracteres');
    await page.getByLabel('Actividades que atenderá',{exact:true}).fill('Seguimiento de pagos');
    await foto('solicitud-cobertura');
    await enviar.click(); await page.getByRole('dialog').waitFor({state:'detached'});
    if (enviados[0]?.motivo !== esperado) throw Error('Mensaje enviado diferente a la vista previa');
    await abrir();
    await page.getByLabel('Otra situación',{exact:true}).check();
    const motivo = 'Vacaciones familiares; las actividades se coordinarán con mi jefe.';
    await page.getByLabel('Motivo u organización de actividades',{exact:true}).fill(motivo);
    await foto('solicitud-otra-situacion');
    await enviar.click(); await page.getByRole('dialog').waitFor({state:'detached'});
    if (enviados[1]?.motivo !== motivo) throw Error('No conserva el texto libre');
    await abrir(); await page.setViewportSize({width:390,height:844}); await foto('solicitud-cobertura-movil');
    if (errores.length) throw Error(errores.join('; '));
    console.log('Cobertura guiada y texto libre: campos obligatorios, límite de 200, vista previa y payload verificados con API simulada.');
    await browser.close(); return;
  }
  if (process.argv.includes('--mis-vacaciones')) {
    await context.route('**/api/vacaciones/mis-vacaciones', r => r.fulfill({json: Array.from({length:31}, (_,i) => ({idVacacion:i+1,
      tipoMovimiento: i % 2 ? 'Ajuste' : 'Descuento', fechaInicio:'2026-09-14T00:00:00Z', fechaFin:'2026-09-18T00:00:00Z',
      diasTomados:5, observacion:`Movimiento de prueba ${String(i+1).padStart(2,'0')}`, registradoPorNombre:'Valeria Torres'}))}));
    await ir('/mis-vacaciones');
    for (const [tab, etiqueta, busqueda] of [
      ['Solicitar Vacaciones', 'Buscar solicitud por fecha, motivo, estado o jefe…', 'Vacaciones familiares'],
      ['Historial de movimientos', 'Buscar movimiento por tipo, fecha, observación o responsable…', 'Movimiento de prueba 31'],
    ]) {
      await page.getByRole('button', {name:tab, exact:true}).click();
      if (await page.locator('.rdt_TableRow').count() !== 10) throw Error('No muestra 10 filas en '+tab);
      const selector = page.getByRole('combobox').last();
      await selector.selectOption('25');
      if (await page.locator('.rdt_TableRow').count() !== 25) throw Error('No muestra 25 filas en '+tab);
      await page.getByRole('button', {name:'Next Page', exact:true}).click();
      if (await page.locator('.rdt_TableRow').count() !== 6) throw Error('Paginación incorrecta en '+tab);
      await selector.selectOption('50');
      if (await page.locator('.rdt_TableRow').count() !== 31) throw Error('No muestra 31 filas en '+tab);
      await page.getByRole('searchbox', {name:etiqueta}).fill(busqueda);
      if (await page.locator('.rdt_TableRow').count() !== 1) throw Error('Búsqueda incorrecta en '+tab);
      await foto(tab === 'Solicitar Vacaciones' ? 'mis-solicitudes-datatable' : 'mis-movimientos-datatable');
    }
    await page.getByRole('button', {name:'Ver detalle del movimiento',exact:true}).click();
    await page.getByRole('dialog').getByText('Movimiento de prueba 31',{exact:true}).waitFor();
    await page.getByRole('button', {name:'Cerrar ventana',exact:true}).click();
    await page.getByRole('dialog').waitFor({state:'detached'});
    await page.locator('button').filter({hasText:'Nueva solicitud'}).click();
    await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    await page.setViewportSize({width:390,height:844});
    await foto('mis-vacaciones-datatable-movil');
    if (errores.length) throw Error(errores.join('; '));
    console.log('Mis Vacaciones: búsqueda y paginación 10/25/50 verificadas en ambas pestañas; detalle y nueva solicitud operativos.');
    await browser.close(); return;
  }
  if (process.argv.includes('--navbar')) {
    for (const [ruta, titulo] of [['/gestion-usuarios', 'Gestión de usuarios'], ['/gestion-vacaciones', 'Gestión de Vacaciones'], ['/gestion-novedades/activos', 'Gestión de Novedades']]) {
      await ir(ruta);
      await page.locator('.topbar').getByText(titulo, { exact: true }).waitFor();
      await page.evaluate(() => window.scrollTo(0, 600));
      const fija = await page.locator('.topbar').evaluate(el => getComputedStyle(el).position === 'fixed' && el.getBoundingClientRect().top === 0 && getComputedStyle(el).backgroundColor === 'rgb(255, 255, 255)');
      if (!fija) throw Error('Barra sin fijar: ' + ruta);
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    await page.getByRole('button', { name: 'Notificaciones', exact: true }).click();
    await page.getByText('No tienes alertas importantes.').waitFor();
    await foto('navbar-novedades');
    await context.route('**/api/vacaciones/solicitudes/mis-solicitudes', r => r.fulfill({json: [{...solicitudes[0], estado: 'RECHAZADA_JEFE', observacionJefe: 'Reorganizar las fechas solicitadas'}]}));
    await context.route('**/api/SolicitudesPerfil/mias', r => r.fulfill({json: [{...cambios[0], estado: 'RECHAZADA', observacionRrhh: 'Completar la información'}]}));
    await ir('/gestion-vacaciones');
    await page.locator('.hp-campana-punto').waitFor();
    await page.locator('.hp-campana').click();
    await page.getByText('Actualización de perfil rechazada', {exact:true}).waitFor();
    await page.getByText('Solicitud de vacaciones rechazada', {exact:true}).waitFor();
    if (await page.locator('.hp-campana-punto').count()) throw Error('No se marcó la alerta como leída');
    await foto('navbar-alertas');
    await page.setViewportSize({width:390,height:844});
    await ir('/gestion-vacaciones');
    if (await page.getByRole('button', {name:'Abrir menú',exact:true}).count() !== 1) throw Error('Menú móvil duplicado');
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (desborde) throw Error('Desborde horizontal en móvil');
    await foto('navbar-movil');
    if (errores.length) throw Error(errores.join('; '));
    console.log('Barra fija blanca, títulos dinámicos, campana vacía y con alertas, lectura y vista móvil verificados.');
    await browser.close(); return;
  }
  if (process.argv.includes('--filtros')) {
    for (const [ruta, nombre, cantidad] of [['/gestion-vacaciones', 'filtros-vacaciones', 1], ['/gestion-novedades/activos', 'filtros-banners', 1]]) {
      await ir(ruta);
      if (ruta === '/gestion-vacaciones') {
        await page.locator('.topbar').getByText('Saldos y solicitudes', {exact:true}).waitFor();
        if (await page.locator('main').getByText('Saldos y solicitudes', {exact:true}).count()) throw Error('Encabezado duplicado dentro de la tarjeta');
        if (await page.getByRole('combobox', {name:'Filtrar beneficio de vacaciones'}).count()) throw Error('Sigue visible el filtro de beneficio');
        await page.getByRole('combobox').last().selectOption('50');
        if (await page.locator('.rdt_TableRow').count() !== personas.filter(p => p.tieneVacaciones).length) throw Error('Se muestran personas sin vacaciones');
        if (await page.locator('.rdt_TableRow').filter({hasText:'Lucía Morales'}).count()) throw Error('Colaboradora sin beneficio visible');
      }
      const medidas = await page.locator('.hp-filtros select, .hp-filtros input[type="search"]').evaluateAll(elementos => elementos.map(el => {
        const r = el.getBoundingClientRect(); return { x: r.x, y: r.y + r.height / 2 };
      }));
      if (medidas.length !== cantidad + 1 || medidas.some(m => Math.abs(m.y - medidas[0].y) > 2)) throw Error('Los filtros no están en una misma línea: ' + ruta);
      if (medidas.some((m, i) => i && m.x <= medidas[i - 1].x)) throw Error('Los filtros no están a la izquierda del buscador');
      await foto(nombre);
    }
    if (errores.length) throw Error(errores.join('; '));
    await browser.close();
    console.log('Vacaciones y banners: filtros y buscador alineados horizontalmente, sin errores de navegador.');
    return;
  }
  await ir('/gestion-usuarios');
  await page.getByRole('button', { name: 'Nuevo colaborador' }).waitFor();
  await foto('01-usuarios');
  const color = await page.getByRole('button', { name: 'Nuevo colaborador' }).evaluate(el => getComputedStyle(el).backgroundColor);
  if (color !== 'rgb(0, 77, 64)') throw Error('Color principal incorrecto: ' + color);
  await page.getByTitle('Ver información', { exact: true }).first().click();
  await page.getByRole('dialog').waitFor(); await foto('02-expediente');
  for (const [tab, muestra] of [['Datos laborales', 'SECTORIAL-123'], ['Formación', 'Universidad de prueba'], ['Familiares', '10/05/2014'], ['Emergencia', 'Av. Los Almendros 55'], ['Datos bancarios', '1234567890'], ['Control del expediente', 'Edición de perfil habilitada']]) {
    await page.getByRole('tab', { name: tab, exact: true }).click();
    await page.getByRole('dialog').getByText(muestra, { exact: true }).first().waitFor();
    await foto('expediente-' + tab.replaceAll(' ', '-'));
  }
  await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({ state: 'hidden' });
  if (!await page.getByTitle('Ver información', { exact: true }).first().evaluate(el => el === document.activeElement)) throw Error('No se restauró el foco al cerrar la ficha');
  if (new URL(page.url()).pathname !== '/gestion-usuarios') throw Error('La ficha cambió la ruta');
  await page.getByRole('button', { name: 'Nuevo colaborador' }).click();
  await page.waitForURL('**/gestion-usuarios/crear'); await page.getByRole('tab', { name: /Personales/ }).waitFor();
  if (await page.getByRole('dialog').count()) throw Error('La creación de usuarios sigue dentro de un modal');
  await foto('03-nuevo-colaborador');
  await ir('/gestion-usuarios');
  await page.getByTitle('Editar información', { exact: true }).first().click();
  await page.getByRole('dialog').waitFor(); await page.waitForTimeout(300); await foto('04-editar'); await page.keyboard.press('Escape');
  await ir('/aprobar-vacaciones'); await foto('05-equipo');
  await page.getByRole('button', { name: 'Ver historial' }).first().click();
  await page.getByRole('dialog').waitFor(); await foto('06-historial'); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Solicitudes de tu equipo', exact: true }).click(); await page.waitForLoadState('networkidle'); await foto('07-aprobaciones');
  await ir('/gestion-vacaciones'); await foto('08-vacaciones');
  async function paginacionYBusqueda(etiqueta, termino, total = 31) {
    if (await page.locator('.rdt_TableRow').count() !== 10) throw Error('La tabla no inicia en 10 filas: ' + etiqueta);
    const selector = page.getByRole('combobox').last();
    await selector.selectOption('25');
    if (await page.locator('.rdt_TableRow').count() !== 25) throw Error('No muestra 25 filas: ' + etiqueta);
    await page.getByRole('button', { name: 'Next Page', exact: true }).click();
    if (await page.locator('.rdt_TableRow').count() !== total - 25) throw Error('Cantidad incorrecta en la segunda página: ' + etiqueta);
    await selector.selectOption('50');
    if (await page.locator('.rdt_TableRow').count() !== total) throw Error('Cantidad incorrecta al seleccionar 50: ' + etiqueta);
    await page.getByRole('searchbox', { name: etiqueta }).fill(termino);
    if (await page.locator('.rdt_TableRow').count() !== 1) throw Error('La búsqueda no filtra en tiempo real: ' + etiqueta);
    await page.getByRole('searchbox', { name: etiqueta }).fill('');
  }
  await paginacionYBusqueda('Buscar colaborador, área o fecha…', 'Colaborador de prueba 31', personas.filter(p => p.tieneVacaciones).length);
  await page.getByRole('button', { name: 'Solicitudes', exact: true }).click(); await page.waitForLoadState('networkidle');
  await paginacionYBusqueda('Buscar empleado, motivo, estado o jefe…', 'Colaborador de prueba 31'); await foto('vacaciones-solicitudes');
  await ir('/gestion-novedades/activos');
  await paginacionYBusqueda('Buscar por título, descripción o estado…', 'Publicación HappyPay 31'); await foto('banners-datatable');
  await ir('/gestion-usuarios/jefes'); await foto('09-jefes');
  await page.getByRole('button', { name: /Luis Navarro/ }).click(); await page.waitForLoadState('networkidle'); await foto('10-equipo-jefe');
  const colorSecundario = await page.getByRole('button', { name: 'Reemplazar jefe', exact: true }).evaluate(el => getComputedStyle(el).color);
  if (colorSecundario !== 'rgb(0, 77, 64)') throw Error('El botón secundario no usa la paleta corporativa: ' + colorSecundario);
  await ir('/gestion-usuarios/solicitudes'); await foto('11-actualizaciones');
  await page.getByRole('button', { name: /Solicitudes recibidas/ }).click();
  await page.getByRole('button', { name: 'Revisar', exact: true }).first().click();
  await page.getByRole('dialog').waitFor(); await foto('12-revision-cambios'); await page.keyboard.press('Escape');
  await ir('/mis-vacaciones'); await foto('13-mis-vacaciones');
  await page.getByRole('button', { name: 'Nueva solicitud' }).click(); await page.getByRole('dialog').waitFor(); await foto('18-solicitar-vacaciones'); await page.keyboard.press('Escape');
  await ir('/gestion-vacaciones/saldos'); await foto('19-saldos');
  rolActual = 'ADMIN';
  await ir('/gestion-catalogos'); await foto('20-catalogos');
  await page.getByRole('button', { name: /Nueva área/ }).click(); await page.getByRole('dialog').waitFor(); await foto('21-catalogo-modal'); await page.keyboard.press('Escape');
  await ir('/gestion-catalogos?seccion=roles'); await foto('22-roles');
  await page.getByTitle('Asignar rol', { exact: true }).first().click(); await page.getByRole('dialog').waitFor(); await foto('23-rol-modal'); await page.keyboard.press('Escape');
  rolActual = 'RRHH';
  await page.setViewportSize({ width: 390, height: 844 });
  await ir('/gestion-usuarios'); await foto('14-usuarios-movil');
  await page.getByRole('button', { name: 'Nuevo colaborador' }).click(); await page.waitForURL('**/gestion-usuarios/crear'); await foto('15-formulario-movil');
  await ir('/login'); await foto('16-login-movil');
  await page.setViewportSize({ width: 1440, height: 1000 }); await foto('17-login');
  await browser.close();
  fs.writeFileSync(path.join(salida, 'resultado.json'), JSON.stringify({ errores, colorPrincipal: color }, null, 2));
  if (errores.length) throw Error('Errores del navegador: ' + errores.join('; '));
  console.log('Revisión completada: creación en ruta independiente; expediente en siete pestañas; búsqueda, filas 10/25/50 y paginación operativas en tres tablas; sin errores de navegador.');
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => { if (navegador?.isConnected()) await navegador.close(); });
