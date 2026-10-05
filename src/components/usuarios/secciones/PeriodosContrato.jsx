import React from "react";

// Historial de contratos del colaborador (en el backend: PeriodosIess).
// Cada tramo tiene fecha de ingreso, fecha de salida (vacía = sigue vigente)
// y el cargo que tenía en ese tramo. Ej.: pasante cuyo contrato terminó y que
// luego vuelve a ingresar con contrato de nómina.
// Solo se muestra al EDITAR un usuario (no al crearlo ni en autogestión).
const PeriodosContrato = ({
  periodos,
  handleItemChange,
  handleAddItem,
  handleRemoveItem,
}) => {
  const nuevoPeriodo = { fechaIngreso: "", fechaSalida: "", cargoIess: "" };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <small className="text-muted">
          Deja la fecha de salida vacía si el contrato sigue vigente. Solo el
          último período puede quedar abierto y no pueden traslaparse.
        </small>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm flex-shrink-0 ms-3"
          onClick={() => handleAddItem("periodosIess", nuevoPeriodo)}
        >
          + Agregar período
        </button>
      </div>

      {periodos.length === 0 ? (
        <div className="text-center py-4 bg-light rounded-3 text-muted">
          <p className="mb-1">No hay períodos de contrato registrados.</p>
          <small>
            Útil para quien tuvo un contrato anterior (ej. pasante) y luego
            ingresó de nuevo.
          </small>
        </div>
      ) : (
        periodos.map((periodo, index) => (
          <div key={index} className="card border bg-light p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-secondary">
                Período #{index + 1}
                {!periodo.fechaSalida && (
                  <span className="badge bg-success-subtle text-success border border-success-subtle ms-2">
                    Vigente
                  </span>
                )}
              </span>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() =>
                  handleRemoveItem("periodosIess", index, "idPeriodoIess")
                }
              >
                Eliminar
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Fecha de inicio *</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaIngreso"
                  value={periodo.fechaIngreso || ""}
                  onChange={(e) => handleItemChange("periodosIess", index, e)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Fecha de fin</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaSalida"
                  min={periodo.fechaIngreso || undefined}
                  value={periodo.fechaSalida || ""}
                  onChange={(e) => handleItemChange("periodosIess", index, e)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Cargo en ese período</label>
                <input
                  type="text"
                  className="form-control"
                  name="cargoIess"
                  maxLength={100}
                  value={periodo.cargoIess || ""}
                  onChange={(e) => handleItemChange("periodosIess", index, e)}
                  placeholder="Ej. PASANTE"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PeriodosContrato;
