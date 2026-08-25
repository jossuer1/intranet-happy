// hooks/useVacaciones.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMisVacaciones,
  getSaldoVacaciones,
  getHistorialVacaciones,
  registrarDescuentoVacaciones,
} from "../services/apiService";

// Hook para consultar mis vacaciones (Mantiene caché sin pedir al backend en cada render)
export const useMisVacaciones = () => {
  return useQuery({
    queryKey: ["vacaciones", "mis-vacaciones"],
    queryFn: getMisVacaciones,
    staleTime: 1000 * 60 * 5, // 5 minutos de caché antes de revalidar
  });
};

// Hook para consultar historial por usuario
export const useHistorialUsuario = (idUsuario) => {
  return useQuery({
    queryKey: ["vacaciones", "historial", idUsuario],
    queryFn: () =>
      Promise.all([
        getSaldoVacaciones(idUsuario),
        getHistorialVacaciones(idUsuario),
      ]),
    enabled: !!idUsuario, // Solo ejecuta si el ID existe
  });
};

// Hook para mutaciones (Aplicar descuento y refrescar la caché automáticamente)
export const useAplicarDescuento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registrarDescuentoVacaciones,
    onSuccess: () => {
      // Invalida la caché e invalida los datos viejos automáticamente
      queryClient.invalidateQueries({ queryKey: ["vacaciones"] });
    },
  });
};
