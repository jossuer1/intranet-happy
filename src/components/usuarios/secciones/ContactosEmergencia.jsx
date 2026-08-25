import React from "react";

const ContactosEmergencia = ({
  contactos,
  handleItemChange,
  handleAddItem,
  handleRemoveItem,
}) => {
  const nuevoContacto = {
    nombre: "",
    apellido: "",
    parentesco: "",
    telefono: "",
    direccion: "",
  };

  return (
    <div className="card border-0 bg-white p-3 shadow-sm rounded-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="text-primary m-0 fw-bold">🚨 Contactos de Emergencia</h6>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => handleAddItem("contactosEmergencia", nuevoContacto)}
        >
          + Agregar Contacto
        </button>
      </div>

      {contactos.length === 0 ? (
        <p className="text-muted text-center py-2 m-0 fs-6">
          No se han agregado contactos de emergencia.
        </p>
      ) : (
        contactos.map((contacto, index) => (
          <div key={index} className="card border bg-light p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-secondary">
                Contacto #{index + 1}
              </span>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() =>
                  handleRemoveItem("contactosEmergencia", index, "idContacto")
                }
              >
                Eliminar
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={contacto.nombre || ""}
                  onChange={(e) =>
                    handleItemChange("contactosEmergencia", index, e)
                  }
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Apellido</label>
                <input
                  type="text"
                  className="form-control"
                  name="apellido"
                  value={contacto.apellido || ""}
                  onChange={(e) =>
                    handleItemChange("contactosEmergencia", index, e)
                  }
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Parentesco *</label>
                <input
                  type="text"
                  className="form-control"
                  name="parentesco"
                  value={contacto.parentesco || ""}
                  onChange={(e) =>
                    handleItemChange("contactosEmergencia", index, e)
                  }
                  placeholder="Ej. Hermano, Amigo"
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Teléfono *</label>
                <input
                  type="text"
                  className="form-control"
                  name="telefono"
                  value={contacto.telefono || ""}
                  onChange={(e) =>
                    handleItemChange("contactosEmergencia", index, e)
                  }
                  placeholder="0991234567"
                  required
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">Dirección (Opcional)</label>
                <input
                  type="text"
                  className="form-control"
                  name="direccion"
                  value={contacto.direccion || ""}
                  onChange={(e) =>
                    handleItemChange("contactosEmergencia", index, e)
                  }
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ContactosEmergencia;
