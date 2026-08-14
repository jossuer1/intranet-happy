import React, { useState } from "react";
import AppLayout from "../components//layout/AppLayout";

function GestionVacaciones() {
  const [personal, setPersonal] = useState([
    {
      id: 1,
      nombre: "Carlos Mendoza",
      departamento: "Tecnología",
      fechaIngreso: "15/01/2022",
      diasGanados: 30,
      diasTomados: 10,
      saldoDisponible: 20,
    },
    {
      id: 2,
      nombre: "Ana Gutiérrez",
      departamento: "Recursos Humanos",
      fechaIngreso: "01/06/2021",
      diasGanados: 45,
      diasTomados: 15,
      saldoDisponible: 30,
    },
  ]);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [tipoOperacion, setTipoOperacion] = useState("DESCUENTO"); // "DESCUENTO" o "ACREDITACION"
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [diasAcreditar, setDiasAcreditar] = useState("");
  const [motivo, setMotivo] = useState("");

  // Calcular la diferencia de días entre fechas de inicio y fin
  const calcularDiasRango = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = fin - inicio;
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Incluye el día de inicio
    return diffDays;
  };

  const abrirModal = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setTipoOperacion("DESCUENTO");
    setFechaInicio("");
    setFechaFin("");
    setDiasAcreditar("");
    setMotivo("");
  };

  const guardarRegistro = () => {
    const diasAfectados =
      tipoOperacion === "DESCUENTO"
        ? calcularDiasRango()
        : Number(diasAcreditar);

    if (diasAfectados <= 0) return;

    setPersonal((prev) =>
      prev.map((u) => {
        if (u.id === usuarioSeleccionado.id) {
          if (tipoOperacion === "DESCUENTO") {
            return {
              ...u,
              diasTomados: u.diasTomados + diasAfectados,
              saldoDisponible: u.saldoDisponible - diasAfectados,
            };
          } else {
            return {
              ...u,
              diasGanados: u.diasGanados + diasAfectados,
              saldoDisponible: u.saldoDisponible + diasAfectados,
            };
          }
        }
        return u;
      }),
    );
    setUsuarioSeleccionado(null);
  };

  return (
    <AppLayout usuarioRol="RRHH">
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div>
            <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
              <i className="bi bi-calendar2-range text-primary"></i>
              Gestión de Vacaciones
            </h6>
            <small className="text-muted">
              Asignación de períodos vacacionales y acreditación de saldo por
              antigüedad
            </small>
          </div>
        </div>

        {/* Tabla de Saldos y Colaboradores */}
        <div className="table-responsive">
          <table className="table table-hover align-middle border-top">
            <thead className="table-light text-uppercase fs-7 text-muted">
              <tr>
                <th>Colaborador</th>
                <th>Departamento</th>
                <th>Fecha Ingreso</th>
                <th className="text-center">Días Ganados</th>
                <th className="text-center">Días Tomados</th>
                <th className="text-center">Saldo Disponible</th>
                <th className="text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              {personal.map((item) => (
                <tr key={item.id}>
                  <td className="fw-semibold text-dark">{item.nombre}</td>
                  <td>
                    <span className="badge bg-light text-dark border fw-normal">
                      {item.departamento}
                    </span>
                  </td>
                  <td>
                    <small className="text-muted">{item.fechaIngreso}</small>
                  </td>
                  <td className="text-center text-success fw-semibold">
                    +{item.diasGanados} días
                  </td>
                  <td className="text-center text-danger fw-semibold">
                    -{item.diasTomados} días
                  </td>
                  <td className="text-center">
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 fw-bold">
                      {item.saldoDisponible} días libres
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-3 px-3"
                      onClick={() => abrirModal(item)}
                    >
                      <i className="bi bi-pencil-square me-1"></i>
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de Registro por Fechas o Acreditación */}
        {usuarioSeleccionado && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow rounded-4">
                <div className="modal-header border-bottom">
                  <h6 className="modal-title fw-bold">
                    Gestionar Vacaciones: {usuarioSeleccionado.nombre}
                  </h6>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setUsuarioSeleccionado(null)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  {/* Selector de Operación */}
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">
                      ¿Qué acción deseas realizar?
                    </label>
                    <select
                      className="form-select"
                      value={tipoOperacion}
                      onChange={(e) => setTipoOperacion(e.target.value)}
                    >
                      <option value="DESCUENTO">
                        Registrar Período de Vacaciones (Seleccionar Fechas)
                      </option>
                      <option value="ACREDITACION">
                        Acreditar / Sumar Días al Saldo (Por antigüedad/Ajuste)
                      </option>
                    </select>
                  </div>

                  {/* CASO 1: Selección de Rango de Fechas */}
                  {tipoOperacion === "DESCUENTO" ? (
                    <>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label text-muted small fw-semibold">
                            Desde
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-muted small fw-semibold">
                            Hasta
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="bg-light p-3 rounded-3 border mb-3 text-center">
                        <small className="text-muted d-block mb-1">
                          Días a descontar calculados:
                        </small>
                        <span className="fs-5 fw-bold text-danger">
                          {calcularDiasRango()} días
                        </span>
                      </div>
                    </>
                  ) : (
                    /* CASO 2: Acreditación Directa de Días */
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-semibold">
                        Días a Sumar
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Ej. 15"
                        value={diasAcreditar}
                        onChange={(e) => setDiasAcreditar(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="form-label text-muted small fw-semibold">
                      Motivo / Observación
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder={
                        tipoOperacion === "DESCUENTO"
                          ? "Ej. Vacaciones tomadas período agosto"
                          : "Ej. Incremento de días por cumplimiento de año laboral"
                      }
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light-subtle">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-3"
                    onClick={() => setUsuarioSeleccionado(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm rounded-3 px-3 ${
                      tipoOperacion === "DESCUENTO"
                        ? "btn-danger"
                        : "btn-success"
                    }`}
                    onClick={guardarRegistro}
                  >
                    {tipoOperacion === "DESCUENTO"
                      ? "Registrar Período Vacacional"
                      : "Acreditar Días"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default GestionVacaciones;
