// ¿La cuenta está activa? (el listado puede traer estado como texto, número o boolean)
export const estaActivo = (u) =>
  u?.estado === "Activo" ||
  u?.estado === 1 ||
  u?.estado === true ||
  u?.idEstado === 1;
