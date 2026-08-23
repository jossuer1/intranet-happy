import { create } from "zustand";
import {
  getMisVacaciones,
  getTodasLasVacaciones,
  getSaldoVacaciones,
  getHistorialVacaciones,
  registrarDescuentoVacaciones,
  registrarAjusteVacaciones,
} from "../services/api";

export const useVacacionesStore = create((set, get) => ({
  misVacaciones: [],
  todasLasVacaciones: [],
  saldoActual: null,
  historial: [],
  loading: false,
  error: null,

  fetchMisVacaciones: async () => {
    set({ loading: true });
    try {
      const data = await getMisVacaciones();
      set({ misVacaciones: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchHistorialUsuario: async (idUsuario) => {
    set({ loading: true });
    try {
      const [saldo, historial] = await Promise.all([
        getSaldoVacaciones(idUsuario),
        getHistorialVacaciones(idUsuario),
      ]);
      set({ saldoActual: saldo, historial, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  aplicarDescuento: async (descuentoDto) => {
    set({ loading: true });
    try {
      await registrarDescuentoVacaciones(descuentoDto);
      await get().fetchMisVacaciones(); // Refresca lista tras descontar
      set({ loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));
