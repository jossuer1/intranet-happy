import { create } from "zustand";
import { authService } from "../services/authService";
import { usuariosService } from "../services/usuariosService";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("jwt_token") || null,
  cargando: false,

  login: async (cedula, contrasena) => {
    set({ cargando: true });
    try {
      const respuesta = await authService.login(cedula, contrasena);

      if (respuesta?.debeCambiarContrasena) {
        set({ cargando: false });
        return { success: true, data: respuesta };
      }

      if (respuesta?.token) {
        localStorage.setItem("jwt_token", respuesta.token);
        const perfil = await usuariosService.getMiPerfil();
        set({
          token: respuesta.token,
          user: perfil,
          cargando: false,
        });
        return { success: true, data: respuesta };
      }

      set({ cargando: false });
      return {
        success: false,
        mensaje: respuesta?.mensaje || "Credenciales incorrectas",
      };
    } catch (error) {
      set({ cargando: false });
      return { success: false, mensaje: error.message };
    }
  },

  logout: () => {
    localStorage.removeItem("jwt_token");
    set({ user: null, token: null });
  },

  // Vuelve a pedir el perfil al backend. Se usa, entre otros casos, justo
  // después de que el usuario guarda su autogestión de perfil: el backend
  // apaga "puedeActualizarPerfil" al recibir ese guardado, y este fetch trae
  // el user actualizado para que el bloqueo en AppLayout se levante solo.
  fetchPerfil: async () => {
    try {
      const perfil = await usuariosService.getMiPerfil();
      set({ user: perfil });
      return perfil;
    } catch (error) {
      return null;
    }
  },
}));
