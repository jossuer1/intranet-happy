import { apiClient } from "./apiClient";

export const crearUsuario = (datosUsuario) =>
  apiClient.post("/usuarios", datosUsuario);

export const getTodos = () => apiClient.get("/usuarios");

// Alias para compatibilidad con GestionUsuarios.jsx
export const getUsuarios = getTodos;

export const getPorId = (id) => apiClient.get(`/usuarios/${id}`);

export const getMiPerfil = () => apiClient.get("/usuarios/mi-perfil");

// Autogestión del empleado (solo cuando RRHH activó puedeActualizarPerfil).
// El backend toma el id del token, valida el flag, ignora campos sensibles
// y apaga puedeActualizarPerfil al guardar. No usa /usuarios/{id} (RRHH).
export const actualizarMiPerfil = (datosPerfil) =>
  apiClient.put("/usuarios/mi-perfil", datosPerfil);

// Foto del propio empleado (multipart). Devuelve { urlImagenPerfil }.
export const subirMiFoto = (archivo) => {
  const formData = new FormData();
  formData.append("foto", archivo);
  return apiClient.post("/usuarios/mi-perfil/foto", formData);
};

export const actualizar = (id, datosUsuario) =>
  apiClient.put(`/usuarios/${id}`, datosUsuario);

export const actualizarUsuario = actualizar;

export const actualizarPermisoPerfil = (idUsuario, habilitar) =>
  apiClient.patch(`/usuarios/${idUsuario}/permiso-actualizacion`, {
    habilitar,
  });

export const actualizarVacaciones = (idUsuario, dto) =>
  apiClient.patch(`/usuarios/${idUsuario}/vacaciones`, dto);

export const actualizarVacacionesUsuario = actualizarVacaciones;

// Activa (true) o desactiva (false) la cuenta de un usuario. Un usuario
// desactivado no puede iniciar sesión ni cambiar su contraseña.
export const actualizarEstadoUsuario = (idUsuario, activar) =>
  apiClient.patch(`/usuarios/${idUsuario}/estado`, { activar });

// Sube/reemplaza la foto de perfil (multipart). Devuelve { urlImagenPerfil }.
export const subirFotoPerfil = (idUsuario, archivo) => {
  const formData = new FormData();
  formData.append("foto", archivo);
  return apiClient.post(`/usuarios/${idUsuario}/foto`, formData);
};

// Exportación por objeto
export const usuariosService = {
  crearUsuario,
  getTodos,
  getUsuarios,
  getPorId,
  getMiPerfil,
  actualizarMiPerfil,
  subirMiFoto,
  actualizar,
  actualizarUsuario,
  actualizarVacaciones,
  actualizarVacacionesUsuario,
  actualizarEstadoUsuario,
  actualizarPermisoPerfil,
  subirFotoPerfil,
};
