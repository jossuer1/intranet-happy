import { useState, useEffect } from "react";

function EditarUsuarioCard({ usuario, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombres: "",
    cedula: "",
    correoEmpresa: "",
    correoPersonal: "",
    fechaNacimiento: "",
    idGenero: "",
    idEstadoCivil: "",
    cargo: "",
    departamento: "",
    contactosEmergencia: [
      { id: Date.now(), nombre: "", relacion: "", telefono: "" },
    ],
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        ...usuario,
        nombres: usuario.nombres || usuario.nombre || "",
        correoEmpresa: usuario.correoEmpresa || usuario.correo || "",
        contactosEmergencia: usuario.contactosEmergencia?.length
          ? usuario.contactosEmergencia
          : [{ id: Date.now(), nombre: "", relacion: "", telefono: "" }],
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactoChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      contactosEmergencia: prev.contactosEmergencia.map((contacto, i) =>
        i === index ? { ...contacto, [field]: value } : contacto,
      ),
    }));
  };

  const agregarContacto = () => {
    setFormData((prev) => ({
      ...prev,
      contactosEmergencia: [
        ...prev.contactosEmergencia,
        { id: Date.now(), nombre: "", relacion: "", telefono: "" },
      ],
    }));
  };

  const eliminarContacto = (index) => {
    setFormData((prev) => ({
      ...prev,
      contactosEmergencia: prev.contactosEmergencia.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos actualizados:", formData);
    if (onGuardar) onGuardar(formData);
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: "60px", height: "60px", fontSize: "1.5rem" }}
          >
            👤
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark">
              {formData.nombres || "Ficha de Usuario"}
            </h5>
            <small className="text-muted">
              {formData.correoEmpresa || "Actualización de información general"}
            </small>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-3"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm px-4"
            onClick={handleSubmit}
          >
            💾 Guardar Cambios
          </button>
        </div>
      </div>

      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          <h6 className="fw-bold text-primary mb-3">📌 Datos Personales</h6>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">
                Nombres Completos
              </label>
              <input
                type="text"
                name="nombres"
                className="form-control"
                value={formData.nombres || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Cédula</label>
              <input
                type="text"
                name="cedula"
                className="form-control"
                value={formData.cedula || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">
                Fecha Nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                className="form-control"
                value={formData.fechaNacimiento || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">
                Correo Empresarial
              </label>
              <input
                type="email"
                name="correoEmpresa"
                className="form-control"
                value={formData.correoEmpresa || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">
                Correo Personal
              </label>
              <input
                type="email"
                name="correoPersonal"
                className="form-control"
                value={formData.correoPersonal || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <hr className="my-4 text-muted opacity-25" />

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold text-primary m-0">
              🚨 Contactos de Emergencia
            </h6>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={agregarContacto}
            >
              + Agregar Otro Contacto
            </button>
          </div>

          {formData.contactosEmergencia.map((contacto, index) => (
            <div
              key={contacto.id || index}
              className="p-3 mb-3 bg-light rounded border"
            >
              <div className="row g-2 align-items-center">
                <div className="col-md-4">
                  <label className="form-label small text-muted mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej. María Pérez"
                    value={contacto.nombre || ""}
                    onChange={(e) =>
                      handleContactoChange(index, "nombre", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small text-muted mb-1">
                    Parentesco / Relación
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej. Madre / Esposo"
                    value={contacto.relacion || ""}
                    onChange={(e) =>
                      handleContactoChange(index, "relacion", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small text-muted mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej. 0991234567"
                    value={contacto.telefono || ""}
                    onChange={(e) =>
                      handleContactoChange(index, "telefono", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-1 text-end mt-4">
                  {formData.contactosEmergencia.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => eliminarContacto(index)}
                      title="Eliminar contacto"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </form>
      </div>
    </div>
  );
}

export default EditarUsuarioCard;
