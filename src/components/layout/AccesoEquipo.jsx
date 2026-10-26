import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export default function AccesoEquipo({ rrhh = false, children }) {
  const user = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);
  const fetchPerfil = useAuthStore(s => s.fetchPerfil);
  const perfil = useQuery({ queryKey: ["sesion", "perfil"], queryFn: fetchPerfil, enabled: !!token && !user, retry: false });
  if (!token) return <Navigate to="/login" replace />;
  if (!user && perfil.isPending) return <div className="p-4" role="status">Cargando sesión…</div>;
  if (!user) return <div className="p-4" role="alert">No se pudo cargar tu sesión. <button className="btn btn-link" onClick={() => perfil.refetch()}>Reintentar</button></div>;
  if (rrhh ? String(user.rol).toUpperCase() !== "RRHH" : !user.esJefe) return <Navigate to="/dashboard" replace />;
  return children;
}
