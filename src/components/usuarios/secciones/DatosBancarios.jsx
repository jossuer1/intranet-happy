import React from "react";

const DatosBancarios = ({
  cuentas,
  handleItemChange,
  handleAddItem,
  handleRemoveItem,
  catalogos = {},
}) => {
  const nuevaCuenta = {
    idBanco: "",
    tipoCuenta: "Ahorros",
    numeroCuenta: "",
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="text-secondary m-0">Información Bancaria</h5>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => handleAddItem("datosBancarios", nuevaCuenta)}
        >
          + Agregar Cuenta Bancaria
        </button>
      </div>

      {cuentas.length === 0 ? (
        <div className="text-center py-4 bg-light rounded-3 text-muted">
          <p className="mb-1">No has agregado ninguna cuenta bancaria.</p>
          <small>
            Requerido para la acreditación de pagos de nómina o beneficios.
          </small>
        </div>
      ) : (
        cuentas.map((cuenta, index) => (
          <div
            key={index}
            className="card border-0 bg-light p-3 mb-3 shadow-sm"
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-primary">
                Cuenta Bancaria #{index + 1}
              </span>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() =>
                  handleRemoveItem("datosBancarios", index, "idDatoBancario")
                }
              >
                Eliminar
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Banco *</label>
                <select
                  className="form-select"
                  name="idBanco"
                  value={cuenta.idBanco || ""}
                  onChange={(e) => handleItemChange("datosBancarios", index, e)}
                  required
                >
                  <option value="">Seleccione un banco...</option>
                  {catalogos.bancos?.map((banco) => (
                    <option
                      key={banco.idBanco || banco.id}
                      value={banco.idBanco || banco.id}
                    >
                      {banco.nombre || banco.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Tipo de Cuenta *</label>
                <select
                  className="form-select"
                  name="tipoCuenta"
                  value={cuenta.tipoCuenta || "Ahorros"}
                  onChange={(e) => handleItemChange("datosBancarios", index, e)}
                  required
                >
                  <option value="Ahorros">Ahorros</option>
                  <option value="Corriente">Corriente</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Número de Cuenta *</label>
                <input
                  type="text"
                  className="form-control"
                  name="numeroCuenta"
                  value={cuenta.numeroCuenta || ""}
                  onChange={(e) => handleItemChange("datosBancarios", index, e)}
                  placeholder="Ej. 2200112233"
                  required
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DatosBancarios;
