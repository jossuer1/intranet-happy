import { apiClient } from "./apiClient";

export const crearUsuario = (datosUsuario) =>
  apiClient.post("/usuarios", datosUsuario);

export const getTodos = () => apiClient.get("/usuarios");

// Alias para compatibilidad con GestionUsuarios.jsx
export const getUsuarios = getTodos;

export const getPorId = (id) => apiClient.get(`/usuarios/${id}`);

export const getMiPerfil = () => apiClient.get("/usuarios/mi-perfil");

// Autogestión del empleado (solo cuando RRHH activó puedeActualizarPerfil).
// El backend toma el id del token, valida el flag, ignora campos sensibles
// y apaga puedeActualizarPerfil al guardar. No usa /usuarios/{id} (RRHH).
// Ahora NO aplica al instante: el backend responde 202 { idSolicitud, mensaje }
// y deja una solicitud PENDIENTE que RRHH debe aprobar o rechazar.
export const enviarMiPerfil = (datosPerfil) =>
  apiClient.put("/usuarios/mi-perfil", datosPerfil);

// Alias por compatibilidad con el código existente.
export const actualizarMiPerfil = enviarMiPerfil;

export const actualizar = (id, datosUsuario) =>
  apiClient.put(`/usuarios/${id}`, datosUsuario);

export const actualizarUsuario = actualizar;

// Ventana de actualización de UN usuario (RRHH).
// Al habilitar, fechaLimite ("YYYY-MM-DD") es obligatoria; al cerrar no se envía.
export const permisoActualizacion = (idUsuario, habilitar, fechaLimite) =>
  apiClient.patch(
    `/usuarios/${idUsuario}/permiso-actualizacion`,
    habilitar ? { habilitar: true, fechaLimite } : { habilitar: false },
  );

// Alias por compatibilidad con el código existente.
export const actualizarPermisoPerfil = permisoActualizacion;

// Habilitación masiva (RRHH): a todos los activos o a los ids indicados.
// Devuelve { habilitados, omitidosPorSolicitudPendiente, fechaLimite }.
export const habilitarActualizacion = ({
  todosActivos = false,
  idsUsuarios = [],
  fechaLimite,
}) =>
  apiClient.post("/usuarios/habilitar-actualizacion", {
    todosActivos,
    idsUsuarios: todosActivos ? [] : idsUsuarios,
    fechaLimite,
  });

export const actualizarVacaciones = (idUsuario, dto) =>
  apiClient.patch(`/usuarios/${idUsuario}/vacaciones`, dto);

export const actualizarVacacionesUsuario = actualizarVacaciones;

// Activa (true) o desactiva (false) la cuenta de un usuario. Un usuario
// desactivado no puede iniciar sesión ni cambiar su contraseña.
export const actualizarEstadoUsuario = (idUsuario, activar) =>
  apiClient.patch(`/usuarios/${idUsuario}/estado`, { activar });

// Sube/reemplaza la foto de perfil (multipart). Devuelve { urlImagenPerfil }.
export const subirFotoPerfil = (idUsuario, archivo) => {
  const formData = new FormData();
  formData.append("foto", archivo);
  return apiClient.post(`/usuarios/${idUsuario}/foto`, formData);
};

// Exportación por objeto
export const usuariosService = {
  crearUsuario,
  getTodos,
  getUsuarios,
  getPorId,
  getMiPerfil,
  actualizarMiPerfil,
  enviarMiPerfil,
  actualizar,
  actualizarUsuario,
  actualizarVacaciones,
  actualizarVacacionesUsuario,
  actualizarEstadoUsuario,
  actualizarPermisoPerfil,
  permisoActualizacion,
  habilitarActualizacion,
  subirFotoPerfil,
};
