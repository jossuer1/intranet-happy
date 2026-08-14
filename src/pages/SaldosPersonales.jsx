import React, { useState } from "react";
import AppLayout from "../components//layout/AppLayout";

function SaldosPersonal() {
  const [personal, setPersonal] = useState([
    {
      id: 1,
      nombre: "Carlos Mendoza",
      departamento: "Tecnología",
      saldoActual: 20,
      estado: "Al día",
    },
    {
      id: 2,
      nombre: "Ana Gutiérrez",
      departamento: "Recursos Humanos",
      saldoActual: 30,
      estado: "Por vencer",
    },
    {
      id: 3,
      nombre: "Roberto Gómez",
      departamento: "Finanzas",
      saldoActual: 10,
      estado: "Al día",
    },
  ]);

  const [usuarioAcreditar, setUsuarioAcreditar] = useState(null);
  const [diasAcreditar, setDiasAcreditar] = useState("");

  const procesarAcreditacion = () => {
    if (!diasAcreditar || Number(diasAcreditar) <= 0) return;
    setPersonal((prev) =>
      prev.map((u) => {
        if (u.id === usuarioAcreditar.id) {
          return { ...u, saldoActual: u.saldoActual + Number(diasAcreditar) };
        }
        return u;
      }),
    );
    setUsuarioAcreditar(null);
    setDiasAcreditar("");
  };

  return (
    <AppLayout usuarioRol="RRHH">
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div>
            <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
              <i className="bi bi-wallet2 text-primary fs-5"></i>
              Saldos de Vacaciones del Personal
            </h6>
            <small className="text-muted">
              Resumen acumulado y acreditación de nuevos días por antigüedad
            </small>
          </div>
        </div>

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
              {personal.map((item) => (
                <tr key={item.id}>
                  <td className="fw-semibold text-dark">{item.nombre}</td>
                  <td>
                    <span className="badge bg-light text-dark border fw-normal">
                      {item.departamento}
                    </span>
                  </td>
                  <td className="text-center fw-bold text-success fs-6">
                    {item.saldoActual} días
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge rounded-pill px-2.5 py-1 ${
                        item.estado === "Al día"
                          ? "bg-success-subtle text-success border border-success-subtle"
                          : "bg-warning-subtle text-warning border border-warning-subtle"
                      }`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success rounded-3 px-3"
                      onClick={() => setUsuarioAcreditar(item)}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Cargar Días
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
                    Acreditar Días - {usuarioAcreditar.nombre}
                  </h6>
                  <button
                    type="button"
                    className="btn-close"
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
                      placeholder="Ej. 15 (Por nuevo año cumplido)"
                      value={diasAcreditar}
                      onChange={(e) => setDiasAcreditar(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top bg-light-subtle">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-3"
                    onClick={() => setUsuarioAcreditar(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-success rounded-3 px-3"
                    onClick={procesarAcreditacion}
                  >
                    Guardar Acreditación
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

export default SaldosPersonal;
