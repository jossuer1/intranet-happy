import apiClient from "./apiClient";

export const getImagenesActivas = async () => {
  return await apiClient.get("/Imagenes/activas");
};

export const getTodasLasImagenes = async () => {
  return await apiClient.get("/Imagenes");
};

export const agregarImagen = async (payload) => {
  return await apiClient.post("/Imagenes", payload);
};

export const actualizarImagen = async (id, payload) => {
  return await apiClient.put(`/Imagenes/${id}`, payload);
};

export const desactivarImagen = async (id) => {
  return await apiClient.delete(`/Imagenes/${id}`);
};
