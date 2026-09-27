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

// --- Flujo de solicitudes: Empleado -> Jefe Directo -> RRHH ---

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

// Exclusivo RRHH: solicitudes ya aprobadas por el jefe, esperando el visto bueno final
export const getSolicitudesPendientesRrhh = () =>
  apiClient.get("/vacaciones/solicitudes/pendientes-rrhh");

// Exclusivo RRHH: aprobación (o rechazo) final; si aprueba, se descuentan los días
export const responderSolicitudComoRrhh = (idSolicitud, aprobar, observacion) =>
  apiClient.patch(`/vacaciones/solicitudes/${idSolicitud}/rrhh`, {
    aprobar,
    observacion: observacion || null,
  });

// Descarga la constancia en PDF de una solicitud ya aprobada.
// Devuelve el Blob para que quien la llame arme la descarga (no pasa por
// apiClient porque la respuesta no es JSON, es un archivo).
export const descargarConstanciaSolicitud = async (idSolicitud) => {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt_token");
  const res = await fetch(
    `${BASE_URL}/vacaciones/solicitudes/${idSolicitud}/constancia`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    let mensaje = `No se pudo generar la constancia (${res.status})`;
    try {
      const data = await res.json();
      mensaje = data?.mensaje || mensaje;
    } catch {
      /* la respuesta de error puede no ser JSON */
    }
    throw new Error(mensaje);
  }
  return res.blob();
};

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
  getSolicitudesPendientesRrhh,
  responderSolicitudComoRrhh,
  descargarConstanciaSolicitud,
};