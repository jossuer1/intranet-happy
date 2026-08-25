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
};