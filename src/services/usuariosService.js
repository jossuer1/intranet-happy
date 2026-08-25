import { apiClient } from "./apiClient";

export const crearUsuario = (datosUsuario) =>
  apiClient.post("/usuarios", datosUsuario);

export const getTodos = () => apiClient.get("/usuarios");

// Alias para compatibilidad con GestionUsuarios.jsx
export const getUsuarios = getTodos;

export const getPorId = (id) => apiClient.get(`/usuarios/${id}`);

export const getMiPerfil = () => apiClient.get("/usuarios/mi-perfil");

export const actualizar = (id, datosUsuario) =>
  apiClient.put(`/usuarios/${id}`, datosUsuario);

export const actualizarUsuario = actualizar;

export const actualizarVacaciones = (idUsuario, dto) =>
  apiClient.patch(`/usuarios/${idUsuario}/vacaciones`, dto);

export const actualizarVacacionesUsuario = actualizarVacaciones;

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
  actualizar,
  actualizarUsuario,
  actualizarVacaciones,
  actualizarVacacionesUsuario,
  subirFotoPerfil,
};
