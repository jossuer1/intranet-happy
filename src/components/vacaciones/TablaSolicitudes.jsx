import React from "react";

const ESTADOS_SOLICITUD = {
  PENDIENTE_JEFE: {
    texto: "Pendiente jefe directo",
    clase: "bg-warning text-dark",
  },
  PENDIENTE_RRHH: { texto: "Pendiente RRHH", clase: "bg-info text-dark" },
  APROBADA: { texto: "Aprobada", clase: "bg-success" },
  RECHAZADA_JEFE: { texto: "Rechazada por el jefe", clase: "bg-danger" },
  RECHAZADA_RRHH: { texto: "Rechazada por RRHH", clase: "bg-danger" },
};

function BadgeEstadoSolicitud({ estado }) {
  const info = ESTADOS_SOLICITUD[estado] || {
    texto: estado,
    clase: "bg-secondary",
  };
  return <span className={`badge ${info.clase}`}>{info.texto}</span>;
}

export function TablaSolicitudes({
  solicitudes,
  loadingSolicitudes,
  descargandoId,
  onDescargarConstancia,
}) {
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
            <th>RRHH</th>
            <th className="text-end">Constancia</th>
          </tr>
        </thead>
        <tbody>
          {loadingSolicitudes ? (
            <tr>
              <td colSpan={8} className="text-center text-muted py-4">
                <div
                  className="spinner-border spinner-border-sm text-primary me-2"
                  role="status"
                ></div>
                Cargando solicitudes...
              </td>
            </tr>
          ) : !solicitudes || solicitudes.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center text-muted py-4">
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
                <td className="small text-muted">
                  {s.rrhhAprobadorNombre || "—"}
                </td>
                <td className="text-end">
                  {s.estado === "APROBADA" ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      disabled={descargandoId === s.idSolicitud}
                      onClick={() => onDescargarConstancia(s.idSolicitud)}
                      title="Descargar constancia PDF"
                    >
                      <i className="bi bi-file-earmark-pdf me-1"></i>
                      PDF
                    </button>
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
