import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AppLayout from "../components/layout/AppLayout";
import {
  getSaldosVacaciones,
  acreditarDiasVacaciones,
} from "../services/vacacionesService";

function SaldosPersonal() {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [usuarioAcreditar, setUsuarioAcreditar] = useState(null);
  const [diasAcreditar, setDiasAcreditar] = useState("");
  const [observacion, setObservacion] = useState("");
  const [procesando, setProcesando] = useState(false);

  const cargarSaldos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSaldosVacaciones();
      setPersonal(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "No se pudieron obtener los saldos del personal.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSaldos();
  }, []);

  const procesarAcreditacion = async () => {
    if (!diasAcreditar || Number(diasAcreditar) <= 0) {
      Swal.fire("Atención", "Ingresa un número válido de días.", "warning");
      return;
    }

    try {
      setProcesando(true);

      const targetId = usuarioAcreditar.idUsuario || usuarioAcreditar.id;

      const payload = {
        idUsuario: Number(targetId),
        dias: Number(diasAcreditar),
        // El DTO real del backend (VacacionAjusteCrearDto) espera "motivo", no "observacion".
        motivo: observacion || "Acreditación de días por antigüedad/ajuste",
      };

      await acreditarDiasVacaciones(payload);

      // Actualizamos el estado local de forma reactiva
      setPersonal((prev) =>
        prev.map((u) => {
          const idActual = u.idUsuario || u.id;
          if (idActual === targetId) {
            return {
              ...u,
              saldoActual: (Number(u.saldoActual) || 0) + payload.dias,
            };
          }
          return u;
        }),
      );

      setUsuarioAcreditar(null);
      setDiasAcreditar("");
      setObservacion("");

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Días acreditados con éxito",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al acreditar",
        text:
          err.message || "No se pudo completar la acreditación en el servidor.",
      });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <AppLayout usuarioRol="RRHH">
      <div className="container-fluid py-3">
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
            <div>
              <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                <i className="bi bi-wallet2 text-primary fs-5"></i>
                Saldos de Vacaciones del Personal
              </h6>
              <small className="text-muted">
                Resumen acumulado y acreditación de nuevos días
              </small>
            </div>
            <button
              className="btn btn-outline-secondary btn-sm rounded-3 d-flex align-items-center gap-1"
              onClick={cargarSaldos}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i> Actualizar
            </button>
          </div>

          {loading ? (
            <div className="text-center my-5 py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando saldos...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger my-3" role="alert">
              {error}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle border-top">
                <thead className="table-light text-uppercase fs-7 text-muted">
                  <tr>
                    <th>Colaborador</th>
                    <th>Departamento</th>
                    <th className="text-center">Saldo Disponible</th>
                    <th className="text-center">Estado del Saldo</th>
                    <th className="text-end">Acreditación</th>
                  </tr>
                </thead>
                <tbody>
                  {personal.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">
                        No hay registros de saldos disponibles.
                      </td>
                    </tr>
                  ) : (
                    personal.map((item) => {
                      const idItem = item.idUsuario || item.id;
                      const nombre =
                        item.nombre || item.nombres || "Sin Nombre";
                      const depto =
                        item.departamento ||
                        item.nombreDepartamento ||
                        "General";
                      const sinBeneficio = item.tieneVacaciones === false;
                      const saldo = sinBeneficio
                        ? 0
                        : (item.saldoActual ??
                          item.saldoDisponible ??
                          item.diasDisponibles ??
                          0);
                      const estado = sinBeneficio
                        ? "Sin beneficio"
                        : item.estado || "Al día";

                      return (
                        <tr
                          key={idItem}
                          className={sinBeneficio ? "opacity-50" : ""}
                        >
                          <td className="fw-semibold text-dark">{nombre}</td>
                          <td>
                            <span className="badge bg-light text-dark border fw-normal">
                              {depto}
                            </span>
                          </td>
                          <td className="text-center fw-bold text-success fs-6">
                            {sinBeneficio ? "—" : `${saldo} días`}
                          </td>
                          <td className="text-center">
                            <span
                              className={`badge rounded-pill px-2.5 py-1 ${
                                sinBeneficio
                                  ? "bg-secondary-subtle text-secondary border border-secondary-subtle"
                                  : estado === "Al día"
                                    ? "bg-success-subtle text-success border border-success-subtle"
                                    : "bg-warning-subtle text-warning border border-warning-subtle"
                              }`}
                            >
                              {estado}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success rounded-3 px-3"
                              disabled={sinBeneficio}
                              onClick={() => setUsuarioAcreditar(item)}
                            >
                              <i className="bi bi-plus-circle me-1"></i>
                              Cargar Días
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal para Sumar/Acreditar Días */}
          {usuarioAcreditar && (
            <div
              className="modal fade show d-block"
              style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow rounded-4">
                  <div className="modal-header border-bottom">
                    <h6 className="modal-title fw-bold">
                      Acreditar Días -{" "}
                      {usuarioAcreditar.nombre || usuarioAcreditar.nombres}
                    </h6>
                    <button
                      type="button"
                      className="btn-close"
                      disabled={procesando}
                      onClick={() => setUsuarioAcreditar(null)}
                    ></button>
                  </div>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-semibold">
                        Días Adicionales a Sumar
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Ej. 15"
                        value={diasAcreditar}
                        onChange={(e) => setDiasAcreditar(e.target.value)}
                        disabled={procesando}
                        min="1"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-semibold">
                        Observación / Motivo (Opcional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. Cumplimiento de nuevo período anual"
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        disabled={procesando}
                      />
                    </div>
                  </div>
                  <div className="modal-footer border-top bg-light-subtle">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-3"
                      onClick={() => setUsuarioAcreditar(null)}
                      disabled={procesando}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-success rounded-3 px-3"
                      onClick={procesarAcreditacion}
                      disabled={procesando}
                    >
                      {procesando ? "Acreditando..." : "Guardar Acreditación"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default SaldosPersonal;
