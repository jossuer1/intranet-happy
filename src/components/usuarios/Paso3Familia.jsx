function Paso3Familia({
  formData,
  agregarFamiliar,
  eliminarFamiliar,
  handleFamiliarChange,
  agregarContacto,
  eliminarContacto,
  handleContactoChange,
}) {
  return (
    <div>
      <h5 className="mb-3 text-secondary">Paso 3: Información Familiar</h5>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="m-0 fw-bold text-dark">Hijos Registrados</h6>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={agregarFamiliar}
          >
            + Agregar Hijo
          </button>
        </div>

        {formData.familiares.map((item, index) => (
          <div
            key={index}
            className="row g-2 align-items-center mb-2 bg-light p-2 rounded"
          >
            <div className="col-md-6">
              <input
                type="text"
                name="nombreHijo"
                className="form-control form-control-sm"
                placeholder="Nombre del hijo/a"
                value={item.nombreHijo}
                onChange={(e) => handleFamiliarChange(index, e)}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="date"
                name="fechaNacimiento"
                className="form-control form-control-sm"
                value={item.fechaNacimiento}
                onChange={(e) => handleFamiliarChange(index, e)}
                required
              />
            </div>
            <div className="col-md-2 text-end">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => eliminarFamiliar(index)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <hr />

      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="m-0 fw-bold text-dark">Contactos de Emergencia</h6>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={agregarContacto}
          >
            + Agregar Contacto
          </button>
        </div>

        {formData.contactosEmergencia.map((item, index) => (
          <div
            key={index}
            className="row g-2 align-items-center mb-2 bg-light p-2 rounded"
          >
            <div className="col-md-4">
              <input
                type="text"
                name="nombre"
                className="form-control form-control-sm"
                placeholder="Nombre"
                value={item.nombre}
                onChange={(e) => handleContactoChange(index, e)}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                name="numeroCelular"
                className="form-control form-control-sm"
                placeholder="Teléfono"
                value={item.numeroCelular}
                onChange={(e) => handleContactoChange(index, e)}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                name="parentesco"
                className="form-control form-control-sm"
                placeholder="Parentesco"
                value={item.parentesco}
                onChange={(e) => handleContactoChange(index, e)}
                required
              />
            </div>
            <div className="col-md-2 text-end">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => eliminarContacto(index)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Paso3Familia;
