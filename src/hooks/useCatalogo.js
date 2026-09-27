import { useQuery } from "@tanstack/react-query";
import { catalogosService } from "../services/catalogosService";

export const useCatalogosFormulario = () => {
  return useQuery({
    queryKey: ["catalogos-formulario"],
    queryFn: async () => {
      const [areas, cargos, ciudades, generos, estadosCiviles, etnias, tiposSangre] =
        await Promise.all([
          catalogosService.getAreas(),
          catalogosService.getCargos(),
          catalogosService.getCiudades(),
          catalogosService.getGeneros(),
          catalogosService.getEstadosCiviles(),
          catalogosService.getEtnias(),
          catalogosService.getTiposSangre(),
        ]);
      return { areas, cargos, ciudades, generos, estadosCiviles, etnias, tiposSangre };
    },
    staleTime: 1000 * 60 * 60, // Caché dura 1 hora (estos catálogos rara vez cambian)
  });
};
