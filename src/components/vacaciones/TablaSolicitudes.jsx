import { formatearFecha } from "../../utils/dateUtils";
import TablaInteractiva from "../ui/TablaInteractiva";
import { useState } from "react";
import DescargarDocumentos from "./DescargarDocumentos";

const ESTADOS_SOLICITUD = {
  PENDIENTE_JEFE: {
    texto: "Pendiente jefe directo",
    clase: "bg-warning text-dark",
  },
  APROBADA: { texto: "Aprobada", clase: "bg-success" },
  RECHAZADA_JEFE: { texto: "Rechazada por el jefe", clase: "bg-danger" },
  ANULADA: { texto: "Anulada", clase: "bg-secondary" },
};

export function BadgeEstadoSolicitud({ estado }) {
  const info = ESTADOS_SOLICITUD[estado] || {
    texto: estado,
    clase: "bg-secondary",
  };
  return <span className={`badge ${info.clase}`}>{info.texto}</span>;
}

export function TablaSolicitudes({ solicitudes, loadingSolicitudes }) {
  const [estado, setEstado] = useState("");
  const filtradas = (solicitudes || []).filter(s => !estado || s.estado === estado);
  const columnas = [
    { name: "Desde", selector: s => s.fechaInicio || "", sortable: true, cell: s => formatearFecha(s.fechaInicio) },
    { name: "Hasta", selector: s => s.fechaFin || "", sortable: true, cell: s => formatearFecha(s.fechaFin) },
    { name: "Días", selector: s => s.diasSolicitados, sortable: true, width: "85px" },
    { name: "Motivo", selector: s => s.motivo || "", sortable: true, wrap: true, grow: 2 },
    { name: "Estado", selector: s => ESTADOS_SOLICITUD[s.estado]?.texto || s.estado || "", sortable: true,
      minWidth: "190px", cell: s => <BadgeEstadoSolicitud estado={s.estado} /> },
    { name: "Jefe", selector: s => s.jefeAprobadorNombre || "—", sortable: true, wrap: true },
    { name: "Documentos", button: true, minWidth: "150px", cell: s => s.estado === "APROBADA"
      ? <DescargarDocumentos idSolicitud={s.idSolicitud} /> : <span className="text-muted small">—</span> },
  ];
  return <TablaInteractiva key={estado} datos={filtradas} columnas={columnas} keyField="idSolicitud" cargando={loadingSolicitudes}
    filtros={<select className="form-select form-select-sm hp-filtro-tabla" aria-label="Filtrar solicitudes por estado" value={estado} onChange={e => setEstado(e.target.value)}>
      <option value="">Todos los estados</option>
      <option value="PENDIENTE_JEFE">Pendientes</option>
      <option value="RECHAZADA_JEFE">Rechazadas</option>
      <option value="APROBADA">Aprobadas</option>
      <option value="ANULADA">Anuladas</option>
    </select>}
    etiqueta="Buscar solicitud por fecha, motivo, estado o jefe…"
    buscarEn={s => `${formatearFecha(s.fechaInicio)} ${formatearFecha(s.fechaFin)} ${s.diasSolicitados} ${s.motivo || ""} ${ESTADOS_SOLICITUD[s.estado]?.texto || s.estado || ""} ${s.jefeAprobadorNombre || ""}`} />;
}

export default TablaSolicitudes;
