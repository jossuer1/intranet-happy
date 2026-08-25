import apiClient from "./apiClient";

// GET /api/imagenes -> el backend YA devuelve solo las activas en la ruta base
export const getImagenesActivas = async () => {
  return await apiClient.get("/Imagenes");
};

// GET /api/imagenes/todas -> exclusivo RRHH, activas e inactivas
export const getTodasLasImagenes = async () => {
  return await apiClient.get("/Imagenes/todas");
};

export const agregarImagen = async (payload) => {
  return await apiClient.post("/Imagenes", payload);
};

export const actualizarImagen = async (id, payload) => {
  return await apiClient.put(`/Imagenes/${id}`, payload);
};

// Baja lógica (Estado = false), no borra el registro
export const desactivarImagen = async (id) => {
  return await apiClient.delete(`/Imagenes/${id}`);
};

// Eliminación definitiva (borra el registro de la BD)
export const eliminarImagenDefinitivo = async (id) => {
  return await apiClient.delete(`/Imagenes/${id}/eliminar`);
};