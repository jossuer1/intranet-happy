import { apiClient } from "./apiClient";

// Roles que existen en el sistema (solo activos). Se usa para llenar el
// selector al asignar: NO se crean roles desde la pantalla, solo se asignan.
export const getRoles = () => apiClient.get("/roles");

// Lista de usuarios con su rol actual (exclusivo ADMIN). Cada fila trae:
// { idUsuario, cedula, nombre, apellido, correoEmpresa, cargo, idRol, rol, estado }
export const getUsuariosConRol = (buscar) =>
  apiClient.get(
    `/roles/usuarios${buscar ? `?buscar=${encodeURIComponent(buscar)}` : ""}`,
  );

// Asigna un rol existente a un usuario (solo cambia usuario.idRol).
export const asignarRol = (idUsuario, idRol) =>
  apiClient.post("/roles/asignar-usuario", { idUsuario, idRol });

// Deja al usuario sin rol.
export const quitarRol = (idUsuario) =>
  apiClient.post(`/roles/quitar-usuario/${idUsuario}`, {});

export const rolesService = {
  getRoles,
  getUsuariosConRol,
  asignarRol,
  quitarRol,
};
