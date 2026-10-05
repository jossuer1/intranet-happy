import React from "react";
import { useHistorialUsuario } from "../../hooks/useVacaciones.js";
import DescargarDocumentos from "./DescargarDocumentos.jsx";
import { slugify } from "../../utils/descargas.js";

// Panel (modal centrado) con el saldo + historial de movimientos de un
// usuario. Se usa igual desde GestionVacaciones y SaldosPersonales: solo
// hay que pasarle el usuario seleccionado y un onClose.
function HistorialVacacionesPanel({ usuario, onClose }) {
  const idUsuario =
    usuario?.idUsuario || usuario?.idEmpleado || usuario?.id || null;

  const { data, isLoading, error } = useHistorialUsuario(idUsuario);

  // useHistorialUsuario devuelve { saldo, historial }
  const { saldo, historial } = data || {};
  const movimientos = Array.isArray(historial) ? historial : [];

  if (!usuario) return null;

  // Prefijo para los archivos descargados: persona + período
  // Ej: juan-carlos-perez-gomez-2026-10-07_2026-10-15
  const prefijoArchivo = (mov) => {
    const slug = slugify(usuario.nombre || usuario.nombres || "colaborador");
    const ini = String(mov.fechaInicio || "").split("T")[0];
    const fin = String(mov.fechaFin || "").split("T")[0];
    return `${slug}-${ini}_${fin}`;
  };

  // Determina si el movimiento es un Descuento (toma de vacaciones) o un Ajuste/Acreditación
  const getTipoInfo = (mov) => {
    const tipo = (mov.tipoMovimiento || "").toUpperCase();
    const esDescuento = tipo === "DESCUENTO";

    if (esDescuento) {
      return {
        label: "Vacaciones",
        badgeClass: "bg-danger-subtle text-danger border border-danger-subtle",
        signo: "−",
      };
    }
    return {
      label: "Ajuste",
      badgeClass: "bg-success-subtle text-success border border-success-subtle",
      signo: "+",
    };
  };

  return (
    <>
      {/* Backdrop, clic afuera cierra el panel pero no navega */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      ></div>

      {/* Contenedor centrado en pantalla */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1050,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          pointerEvents: "none",
        }}
      >
        <div
          className="shadow-lg bg-white rounded-4 border"
          style={{
            width: "900px",
            maxWidth: "100%",
            maxHeight: "88vh",
            display: "flex",
            flexDirection: "column",
            pointerEvents: "auto",
          }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <div>
              <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                <i className="bi bi-clock-history text-primary"></i>
                Historial de Vacaciones
              </h6>
              <small className="text-muted">
                {usuario.nombre || usuario.nombres}
              </small>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div
            className="p-3"
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {isLoading ? (
              <div className="text-center my-4">
                <div
                  className="spinner-border spinner-border-sm text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger py-2 px-3 small mb-0">
                {error.message || "No se pudo cargar el historial."}
              </div>
            ) : (
              <>
                {/* Resumen de saldo (siempre visible, no hace scroll) */}
                {saldo && (
                  <div
                    className="row g-2 mb-3 text-center"
                    style={{ flexShrink: 0 }}
                  >
                    <div className="col-3">
                      <div className="bg-light rounded-3 p-2">
                        <div className="fs-6 fw-bold text-dark">
                          {saldo.diasAsignados}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Asignados
                        </div>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="bg-light rounded-3 p-2">
                        <div className="fs-6 fw-bold text-danger">
                          {saldo.diasDescontados}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Tomados
                        </div>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="bg-light rounded-3 p-2">
                        <div className="fs-6 fw-bold text-success">
                          {saldo.diasAjustados}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Ajustados
                        </div>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="bg-primary-subtle rounded-3 p-2">
                        <div className="fs-6 fw-bold text-primary">
                          {saldo.diasDisponibles}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Disponibles
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de movimientos: scroll propio, no rompe el resto del panel */}
                {movimientos.length === 0 ? (
                  <p className="text-muted text-center small py-3 mb-0">
                    Este colaborador aún no registra movimientos de vacaciones.
                  </p>
                ) : (
                  <ul
                    className="list-unstyled m-0"
                    style={{
                      overflowY: "auto",
                      maxHeight: "55vh",
                      paddingRight: "4px",
                    }}
                  >
                    {movimientos.map((mov) => {
                      const { label, badgeClass, signo } = getTipoInfo(mov);
                      const tieneRango = mov.fechaInicio && mov.fechaFin;

                      return (
                        <li
                          key={mov.idVacacion}
                          className="border rounded-3 p-3 mb-2 d-flex flex-wrap align-items-center gap-3"
                        >
                          {/* Columna 1: tipo, días y fecha de registro */}
                          <div style={{ width: "150px" }}>
                            <span
                              className={`badge rounded-pill ${badgeClass}`}
                            >
                              {label}
                            </span>
                            <div
                              className={`fw-bold fs-6 mt-1 ${
                                signo === "−" ? "text-danger" : "text-success"
                              }`}
                            >
                              {signo}
                              {mov.diasTomados} días
                            </div>
                            <small className="text-muted">
                              {mov.fechaRegistro
                                ? String(mov.fechaRegistro).split("T")[0]
                                : ""}
                            </small>
                          </div>

                          {/* Columna 2: período y observación */}
                          <div
                            className="flex-grow-1"
                            style={{ minWidth: "240px", flexBasis: "300px" }}
                          >
                            {tieneRango && (
                              <div className="small text-dark mb-1 d-flex align-items-center gap-2">
                                <i className="bi bi-calendar-range text-muted"></i>
                                <span>
                                  <strong>Desde:</strong>{" "}
                                  {String(mov.fechaInicio).split("T")[0]}{" "}
                                  <span className="text-muted">→</span>{" "}
                                  <strong>Hasta:</strong>{" "}
                                  {String(mov.fechaFin).split("T")[0]}
                                </span>
                              </div>
                            )}
                            {mov.observacion && (
                              <div className="small text-muted">
                                <i className="bi bi-chat-left-text me-1"></i>
                                {mov.observacion}
                              </div>
                            )}
                          </div>

                          {/* Columna 3: quién lo registró y documentos */}
                          <div
                            className="d-flex flex-column align-items-end gap-2 text-end"
                            style={{ width: "200px", fontSize: "0.75rem" }}
                          >
                            <span className="text-muted">
                              <i className="bi bi-person-check me-1"></i>
                              Registrado por: {mov.registradoPorNombre}
                            </span>
                            {mov.idSolicitud && (
                              <DescargarDocumentos
                                idSolicitud={mov.idSolicitud}
                                prefijo={prefijoArchivo(mov)}
                                variante="danger"
                              />
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default HistorialVacacionesPanel;
