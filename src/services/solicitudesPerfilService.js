import { apiClient } from "./apiClient";

// RRHH: lista de solicitudes. estado opcional: PENDIENTE | APROBADA | RECHAZADA.
export const listar = (estado) =>
  apiClient.get(`/SolicitudesPerfil${estado ? `?estado=${estado}` : ""}`);

// Empleado: historial propio (incluye observacionRrhh si fue rechazada).
export const mias = () => apiClient.get("/SolicitudesPerfil/mias");

// RRHH: detalle con el comparativo antes/después.
export const detalle = (id) => apiClient.get(`/SolicitudesPerfil/${id}`);

// RRHH: aprueba (se aplican los cambios). La observación es opcional.
export const aprobar = (id, observacion) =>
  apiClient.post(
    `/SolicitudesPerfil/${id}/aprobar`,
    observacion ? { observacion } : {},
  );

// RRHH: rechaza. El motivo es obligatorio.
export const rechazar = (id, observacion) =>
  apiClient.post(`/SolicitudesPerfil/${id}/rechazar`, { observacion });

export const solicitudesPerfilService = {
  listar,
  mias,
  detalle,
  aprobar,
  rechazar,
};
