/**
 * Calcula la edad exacta a partir de una fecha de nacimiento.
 * @param {string | Date} fechaNacimiento - Fecha de nacimiento (ej. "2006-05-15" o un objeto Date).
 * @returns {number} Edad en años cumplidos.
 */
export function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = nacimiento.getMonth();

  // Ajustar si aún no cumple años en el año actual
  if (
    mesActual < mesNacimiento ||
    (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())
  ) {
    edad--;
  }

  return edad;
}

/**
 * Determina la generación sociodemográfica según el año de nacimiento.
 * @param {string | Date} fechaNacimiento - Fecha de nacimiento.
 * @returns {string} Nombre de la generación.
 */
export function obtenerGeneracion(fechaNacimiento) {
  const nacimiento = new Date(fechaNacimiento);
  const anio = nacimiento.getFullYear();

  if (isNaN(anio)) {
    return "Fecha no válida";
  }

  if (anio >= 1946 && anio <= 1964) {
    return "Baby Boomer";
  } else if (anio >= 1965 && anio <= 1980) {
    return "Generación X";
  } else if (anio >= 1981 && anio <= 1996) {
    return "Millennial (Gen Y)";
  } else if (anio >= 1997 && anio <= 2012) {
    return "Generación Z";
  } else if (anio >= 2013) {
    return "Generación Alfa";
  } else {
    return "Generación Silenciosa o anterior";
  }
}
