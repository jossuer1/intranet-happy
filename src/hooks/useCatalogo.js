import { useQuery } from "@tanstack/react-query";
import { catalogosService } from "../services/catalogosService";

export const useCatalogosFormulario = () =>
  useQuery({
    queryKey: ["catalogos-formulario"],
    queryFn: catalogosService.getCatalogosFormulario,
    staleTime: 1000 * 60 * 60, // 1 hora en caché
  });
