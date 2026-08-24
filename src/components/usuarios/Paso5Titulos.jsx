import React from "react";

function Paso5Titulos({ formData, setFormData }) {
  const handleTituloChange = (index, e) => {
    const { name, value } = e.target;
    const nuevosTitulos = [...formData.titulos];
    nuevosTitulos[index][name] = value;
    setFormData({
      ...formData,
      titulos: nuevosTitulos,
    });
  };

  const agregarTitulo = () => {
    setFormData({
      ...formData,
      titulos: [...formData.titulos, { nombreTitulo: "", institucion: "" }],
    });
  };

  const eliminarTitulo = (index) => {
    const nuevosTitulos = formData.titulos.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      titulos: nuevosTitulos,
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="text-secondary m-0">Paso 5: Títulos Académicos</h5>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={agregarTitulo}
        >
          + Agregar Título
        </button>
      </div>

      {formData.titulos.length === 0 ? (
        <div className="text-center py-4 bg-light rounded-3 text-muted">
          <p className="mb-1">No has agregado ningún título académico.</p>
          <small>
            Puedes registrar estudios de tercer nivel, posgrados o
            certificaciones relevantes.
          </small>
        </div>
      ) : (
        formData.titulos.map((titulo, index) => (
          <div
            key={index}
            className="card border-0 bg-light p-3 mb-3 shadow-sm"
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-primary">
                Título Académico #{index + 1}
              </span>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => eliminarTitulo(index)}
              >
                Eliminar
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre del Título</label>
                <input
                  type="text"
                  name="nombreTitulo"
                  className="form-control"
                  placeholder="Ej. Ing. en Sistemas Computacionales"
                  value={titulo.nombreTitulo}
                  onChange={(e) => handleTituloChange(index, e)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Institución Educativa / Universidad
                </label>
                <input
                  type="text"
                  name="institucion"
                  className="form-control"
                  placeholder="Ej. Escuela Politécnica Nacional"
                  value={titulo.institucion}
                  onChange={(e) => handleTituloChange(index, e)}
                  required
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Paso5Titulos;
