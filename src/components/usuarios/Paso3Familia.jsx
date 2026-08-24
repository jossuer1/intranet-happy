import React from "react";

function Paso3Familia({ formData, setFormData }) {
  // --- MANEJO DE FAMILIARES ---
  const handleFamiliarChange = (index, e) => {
    const { name, value } = e.target;
    const nuevosFamiliares = [...formData.familiares];
    nuevosFamiliares[index][name] = value;
    setFormData({ ...formData, familiares: nuevosFamiliares });
  };

  const agregarFamiliar = () => {
    setFormData({
      ...formData,
      familiares: [
        ...formData.familiares,
        { nombre: "", apellido: "", parentesco: "Hijo/a", fechaNacimiento: "" },
      ],
    });
  };

  const eliminarFamiliar = (index) => {
    const nuevosFamiliares = formData.familiares.filter((_, i) => i !== index);
    setFormData({ ...formData, familiares: nuevosFamiliares });
  };

  // --- MANEJO DE CONTACTOS DE EMERGENCIA ---
  const handleContactoChange = (index, e) => {
    const { name, value } = e.target;
    const nuevosContactos = [...formData.contactosEmergencia];
    nuevosContactos[index][name] = value;
    setFormData({ ...formData, contactosEmergencia: nuevosContactos });
  };

  const agregarContacto = () => {
    setFormData({
      ...formData,
      contactosEmergencia: [
        ...formData.contactosEmergencia,
        {
          nombre: "",
          apellido: "",
          parentesco: "Familiar",
          telefono: "",
          direccion: "",
        },
      ],
    });
  };

  const eliminarContacto = (index) => {
    const nuevosContactos = formData.contactosEmergencia.filter(
      (_, i) => i !== index,
    );
    setFormData({ ...formData, contactosEmergencia: nuevosContactos });
  };

  return (
    <div>
      <h5 className="mb-4 text-secondary">
        Paso 3: Familiares y Contactos de Emergencia
      </h5>

      {/* SECCIÓN 1: FAMILIARES / HIJOS */}
      <div className="card border-0 bg-white p-3 mb-4 shadow-sm rounded-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-primary m-0 fw-bold">👥 Familiares / Hijos</h6>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={agregarFamiliar}
          >
            + Agregar Familiar
          </button>
        </div>

        {formData.familiares.length === 0 ? (
          <p className="text-muted text-center py-2 m-0 fs-6">
            No se han agregado familiares.
          </p>
        ) : (
          formData.familiares.map((familiar, index) => (
            <div key={index} className="card border bg-light p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-secondary">
                  Familiar #{index + 1}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => eliminarFamiliar(index)}
                >
                  Eliminar
                </button>
              </div>

              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={familiar.nombre}
                    onChange={(e) => handleFamiliarChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    className="form-control"
                    value={familiar.apellido}
                    onChange={(e) => handleFamiliarChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Parentesco</label>
                  <select
                    name="parentesco"
                    className="form-select"
                    value={familiar.parentesco}
                    onChange={(e) => handleFamiliarChange(index, e)}
                  >
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Cónyuge">Cónyuge</option>
                    <option value="Padre/Madre">Padre/Madre</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    className="form-control"
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleFamiliarChange(index, e)}
                    required
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SECCIÓN 2: CONTACTOS DE EMERGENCIA */}
      <div className="card border-0 bg-white p-3 shadow-sm rounded-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-primary m-0 fw-bold">
            🚨 Contactos de Emergencia
          </h6>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={agregarContacto}
          >
            + Agregar Contacto
          </button>
        </div>

        {formData.contactosEmergencia.length === 0 ? (
          <p className="text-muted text-center py-2 m-0 fs-6">
            No se han agregado contactos de emergencia.
          </p>
        ) : (
          formData.contactosEmergencia.map((contacto, index) => (
            <div key={index} className="card border bg-light p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-secondary">
                  Contacto #{index + 1}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => eliminarContacto(index)}
                >
                  Eliminar
                </button>
              </div>

              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={contacto.nombre}
                    onChange={(e) => handleContactoChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    className="form-control"
                    value={contacto.apellido}
                    onChange={(e) => handleContactoChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Parentesco</label>
                  <input
                    type="text"
                    name="parentesco"
                    className="form-control"
                    placeholder="Ej. Madre, Amigo"
                    value={contacto.parentesco}
                    onChange={(e) => handleContactoChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    className="form-control"
                    value={contacto.telefono}
                    onChange={(e) => handleContactoChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label">Dirección (Opcional)</label>
                  <input
                    type="text"
                    name="direccion"
                    className="form-control"
                    value={contacto.direccion}
                    onChange={(e) => handleContactoChange(index, e)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Paso3Familia;
