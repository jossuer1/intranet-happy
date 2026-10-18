import { apiClient } from "./apiClient";

// --- Lecturas públicas (combos de formularios) ---
// Solo devuelven registros ACTIVOS.
export const getAreas = () => apiClient.get("/catalogos/areas", false);
export const getCargos = (idArea) =>
  apiClient.get(
    `/catalogos/cargos${idArea ? `?idArea=${idArea}` : ""}`,
    false,
  );
export const getBancos = () => apiClient.get("/catalogos/bancos", false);
export const getRegiones = () => apiClient.get("/catalogos/regiones", false);

// Jerarquía Región → Provincia → Ciudad (filtros opcionales en cascada).
export const getProvincias = (idRegion) =>
  apiClient.get(
    `/catalogos/provincias${idRegion ? `?idRegion=${idRegion}` : ""}`,
    false,
  );
export const getCiudades = (idProvincia) =>
  apiClient.get(
    `/catalogos/ciudades${idProvincia ? `?idProvincia=${idProvincia}` : ""}`,
    false,
  );

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

// --- Lecturas para la pantalla de administración (rol ADMIN) ---
// Con el token + ?incluirInactivos=true el backend devuelve TAMBIÉN los
// registros desactivados, para que el ADMIN pueda editarlos o reactivarlos.
const conInactivos = (ruta) =>
  apiClient.get(`${ruta}?incluirInactivos=true`);

export const getAreasAdmin = () => conInactivos("/catalogos/areas");
export const getCargosAdmin = () => conInactivos("/catalogos/cargos");
export const getBancosAdmin = () => conInactivos("/catalogos/bancos");
export const getProvinciasAdmin = () => conInactivos("/catalogos/provincias");
export const getCiudadesAdmin = () => conInactivos("/catalogos/ciudades");
export const getEtniasAdmin = () => conInactivos("/catalogos/etnias");
export const getEstadosCivilesAdmin = () =>
  conInactivos("/catalogos/estados-civiles");
export const getGenerosAdmin = () => conInactivos("/catalogos/generos");
export const getTiposSangreAdmin = () =>
  conInactivos("/catalogos/tipos-sangre");

// --- Escrituras (solo rol ADMIN, el backend las protege igual) ---
// No hay "eliminar": para dar de baja un registro se edita con estado=false
// (baja lógica) y para reactivarlo, estado=true.

// Áreas
export const crearArea = (nombre) =>
  apiClient.post("/catalogos/areas", { nombre });
export const actualizarArea = (id, nombre, estado) =>
  apiClient.put(`/catalogos/areas/${id}`, { nombre, estado });

// Cargos (pertenecen a un área)
export const crearCargo = (nombre, idArea) =>
  apiClient.post("/catalogos/cargos", { nombre, idArea });
export const actualizarCargo = (id, nombre, idArea, estado) =>
  apiClient.put(`/catalogos/cargos/${id}`, { nombre, idArea, estado });

// Bancos
export const crearBanco = (nombre) =>
  apiClient.post("/catalogos/bancos", { nombre });
export const actualizarBanco = (id, nombre, estado) =>
  apiClient.put(`/catalogos/bancos/${id}`, { nombre, estado });

// Provincias (pertenecen a una región)
export const crearProvincia = (nombre, idRegion) =>
  apiClient.post("/catalogos/provincias", { nombre, idRegion });
export const actualizarProvincia = (id, nombre, idRegion, estado) =>
  apiClient.put(`/catalogos/provincias/${id}`, { nombre, idRegion, estado });

// Ciudades (pertenecen a una provincia)
export const crearCiudad = (nombre, idProvincia) =>
  apiClient.post("/catalogos/ciudades", { nombre, idProvincia });
export const actualizarCiudad = (id, nombre, idProvincia, estado) =>
  apiClient.put(`/catalogos/ciudades/${id}`, { nombre, idProvincia, estado });

// Etnias
export const crearEtnia = (nombre) =>
  apiClient.post("/catalogos/etnias", { nombre });
export const actualizarEtnia = (id, nombre, estado) =>
  apiClient.put(`/catalogos/etnias/${id}`, { nombre, estado });

// Estados civiles
export const crearEstadoCivil = (nombre) =>
  apiClient.post("/catalogos/estados-civiles", { nombre });
export const actualizarEstadoCivil = (id, nombre, estado) =>
  apiClient.put(`/catalogos/estados-civiles/${id}`, { nombre, estado });

// Géneros
export const crearGenero = (nombre) =>
  apiClient.post("/catalogos/generos", { nombre });
export const actualizarGenero = (id, nombre, estado) =>
  apiClient.put(`/catalogos/generos/${id}`, { nombre, estado });

// Tipos de sangre
export const crearTipoSangre = (nombre) =>
  apiClient.post("/catalogos/tipos-sangre", { nombre });
export const actualizarTipoSangre = (id, nombre, estado) =>
  apiClient.put(`/catalogos/tipos-sangre/${id}`, { nombre, estado });

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
  getCatalogosFormulario,
  getAreasAdmin,
  getCargosAdmin,
  getBancosAdmin,
  getProvinciasAdmin,
  getCiudadesAdmin,
  getEtniasAdmin,
  getEstadosCivilesAdmin,
  getGenerosAdmin,
  getTiposSangreAdmin,
  crearArea,
  actualizarArea,
  crearCargo,
  actualizarCargo,
  crearBanco,
  actualizarBanco,
  crearProvincia,
  actualizarProvincia,
  crearCiudad,
  actualizarCiudad,
  crearEtnia,
  actualizarEtnia,
  crearEstadoCivil,
  actualizarEstadoCivil,
  crearGenero,
  actualizarGenero,
  crearTipoSangre,
  actualizarTipoSangre,
};
