import React from "react";
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
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Desde</th>
            <th>Hasta</th>
            <th>Días</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th>Jefe</th>
            <th className="text-end">Documentos</th>
          </tr>
        </thead>
        <tbody>
          {loadingSolicitudes ? (
            <tr>
              <td colSpan={7} className="text-center text-muted py-4">
                <div
                  className="spinner-border spinner-border-sm text-primary me-2"
                  role="status"
                ></div>
                Cargando solicitudes...
              </td>
            </tr>
          ) : !solicitudes || solicitudes.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-muted py-4">
                No has enviado solicitudes de vacaciones todavía.
              </td>
            </tr>
          ) : (
            solicitudes.map((s) => (
              <tr key={s.idSolicitud}>
                <td>{new Date(s.fechaInicio).toLocaleDateString()}</td>
                <td>{new Date(s.fechaFin).toLocaleDateString()}</td>
                <td>
                  <span className="fw-semibold">{s.diasSolicitados}</span>
                </td>
                <td className="small text-muted">{s.motivo}</td>
                <td>
                  <BadgeEstadoSolicitud estado={s.estado} />
                </td>
                <td className="small text-muted">
                  {s.jefeAprobadorNombre || "—"}
                </td>
                <td className="text-end">
                  {s.estado === "APROBADA" ? (
                    <DescargarDocumentos idSolicitud={s.idSolicitud} />
                  ) : (
                    <span className="text-muted small">—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TablaSolicitudes;
