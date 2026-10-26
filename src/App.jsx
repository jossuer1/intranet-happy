import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import AppRoutes from "./routes/AppRoutes";
import { queryClient } from "./lib/queryClient";
import { useAuthStore } from "./store/useAuthStore";

function SesionPerfil() {
  const token = useAuthStore(s => s.token);
  const user = useAuthStore(s => s.user);
  const fetchPerfil = useAuthStore(s => s.fetchPerfil);
  useQuery({ queryKey: ["sesion", "perfil"], queryFn: fetchPerfil, enabled: !!token && !user, retry: false });
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SesionPerfil />
      <AppRoutes />
    </QueryClientProvider>
  );
}

export default App;
