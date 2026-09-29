import React, { useState } from "react";

function badgeTipoMovimiento(tipo) {
  return tipo === "Descuento" ? "bg-danger" : "bg-success";
}

export function TablaMovimientos({ movimientos, loadingHistorial }) {
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);

  return (
    <>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Tipo</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Días</th>
              <th>Observación</th>
              <th>Registrado por</th>
              <th className="text-center">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {loadingHistorial ? (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  <div
                    className="spinner-border spinner-border-sm text-primary me-2"
                    role="status"
                  ></div>
                  Cargando historial de movimientos...
                </td>
              </tr>
            ) : !movimientos || movimientos.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No tienes movimientos de vacaciones registrados.
                </td>
              </tr>
            ) : (
              movimientos.map((m) => (
                <tr key={m.idVacacion}>
                  <td>
                    <span
                      className={`badge ${badgeTipoMovimiento(m.tipoMovimiento)}`}
                    >
                      {m.tipoMovimiento}
                    </span>
                  </td>
                  <td>
                    {m.fechaInicio
                      ? new Date(m.fechaInicio).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    {m.fechaFin
                      ? new Date(m.fechaFin).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <span className="fw-semibold">{m.diasTomados}</span>
                  </td>
                  <td
                    className="text-muted small text-truncate"
                    style={{ maxWidth: "220px" }}
                  >
                    {m.observacion || "—"}
                  </td>
                  <td className="text-muted small">{m.registradoPorNombre}</td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-circle"
                      onClick={() => setMovimientoSeleccionado(m)}
                      title="Ver detalle del movimiento"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETALLE DE MOVIMIENTO (OJITO) */}
      {movimientoSeleccionado && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Detalle del Movimiento</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMovimientoSeleccionado(null)}
                ></button>
              </div>
              <div className="modal-body py-3">
                <div className="mb-3 d-flex align-items-center gap-2">
                  <span className="fw-semibold">Tipo de Movimiento:</span>
                  <span
                    className={`badge ${badgeTipoMovimiento(movimientoSeleccionado.tipoMovimiento)}`}
                  >
                    {movimientoSeleccionado.tipoMovimiento}
                  </span>
                </div>

                <div className="row g-2 mb-3 bg-light p-2 rounded">
                  <div className="col-6">
                    <small className="text-muted d-block">Fecha Inicio</small>
                    <span className="fw-semibold">
                      {movimientoSeleccionado.fechaInicio
                        ? new Date(
                            movimientoSeleccionado.fechaInicio,
                          ).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Fecha Fin</small>
                    <span className="fw-semibold">
                      {movimientoSeleccionado.fechaFin
                        ? new Date(
                            movimientoSeleccionado.fechaFin,
                          ).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">Días afectación</small>
                  <span className="fs-5 fw-bold text-brand">
                    {movimientoSeleccionado.diasTomados} día(s)
                  </span>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">
                    Observación / Motivo
                  </small>
                  <p className="bg-light p-2 rounded small text-dark mb-0 border">
                    {movimientoSeleccionado.observacion ||
                      "Sin observación registrada."}
                  </p>
                </div>

                <div>
                  <small className="text-muted d-block">Registrado por</small>
                  <span className="fw-semibold text-secondary">
                    {movimientoSeleccionado.registradoPorNombre || "Sistema"}
                  </span>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setMovimientoSeleccionado(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TablaMovimientos;
