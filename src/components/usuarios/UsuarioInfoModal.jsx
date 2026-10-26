import { useQuery } from "@tanstack/react-query";
import ModalDialog from "../ui/ModalDialog";
import ExpedienteColaborador from "./ExpedienteColaborador";
import { getPorId } from "../../services/usuariosService";

export default function UsuarioInfoModal({ usuario, onClose }) {
  const consulta = useQuery({ queryKey: ["usuarios", "detalle", usuario?.idUsuario],
    queryFn: () => getPorId(usuario.idUsuario), enabled: !!usuario?.idUsuario, staleTime: 0 });
  if (!usuario) return null;
  return <ModalDialog titulo="Expediente del colaborador" onClose={onClose} size="xl" bodyClassName="p-0">
    {consulta.isPending ? <p className="text-muted p-4" role="status">Cargando expediente completo…</p>
      : consulta.isError ? <div className="alert alert-danger m-4" role="alert">{consulta.error.message}<button className="btn btn-link" onClick={() => consulta.refetch()}>Reintentar</button></div>
      : <ExpedienteColaborador key={usuario.idUsuario} info={consulta.data} />}
  </ModalDialog>;
}
