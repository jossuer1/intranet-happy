import { BadgeEstado } from "../solicitudes/ComparativoSolicitud";
import { formatearFechaEC, formatearFechaHoraEC } from "../../utils/fechasEcuador";

const masReciente = (solicitudes = []) =>
  [...solicitudes].sort(
    (a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud),
  )[0];

// Banners del flujo de actualización (rechazo en ROJO, ventana abierta en ámbar,
// en revisión en azul). `children` se muestra a la derecha (botones).
export function BannersActualizacion({
  puedeActualizarPerfil,
  puedeActualizarHasta,
  tieneSolicitudPendiente,
  solicitudes,
  children,
}) {
  const hasta = formatearFechaEC(puedeActualizarHasta);
  const ultima = masReciente(solicitudes);

  if (puedeActualizarPerfil && ultima?.estado === "RECHAZADA") {
    return (
      <div className="alert alert-danger shadow-sm d-flex justify-content-between align-items-start gap-3">
        <div>
          <div className="fw-bold mb-1">
            <i className="bi bi-x-octagon me-2"></i>
            RRHH rechazó tu última solicitud
          </div>
          <div className="mb-1">
            <span className="fw-semibold">Motivo: </span>
            {ultima.observacionRrhh || "Sin motivo indicado."}
          </div>
          <div className="small">
            Corrige y vuelve a enviar
            {hasta ? ` antes del ${hasta}` : ""}.
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (puedeActualizarPerfil) {
    return (
      <div className="alert alert-warning shadow-sm d-flex justify-content-between align-items-center gap-3">
        <div>
          <i className="bi bi-person-vcard me-2"></i>
          RRHH habilitó la actualización de tu información
          {hasta ? ` hasta ${hasta}` : ""}.
        </div>
        {children}
      </div>
    );
  }

  if (tieneSolicitudPendiente) {
    return (
      <div className="alert alert-info shadow-sm d-flex justify-content-between align-items-center gap-3">
        <div>
          <i className="bi bi-hourglass-split me-2"></i>
          Tus cambios están en revisión por RRHH.
        </div>
        <button type="button" className="btn btn-sm btn-secondary" disabled>
          Actualizar mi información
        </button>
      </div>
    );
  }

  return null;
}

// Historial de solicitudes del empleado.
function MisSolicitudes({ solicitudes = [], cargando = false }) {
  if (!cargando && solicitudes.length === 0) return null;

  const filas = [...solicitudes].sort(
    (a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud),
  );

  return (
    <div className="card border-0 shadow-sm mt-3">
      <div className="card-body p-3 p-lg-4">
        <h6 className="fw-bold mb-3">
          <i className="bi bi-clock-history me-2 text-brand"></i>
          Mis solicitudes
        </h6>

        {cargando ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary"></div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Observación de RRHH</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((s) => (
                  <tr key={s.idSolicitud}>
                    <td className="text-nowrap">
                      {formatearFechaHoraEC(s.fechaSolicitud) || "—"}
                    </td>
                    <td>
                      <BadgeEstado estado={s.estado} />
                    </td>
                    <td
                      className={
                        s.estado === "RECHAZADA" ? "text-danger" : "text-muted"
                      }
                    >
                      {s.observacionRrhh || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MisSolicitudes;
