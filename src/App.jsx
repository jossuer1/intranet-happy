import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes/AppRoutes";

// Configuración del cliente de caché
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de caché antes de revalidar
      refetchOnWindowFocus: false, // Evita disparar peticiones al cambiar de pestaña
      retry: 1, // Intenta solo 1 vez si falla la petición
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
}

export default App;
