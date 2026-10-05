import React from "react";

const Familiares = ({
  familiares,
  handleItemChange,
  handleAddItem,
  handleRemoveItem,
  parentescos = ["CONYUGE", "HIJO"],
}) => {
  const listaParentescos = parentescos.length ? parentescos : ["CONYUGE", "HIJO"];
  const etiqueta = (p) => (p === "CONYUGE" ? "Cónyuge" : p === "HIJO" ? "Hijo/a" : p);
  const valorPorDefecto = listaParentescos.includes("HIJO")
    ? "HIJO"
    : listaParentescos[0];

  const nuevoFamiliar = {
    nombre: "",
    apellido: "",
    parentesco: valorPorDefecto,
    cedula: "",
    fechaNacimiento: "",
    fechaUnion: "",
  };

  return (
    <div className="card border-0 bg-white p-3 mb-4 shadow-sm rounded-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => handleAddItem("familiares", nuevoFamiliar)}
        >
          + Agregar Familiar
        </button>
      </div>

      {familiares.length === 0 ? (
        <p className="text-muted text-center py-2 m-0 fs-6">
          No se han agregado familiares.
        </p>
      ) : (
        familiares.map((familiar, index) => (
          <div key={index} className="card border bg-light p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-secondary">
                Familiar #{index + 1}
              </span>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() =>
                  handleRemoveItem("familiares", index, "idFamiliar")
                }
              >
                Eliminar
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={familiar.nombre || ""}
                  onChange={(e) => handleItemChange("familiares", index, e)}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Apellido</label>
                <input
                  type="text"
                  className="form-control"
                  name="apellido"
                  value={familiar.apellido || ""}
                  onChange={(e) => handleItemChange("familiares", index, e)}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Parentesco</label>
                <select
                  className="form-select"
                  name="parentesco"
                  value={familiar.parentesco || valorPorDefecto}
                  onChange={(e) => handleItemChange("familiares", index, e)}
                >
                  {listaParentescos.map((p) => (
                    <option key={p} value={p}>
                      {etiqueta(p)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Cédula</label>
                <input
                  type="text"
                  className="form-control"
                  name="cedula"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10 dígitos (opcional)"
                  value={familiar.cedula || ""}
                  onChange={(e) =>
                    handleItemChange(
                      "familiares",
                      index,
                      "cedula",
                      e.target.value.replace(/\D/g, ""),
                    )
                  }
                />
              </div>
              <div className="col-md-3">
                {familiar.parentesco === "CONYUGE" ? (
                  <>
                    <label className="form-label">Fecha de Unión</label>
                    <input
                      type="date"
                      className="form-control"
                      name="fechaUnion"
                      value={familiar.fechaUnion || ""}
                      onChange={(e) => handleItemChange("familiares", index, e)}
                      required
                    />
                  </>
                ) : (
                  <>
                    <label className="form-label">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      className="form-control"
                      name="fechaNacimiento"
                      value={familiar.fechaNacimiento || ""}
                      onChange={(e) => handleItemChange("familiares", index, e)}
                      required
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Familiares;
