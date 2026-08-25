import { apiClient } from "./apiClient";

export const getAreas = () => apiClient.get("/catalogos/areas", false);
export const getCargos = () => apiClient.get("/catalogos/cargos", false);
export const getBancos = () => apiClient.get("/catalogos/bancos", false);
export const getRegiones = () => apiClient.get("/catalogos/regiones", false);
export const getProvincias = () =>
  apiClient.get("/catalogos/provincias", false);
export const getCiudades = () => apiClient.get("/catalogos/ciudades", false);
export const getEtnias = () => apiClient.get("/catalogos/etnias", false);
export const getEstadosCiviles = () =>
  apiClient.get("/catalogos/estados-civiles", false);
export const getGeneros = () => apiClient.get("/catalogos/generos", false);

// Opcional: mantienes la exportación por objeto si la usas en otro lugar
export const catalogosService = {
  getAreas,
  getCargos,
  getBancos,
  getRegiones,
  getProvincias,
  getCiudades,
  getEtnias,
  getEstadosCiviles,
  getGeneros,
};
