// Secciones de la pantalla de administración (rol ADMIN).
// Las usan el menú lateral (AppLayout) y la página (GestionCatalogos), así
// hay una sola lista: para agregar una sección se agrega aquí y en
// catalogosConfig.js (o en GestionCatalogos si no es un catálogo).

export const SECCIONES_CATALOGO = [
  { key: "areas", titulo: "Áreas", icono: "bi-diagram-3" },
  { key: "cargos", titulo: "Cargos", icono: "bi-briefcase" },
  { key: "bancos", titulo: "Bancos", icono: "bi-bank" },
  { key: "provincias", titulo: "Provincias", icono: "bi-map" },
  { key: "ciudades", titulo: "Ciudades", icono: "bi-geo-alt" },
  { key: "etnias", titulo: "Etnias", icono: "bi-people" },
  { key: "estados-civiles", titulo: "Estados civiles", icono: "bi-heart" },
  { key: "generos", titulo: "Géneros", icono: "bi-gender-ambiguous" },
  { key: "tipos-sangre", titulo: "Tipos de sangre", icono: "bi-droplet" },
];

// No es un catálogo: es la asignación de roles a usuarios.
export const SECCION_ROLES = {
  key: "roles",
  titulo: "Roles de usuario",
  icono: "bi-person-gear",
};

export const SECCIONES_ADMIN = [...SECCIONES_CATALOGO, SECCION_ROLES];

export const RUTA_ADMIN = "/gestion-catalogos";

// Lee ?seccion=... de la URL; si falta o no existe, abre la primera (Áreas).
export const seccionDesdeUrl = (search) => {
  const pedida = new URLSearchParams(search).get("seccion");
  return SECCIONES_ADMIN.some((s) => s.key === pedida)
    ? pedida
    : SECCIONES_ADMIN[0].key;
};
