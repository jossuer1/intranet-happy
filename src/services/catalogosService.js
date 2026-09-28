import { apiClient } from "./apiClient";

// --- Lecturas públicas (ya existían) ---
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
export const getTiposSangre = () =>
  apiClient.get("/catalogos/tipos-sangre", false);

export const getCatalogosFormulario = () =>
  apiClient.get("/catalogos/formulario-perfil", false);

// Listas fijas validadas por el backend (tipos de contrato, jornadas,
// parentescos). Devuelve { tiposContrato, tiposContratoConFechaFin, jornadas, parentescosFamiliar }.
export const getOpcionesFijas = () =>
  apiClient.get("/catalogos/opciones-fijas", false);

// --- Escrituras (solo rol ADMIN, el backend las protege igual) ---

// Áreas: solo Crear (el backend no expone editar/desactivar)
export const crearArea = (nombre) =>
  apiClient.post("/catalogos/areas", { nombre });

// Cargos: solo Crear. OJO: el backend actual (CreateCargo) recibe
// CatalogoNombreDto (solo "nombre") pero el modelo Cargo requiere IdArea.
// Se envía idArea igual por si ya se actualizó el DTO; si el backend
// todavía no lo acepta, hay que agregarlo (ver nota en el chat).
export const crearCargo = (nombre, idArea) =>
  apiClient.post("/catalogos/cargos", { nombre, idArea });

// Bancos: solo Crear
export const crearBanco = (nombre) =>
  apiClient.post("/catalogos/bancos", { nombre });

// Etnias: solo Crear (el backend no expone PUT/DELETE)
export const crearEtnia = (nombre) =>
  apiClient.post("/catalogos/etnias", { nombre });

// Géneros: solo Crear
export const crearGenero = (nombre) =>
  apiClient.post("/catalogos/generos", { nombre });

// Ciudades: Crear, Editar, Desactivar (baja lógica)
export const crearCiudad = (nombre, idProvincia) =>
  apiClient.post("/catalogos/ciudades", { nombre, idProvincia });
export const actualizarCiudad = (id, nombre, idProvincia, estado) =>
  apiClient.put(`/catalogos/ciudades/${id}`, { nombre, idProvincia, estado });
export const desactivarCiudad = (id) =>
  apiClient.delete(`/catalogos/ciudades/${id}`);

// Estados civiles: Crear, Editar, Desactivar
export const crearEstadoCivil = (nombre) =>
  apiClient.post("/catalogos/estados-civiles", { nombre });
export const actualizarEstadoCivil = (id, nombre, estado) =>
  apiClient.put(`/catalogos/estados-civiles/${id}`, { nombre, estado });
export const desactivarEstadoCivil = (id) =>
  apiClient.delete(`/catalogos/estados-civiles/${id}`);

// Tipos de sangre: Crear, Editar, Desactivar
export const crearTipoSangre = (nombre) =>
  apiClient.post("/catalogos/tipos-sangre", { nombre });
export const actualizarTipoSangre = (id, nombre, estado) =>
  apiClient.put(`/catalogos/tipos-sangre/${id}`, { nombre, estado });
export const desactivarTipoSangre = (id) =>
  apiClient.delete(`/catalogos/tipos-sangre/${id}`);

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
  getTiposSangre,
  getOpcionesFijas,
  crearArea,
  crearCargo,
  crearBanco,
  crearEtnia,
  crearGenero,
  crearCiudad,
  actualizarCiudad,
  desactivarCiudad,
  crearEstadoCivil,
  actualizarEstadoCivil,
  desactivarEstadoCivil,
  crearTipoSangre,
  actualizarTipoSangre,
  desactivarTipoSangre,
  getCatalogosFormulario,
};
