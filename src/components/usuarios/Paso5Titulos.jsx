function Paso5Titulos({
  formData,
  agregarTitulo,
  eliminarTitulo,
  handleTituloChange,
}) {
  return (
    <div>
      <h5 className="mb-3 text-secondary">Paso 5: Formación Académica</h5>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="m-0 fw-bold text-dark">Títulos Obtenidos</h6>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={agregarTitulo}
        >
          + Agregar Título
        </button>
      </div>

      {formData.titulos.map((item, index) => (
        <div
          key={index}
          className="row g-2 align-items-center mb-2 bg-light p-2 rounded"
        >
          <div className="col-md-5">
            <input
              type="text"
              name="titulo"
              className="form-control form-control-sm"
              placeholder="Ej. Tecnólogo en Desarrollo de Software"
              value={item.titulo}
              onChange={(e) => handleTituloChange(index, e)}
              required
            />
          </div>
          <div className="col-md-5">
            <input
              type="text"
              name="institucionEducativaSuperior"
              className="form-control form-control-sm"
              placeholder="Ej. Escuela Politécnica Nacional"
              value={item.institucionEducativaSuperior}
              onChange={(e) => handleTituloChange(index, e)}
            />
          </div>
          <div className="col-md-2 text-end">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => eliminarTitulo(index)}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Paso5Titulos;
