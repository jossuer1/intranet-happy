import { QueryClient } from "@tanstack/react-query";

// Cliente de caché único para toda la app. Vive en su propio módulo para que
// también lo pueda usar apiClient (fuera de React) y así invalidar la caché
// después de cada cambio hecho en el backend.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min: navegar entre pantallas no repide todo
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
