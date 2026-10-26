import ModalDialog from "../ui/ModalDialog";
import PersonaCelda from "../ui/PersonaCelda";
import { useHistorialUsuario } from "../../hooks/useVacaciones.js";
import DescargarDocumentos from "./DescargarDocumentos.jsx";
import { slugify } from "../../utils/descargas.js";
import { formatearFecha } from "../../utils/dateUtils.js";

export default function HistorialVacacionesPanel({ usuario, onClose, mostrarDocumentos = true }) {
  const idUsuario = usuario?.idUsuario || usuario?.idEmpleado || usuario?.id;
  const consulta = useHistorialUsuario(idUsuario, usuario?.tieneVacaciones !== false);
  const { saldo, historial = [] } = consulta.data || {};
  if (!usuario) return null;
  const nombre = usuario.nombre || usuario.nombres || "Colaborador";
  return <ModalDialog titulo="Historial de vacaciones" onClose={onClose} size="xl">
    <div className="mb-4"><PersonaCelda nombre={nombre} detalle={usuario.cargo || usuario.departamento} /></div>
    {consulta.isLoading ? <p role="status" className="text-muted py-4">Cargando historial…</p>
      : consulta.error ? <div className="alert alert-danger" role="alert">{consulta.error.message}</div> : <>
      {saldo && <div className="hp-metricas mb-4">
        {[["Asignados", saldo.diasAsignados], ["Tomados", saldo.diasDescontados], ["Ajustados", saldo.diasAjustados], ["Disponibles", saldo.diasDisponibles]].map(([etiqueta, valor]) =>
          <div className="hp-metrica" key={etiqueta}><strong>{valor}</strong><small>{etiqueta}</small></div>)}
      </div>}
      <div className="table-responsive"><table className="table table-hover mb-0">
        <thead><tr><th>Movimiento</th><th>Período</th><th>Días</th><th>Observación</th><th>Registrado por</th>{mostrarDocumentos && <th>Documentos</th>}</tr></thead>
        <tbody>{historial.map(m => <tr key={m.idVacacion}>
          <td><span className={`badge ${m.tipoMovimiento === "Descuento" ? "bg-warning" : "bg-success"}`}>{m.tipoMovimiento === "Descuento" ? "Vacaciones" : "Ajuste"}</span><small className="d-block text-muted mt-1">{formatearFecha(m.fechaRegistro)}</small></td>
          <td>{m.fechaInicio ? <>{formatearFecha(m.fechaInicio)}<span className="d-block text-muted small">hasta {formatearFecha(m.fechaFin)}</span></> : "Sin período"}</td>
          <td className="fw-semibold text-nowrap">{m.tipoMovimiento === "Descuento" ? "−" : "+"}{m.diasTomados}</td>
          <td>{m.observacion || "—"}</td><td>{m.registradoPorNombre || "Sistema"}</td>
          {mostrarDocumentos && <td>{m.idSolicitud ? <DescargarDocumentos idSolicitud={m.idSolicitud} prefijo={`${slugify(nombre)}-${String(m.fechaInicio || "").split("T")[0]}`} /> : "—"}</td>}
        </tr>)}</tbody>
      </table></div>
      {!historial.length && <p className="text-center text-muted py-4">No hay movimientos de vacaciones registrados.</p>}
    </>}
  </ModalDialog>;
}
