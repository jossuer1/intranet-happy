const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("jwt_token");

const getHeaders = (includeAuth = true, isMultipart = false) => {
  const headers = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  if (includeAuth && getToken()) {
    headers["Authorization"] = `Bearer ${getToken()}`;
  }
  return headers;
};

// Interceptor centralizado para procesar respuestas y capturar errores HTTP
async function handleResponse(respuesta) {
  if (respuesta.status === 401) {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login";
    throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
  }

  const isJson = respuesta.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson ? await respuesta.json() : null;

  if (!respuesta.ok) {
    const errorMsg =
      data?.mensaje ||
      data?.message ||
      `Error del servidor (${respuesta.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * AuthController
 */
export async function login(cedula, password) {
  const respuesta = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ usuario: cedula, contrasena: password }),
  });
  const data = await handleResponse(respuesta);
  if (data?.token) {
    localStorage.setItem("jwt_token", data.token);
  }
  return data;
}
export async function cambiarContrasenaObligatoria(
  idUsuario,
  contrasenaActual,
  nuevaContrasena,
) {
  const respuesta = await fetch(`${BASE_URL}/auth/cambiar-contrasena`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({
      idUsuario: idUsuario,
      contrasenaActual: contrasenaActual,
      nuevaContrasena: nuevaContrasena,
    }),
  });

  return await handleResponse(respuesta);
}

export async function solicitarRecuperacion(correo) {
  const respuesta = await fetch(`${BASE_URL}/auth/recuperar-contrasena`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ correo }),
  });
  return await handleResponse(respuesta);
}

/**
 * UsuariosController
 */
export async function crearUsuario(datosUsuario) {
  const esFormData = datosUsuario instanceof FormData;
  const respuesta = await fetch(`${BASE_URL}/usuarios`, {
    method: "POST",
    headers: getHeaders(true, esFormData),
    body: esFormData ? datosUsuario : JSON.stringify(datosUsuario),
  });
  return await handleResponse(respuesta);
}

export async function getTodosLosUsuarios() {
  const respuesta = await fetch(`${BASE_URL}/usuarios`, {
    headers: getHeaders(true),
  });
  return await handleResponse(respuesta);
}

// Alias para mantener compatibilidad con las vistas de Usuarios
export const getUsuarios = getTodosLosUsuarios;

export async function getUsuarioPorId(id) {
  const respuesta = await fetch(`${BASE_URL}/usuarios/${id}`, {
    headers: getHeaders(true),
  });
  return await handleResponse(respuesta);
}

export async function actualizarUsuario(id, datosUsuario) {
  const esFormData = datosUsuario instanceof FormData;
  const respuesta = await fetch(`${BASE_URL}/usuarios/${id}`, {
    method: "PUT",
    headers: getHeaders(true, esFormData),
    body: esFormData ? datosUsuario : JSON.stringify(datosUsuario),
  });
  return await handleResponse(respuesta);
}

export async function getMiPerfil() {
  const respuesta = await fetch(`${BASE_URL}/usuarios/mi-perfil`, {
    headers: getHeaders(true),
  });
  return await handleResponse(respuesta);
}

/**
 * ImagenesController
 */
export async function getImagenesActivas() {
  const respuesta = await fetch(`${BASE_URL}/imagenes`, {
    headers: getHeaders(true),
  });
  return await handleResponse(respuesta);
}

export async function getTodasLasImagenes() {
  const respuesta = await fetch(`${BASE_URL}/imagenes/todas`, {
    headers: getHeaders(true),
  });
  return await handleResponse(respuesta);
}

export async function agregarImagen(imagenDto) {
  const respuesta = await fetch(`${BASE_URL}/imagenes`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(imagenDto),
  });
  return await handleResponse(respuesta);
}

export async function actualizarImagen(id, imagenDto) {
  const respuesta = await fetch(`${BASE_URL}/imagenes/${id}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(imagenDto),
  });
  return await handleResponse(respuesta);
}

export async function desactivarImagen(id) {
  const respuesta = await fetch(`${BASE_URL}/imagenes/${id}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  return await handleResponse(respuesta);
}

/**
 * VacacionesController
 */
export async function getSaldoVacaciones(idUsuario) {
  const respuesta = await fetch(`${BASE_URL}/vacaciones/saldo/${idUsuario}`, {
    headers: getHeaders(true),
  });
  return await handleResponse(respuesta);
}

export async function getHistorialVacaciones(idUsuario) {
  const respuesta = await fetch(
    `${BASE_URL}/vacaciones/historial/${idUsuario}`,
    {
      headers: getHeaders(true),
    },
  );
  return await handleResponse(respuesta);
}

export async function getMisVacaciones() {
  const respuesta = await fetch(`${BASE_URL}/vacaciones/mis-vacaciones`, {
    headers: getHeaders(true),
  });
  return await handleResponse(respuesta);
}

export async function getTodasLasVacaciones() {
  const respuesta = await fetch(`${BASE_URL}/vacaciones/todas`, {
    headers: getHeaders(true),
  });
  return await handleResponse(respuesta);
}

// Alias para la pantalla de SaldosPersonal
export const getSaldosVacaciones = getTodasLasVacaciones;

export async function registrarDescuentoVacaciones(descuentoDto) {
  const respuesta = await fetch(`${BASE_URL}/vacaciones/descuento`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(descuentoDto),
  });
  return await handleResponse(respuesta);
}

export async function registrarAjusteVacaciones(ajusteDto) {
  const respuesta = await fetch(`${BASE_URL}/vacaciones/ajuste`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(ajusteDto),
  });
  return await handleResponse(respuesta);
}

export async function getResumenVacaciones() {
  const respuesta = await fetch(`${BASE_URL}/vacaciones/resumen`, {
    headers: getHeaders(true),
  });
  return await handleResponse(respuesta);
}

export async function registrarVacaciones(vacacionesDto) {
  const respuesta = await fetch(`${BASE_URL}/vacaciones`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(vacacionesDto),
  });
  return await handleResponse(respuesta);
}

// Alias para la carga de días
// Alias o función para la acreditación de días en saldos personales
export const acreditarDiasVacaciones = registrarAjusteVacaciones;
export const acreditarDias = registrarAjusteVacaciones;
