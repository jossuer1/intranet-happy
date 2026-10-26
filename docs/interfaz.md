# Interfaz HappyPay

La paleta compartida está en `src/styles/theme.css`: color principal `#004d40`,
fondo claro, superficies blancas y estados en tonos suaves. Las variables
`--brand`, `--brand-dark`, `--brand-soft` y `--hp-*` permiten mantener consistencia
con los formularios existentes. No se redefine el padding global de `.btn`.

- `PersonaCelda`: avatar circular con iniciales, nombre completo y texto secundario.
- `tablaEstilos.js`: configuración compartida de React Data Table; tablas HTML
  reciben el mismo lenguaje visual mediante `.hp-app` o `.hp-modal`.
- `ModalDialog`: modal Bootstrap controlado por React, montado mediante portal.
  Mantiene el scroll del fondo bloqueado, el foco dentro de la ventana y lo
  devuelve al control de origen. Escape cierra; los formularios ocupados no
  se pueden cerrar con Escape. El fondo estático evita cierres accidentales.
- `ModalBase`: conserva la interfaz de los catálogos y delega en `ModalDialog`.

La creación de usuarios tiene una página propia: `/gestion-usuarios/crear`.
Las fichas, edición de usuarios, historiales, ajustes de vacaciones y revisión
de actualizaciones se abren sobre su listado.

`ExpedienteColaborador` se comparte entre el modal de RRHH y la ruta de perfil
completo. Incluye información personal, laboral, beneficios, períodos IESS,
formación, familiares, emergencia, cuentas y control de actualización. Los
valores faltantes se indican explícitamente y los valores cero se conservan.
La vista personal del empleado mantiene su presentación habitual.

`TablaInteractiva` utiliza React Data Table Component para saldos y solicitudes
de Gestión de Vacaciones, y para Banners Activos. Tiene búsqueda normalizada
en tiempo real, ordenación por encabezados, selector 10/25/50 y paginación
inferior. Los filtros de área, beneficio y estado de publicación se conservan.

Los estilos del login (`form`, títulos y botones propios) se limitan a
`.auth-page`. Sus variantes de móvil y escritorio tienen media queries independientes.

## Revisión visual

`scripts/review-ui.cjs` usa Playwright y Chrome para revisar escritorio y móvil.
Intercepta las llamadas API y entrega exclusivamente datos ficticios: no envía
credenciales reales ni modifica registros. Las capturas y el resultado se guardan
en `.artifacts/ui/`, que está excluido de Git.

Con la vista previa en `http://127.0.0.1:5180`, ejecutar:

```powershell
$env:HP_PLAYWRIGHT_MODULE = 'ruta/al/paquete/playwright'
node scripts/review-ui.cjs
```

El script verifica colores corporativos, devolución del foco, creación en ruta
independiente y los campos de las pestañas del expediente. Usa 31 registros
ficticios por tabla para comprobar búsqueda, selector 10/25/50 y segunda página.

La barra blanca de `AppLayout` permanece fija y recibe el título de cada vista
mediante `SectionHeader`. En móvil integra un único botón de menú.
La campana consulta cada minuto los endpoints personales existentes: muestra
actualización de perfil habilitada y rechazos de perfil o vacaciones. No muestra
banners promocionales. Las lecturas se conservan por usuario en este navegador
(`localStorage`); no se sincronizan entre dispositivos. ADMIN no realiza estas
consultas personales. `node scripts/review-ui.cjs --navbar` verifica la barra,
alertas y vista móvil; `--filtros` comprueba la alineación de las tablas.

Las dos pestañas de Mis Vacaciones utilizan `TablaInteractiva`: solicitudes con
búsqueda por fechas, días, motivo, estado y jefe; movimientos por tipo, fechas,
días, observación y responsable. Conservan documentos de solicitudes aprobadas
y el modal de detalle. `node scripts/review-ui.cjs --mis-vacaciones` comprueba
búsqueda, páginas de 10/25/50 filas y modales con 31 registros ficticios.

Nueva solicitud ofrece cobertura por una persona (nombre, área y actividades)
u otra situación con texto libre. Muestra una vista previa y envía ese mismo
texto en `motivo`, con un máximo de 200 caracteres compatible con el backend
y los documentos existentes. Nombre y área se ingresan manualmente para
mantener el listado de colaboradores restringido a RRHH. La cobertura es una
propuesta para revisión del jefe. `--cobertura` verifica ambos modos, campos
obligatorios, longitud y payload sin efectuar escrituras reales.
