import { create } from "zustand";
import { login as apiLogin, getMiPerfil } from "../services/apiService";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("jwt_token") || null,
  cargando: false,

  login: async (cedula, contrasena) => {
    set({ cargando: true });
    try {
      const respuesta = await apiLogin(cedula, contrasena);

      // Si el backend indica cambio obligatorio
      if (respuesta && respuesta.debeCambiarContrasena) {
        set({ cargando: false });
        return { success: true, data: respuesta };
      }

      // Flujo normal con token
      if (respuesta && respuesta.token) {
        localStorage.setItem("jwt_token", respuesta.token);
        set({ token: respuesta.token, cargando: false });

        try {
          const perfil = await getMiPerfil();
          set({ user: perfil });
        } catch {
          // Si falla el perfil al momento, se reintenta luego
        }

        return { success: true, data: respuesta };
      }

      set({ cargando: false });
      return {
        success: false,
        mensaje: respuesta?.mensaje || "Cédula o contraseña incorrectas",
      };
    } catch (error) {
      set({ cargando: false });
      return {
        success: false,
        mensaje: error.message || "Error al conectar con el servidor",
      };
    }
  },

  logout: () => {
    localStorage.removeItem("jwt_token");
    set({ user: null, token: null });
  },
}));
