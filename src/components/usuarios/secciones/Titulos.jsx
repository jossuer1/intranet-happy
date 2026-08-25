import React from "react";

const Titulos = ({
  titulos,
  handleItemChange,
  handleAddItem,
  handleRemoveItem,
}) => {
  const nuevoTitulo = {
    nombreTitulo: "",
    institucion: "",
    fechaObtencion: "",
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="text-secondary m-0">Títulos Académicos</h5>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => handleAddItem("titulos", nuevoTitulo)}
        >
          + Agregar Título
        </button>
      </div>

      {titulos.length === 0 ? (
        <div className="text-center py-4 bg-light rounded-3 text-muted">
          <p className="mb-1">No has agregado ningún título académico.</p>
          <small>
            Puedes registrar estudios de tercer nivel, posgrados o
            certificaciones relevantes.
          </small>
        </div>
      ) : (
        titulos.map((titulo, index) => (
          <div
            key={index}
            className="card border-0 bg-light p-3 mb-3 shadow-sm"
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-primary">Título #{index + 1}</span>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleRemoveItem("titulos", index, "idTitulo")}
              >
                Eliminar
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-5">
                <label className="form-label">Nombre del Título *</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombreTitulo"
                  value={titulo.nombreTitulo || ""}
                  onChange={(e) => handleItemChange("titulos", index, e)}
                  placeholder="Ej. Ing. en Sistemas Computacionales"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Institución</label>
                <input
                  type="text"
                  className="form-control"
                  name="institucion"
                  value={titulo.institucion || ""}
                  onChange={(e) => handleItemChange("titulos", index, e)}
                  placeholder="Ej. Escuela Politécnica Nacional"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Fecha Obtención</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaObtencion"
                  value={titulo.fechaObtencion || ""}
                  onChange={(e) => handleItemChange("titulos", index, e)}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Titulos;
