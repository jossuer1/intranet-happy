import { apiClient } from "./apiClient";

export const getSaldo = (idUsuario) =>
  apiClient.get(`/vacaciones/saldo/${idUsuario}`);

// Alias para compatibilidad con SaldosPersonales.jsx.
// Sin idUsuario -> lista de TODO el personal con su saldo (backend: GET /vacaciones/resumen).
// El backend no tiene un endpoint "/vacaciones/saldos"; el que trae el listado completo es "/resumen".
export const getSaldosVacaciones = (idUsuario) =>
  idUsuario
    ? apiClient.get(`/vacaciones/saldo/${idUsuario}`)
    : apiClient.get("/vacaciones/resumen");

export const getHistorial = (idUsuario) =>
  apiClient.get(`/vacaciones/historial/${idUsuario}`);

export const getMisVacaciones = () =>
  apiClient.get("/vacaciones/mis-vacaciones");

export const getTodas = () => apiClient.get("/vacaciones/todas");

export const getResumen = () => apiClient.get("/vacaciones/resumen");

export const getResumenVacaciones = getResumen;

export const registrarDescuento = (descuentoDto) =>
  apiClient.post("/vacaciones/descuento", descuentoDto);

export const registrarDescuentoVacaciones = registrarDescuento;

export const registrarAjuste = (ajusteDto) =>
  apiClient.post("/vacaciones/ajuste", ajusteDto);

export const registrarAjusteVacaciones = registrarAjuste;

// El backend no tiene "/vacaciones/acreditar"; acreditar días es un Ajuste normal (POST /vacaciones/ajuste)
export const acreditarDiasVacaciones = (ajusteDto) =>
  apiClient.post("/vacaciones/ajuste", ajusteDto);

// --- Flujo de solicitudes: Empleado -> Jefe Directo (RRHH solo recibe los documentos) ---

// El empleado logueado crea una solicitud (fechaInicio, fechaFin, motivo)
export const crearSolicitudVacacion = (dto) =>
  apiClient.post("/vacaciones/solicitudes", dto);

// El empleado logueado ve el estado de todas sus propias solicitudes
export const getMisSolicitudesVacacion = () =>
  apiClient.get("/vacaciones/solicitudes/mis-solicitudes");

// Solicitudes de subordinados esperando respuesta del jefe logueado
export const getSolicitudesPendientesJefe = () =>
  apiClient.get("/vacaciones/solicitudes/pendientes-jefe");

// El jefe aprueba (true) o rechaza (false) una solicitud, con observación opcional
export const responderSolicitudComoJefe = (idSolicitud, aprobar, observacion) =>
  apiClient.patch(`/vacaciones/solicitudes/${idSolicitud}/jefe`, {
    aprobar,
    observacion: observacion || null,
  });

// Exclusivo RRHH: todas las solicitudes de la empresa (RRHH ya no aprueba nada:
// la única aprobación es la del jefe directo; aquí solo consulta y descarga).
export const getTodasSolicitudes = () =>
  apiClient.get("/vacaciones/solicitudes/todas");

// --- Documentos de una solicitud APROBADA (se generan al vuelo en el backend) ---
// Ambas devuelven { blob, nombre } para que quien las llame guarde el archivo
// (ver utils/descargas.js). Las pueden pedir el empleado, su jefe directo y RRHH.

// Los 3 documentos juntos en un .zip
export const descargarDocumentosSolicitud = (idSolicitud) =>
  apiClient.getBlob(`/vacaciones/solicitudes/${idSolicitud}/documentos`);

// Un solo documento en PDF: 1 = solicitud, 2 = acta, 3 = declaración de goce y pago
export const descargarDocumentoSolicitud = (idSolicitud, numero) =>
  apiClient.getBlob(
    `/vacaciones/solicitudes/${idSolicitud}/documentos/${numero}`,
  );

export const vacacionesService = {
  getSaldo,
  getSaldosVacaciones,
  getHistorial,
  getMisVacaciones,
  getTodas,
  getResumen,
  getResumenVacaciones,
  registrarDescuento,
  registrarDescuentoVacaciones,
  registrarAjuste,
  registrarAjusteVacaciones,
  acreditarDiasVacaciones,
  crearSolicitudVacacion,
  getMisSolicitudesVacacion,
  getSolicitudesPendientesJefe,
  responderSolicitudComoJefe,
  getTodasSolicitudes,
  descargarDocumentosSolicitud,
  descargarDocumentoSolicitud,
};