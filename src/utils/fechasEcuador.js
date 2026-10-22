// Fechas en hora de Ecuador. El backend guarda en UTC; aquí se muestran en
// America/Guayaquil (UTC-5, sin horario de verano).

export const ZONA_ECUADOR = "America/Guayaquil";

// Si llega "2026-11-05T04:59:59" (sin zona) se interpreta como UTC.
const aDate = (valor) => {
  if (!valor) return null;
  if (valor instanceof Date) return isNaN(valor.getTime()) ? null : valor;
  let v = String(valor);
  if (/T/.test(v) && !/(Z|[+-]\d{2}:?\d{2})$/i.test(v)) v += "Z";
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

// dd/mm/aaaa
export const formatearFechaEC = (valor) => {
  const d = aDate(valor);
  if (!d) return null;
  return d.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: ZONA_ECUADOR,
  });
};

// dd/mm/aaaa hh:mm
export const formatearFechaHoraEC = (valor) => {
  const d = aDate(valor);
  if (!d) return null;
  return d.toLocaleString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: ZONA_ECUADOR,
  });
};

// "YYYY-MM-DD" de HOY en Ecuador (para el min de <input type="date">).
export const hoyEC = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: ZONA_ECUADOR });
