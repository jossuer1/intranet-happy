import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "../components/layout/AppLayout";
import SectionHeader from "../components/layout/SectionHeader";
import ExpedienteColaborador from "../components/usuarios/ExpedienteColaborador";
import { getPorId } from "../services/usuariosService";
import { useAuthStore } from "../store/useAuthStore";

export default function Perfiles() {
  const { idUsuario } = useParams();
  const user = useAuthStore(s => s.user);
  const consulta = useQuery({ queryKey: ["usuarios", "detalle", Number(idUsuario)], queryFn: () => getPorId(idUsuario), enabled: !!idUsuario, staleTime: 0 });
  if (user && String(user.rol).toUpperCase() !== "RRHH") return <Navigate to="/dashboard" replace />;
  return <AppLayout><SectionHeader titulo="Expediente del colaborador" volverA="/gestion-usuarios" />
    <div className="container-fluid mb-4"><div className="card border-0 shadow-sm">
      {consulta.isPending ? <p className="p-4 text-muted" role="status">Cargando expediente…</p>
        : consulta.isError ? <div className="alert alert-danger m-4" role="alert">{consulta.error.message}</div>
        : <ExpedienteColaborador key={idUsuario} info={consulta.data} />}
    </div></div>
  </AppLayout>;
}
