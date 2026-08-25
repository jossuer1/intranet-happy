import { apiClient } from "./apiClient";

export const authService = {
  login: async (cedula, password) => {
    const data = await apiClient.post(
      "/auth/login",
      { usuario: cedula, contrasena: password },
      false,
      true,
    );
    if (data?.token) {
      localStorage.setItem("jwt_token", data.token);
    }
    return data;
  },
  cambiarContrasena: (idUsuario, contrasenaActual, nuevaContrasena) =>
    apiClient.post(
      "/auth/cambiar-contrasena",
      { idUsuario, contrasenaActual, nuevaContrasena },
      false,
      true,
    ),
  solicitarRecuperacion: (correo) =>
    apiClient.post("/auth/recuperar-contrasena", { correo }, false, true),
};
