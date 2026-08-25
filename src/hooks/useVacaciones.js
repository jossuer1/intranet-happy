import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vacacionesService } from "../services/vacacionesService";

export const useMisVacaciones = () => {
  return useQuery({
    queryKey: ["vacaciones", "mis-vacaciones"],
    queryFn: vacacionesService.getMisVacaciones,
  });
};

export const useResumenVacaciones = () => {
  return useQuery({
    queryKey: ["vacaciones", "resumen"],
    queryFn: vacacionesService.getResumen,
  });
};

export const useHistorialUsuario = (idUsuario) => {
  return useQuery({
    queryKey: ["vacaciones", "historial", idUsuario],
    queryFn: async () => {
      const [saldo, historial] = await Promise.all([
        vacacionesService.getSaldo(idUsuario),
        vacacionesService.getHistorial(idUsuario),
      ]);
      return { saldo, historial };
    },
    enabled: !!idUsuario,
  });
};

export const useRegistrarDescuento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vacacionesService.registrarDescuento,
    onSuccess: () => {
      // Invalida las consultas de vacaciones para que React Query pida los datos actualizados solo si es necesario
      queryClient.invalidateQueries({ queryKey: ["vacaciones"] });
    },
  });
};
