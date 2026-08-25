import React from "react";

const DatosLaborales = ({ formData, handleChange, catalogos = {} }) => {
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    handleChange({
      target: {
        name,
        value: checked,
      },
    });
  };

  // Al cambiar el área, reseteamos el cargo seleccionado (puede que ya
  // no pertenezca al área nueva) y filtramos el catálogo de cargos.
  const handleAreaChange = (e) => {
    handleChange(e);
    handleChange({ target: { name: "idCargo", value: "" } });
  };

  // Si los cargos vienen con idArea, filtramos por el área elegida.
  // Si no lo traen (catálogo plano), mostramos todos para no romper nada.
  const cargosConArea = (catalogos.cargos || []).some(
    (c) => c.idArea !== undefined && c.idArea !== null,
  );
  const cargosFiltrados =
    cargosConArea && formData.idArea
      ? (catalogos.cargos || []).filter(
          (c) => String(c.idArea) === String(formData.idArea),
        )
      : catalogos.cargos || [];

  return (
    <div>
      <h5 className="mb-4 text-secondary">Datos Laborales</h5>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Área / Departamento</label>
          <select
            className="form-select"
            name="idArea"
            value={formData.idArea || ""}
            onChange={handleAreaChange}
          >
            <option value="">Seleccione un área...</option>
            {catalogos.areas?.map((a) => (
              <option key={a.idArea || a.id} value={a.idArea || a.id}>
                {a.nombre || a.descripcion}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Cargo *</label>
          <select
            className="form-select"
            name="idCargo"
            value={formData.idCargo || ""}
            onChange={handleChange}
            required
          >
            <option value="">
              {formData.idArea
                ? "Seleccione un cargo..."
                : "Seleccione un área primero..."}
            </option>
            {cargosFiltrados.map((c) => (
              <option key={c.idCargo || c.id} value={c.idCargo || c.id}>
                {c.nombre || c.descripcion}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Ciudad</label>
          <select
            className="form-select"
            name="idCiudad"
            value={formData.idCiudad || ""}
            onChange={handleChange}
          >
            <option value="">Seleccione una ciudad...</option>
            {catalogos.ciudades?.map((ciudad) => (
              <option
                key={ciudad.idCiudad || ciudad.id}
                value={ciudad.idCiudad || ciudad.id}
              >
                {ciudad.nombre || ciudad.descripcion}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Correo Empresarial</label>
          <input
            type="email"
            className="form-control"
            name="correoEmpresa"
            value={formData.correoEmpresa || ""}
            onChange={handleChange}
            placeholder="usuario@empresa.com"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Celular Empresarial</label>
          <input
            type="text"
            className="form-control"
            name="celularEmpresa"
            value={formData.celularEmpresa || ""}
            onChange={handleChange}
            placeholder="0991234567"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Fecha de Ingreso *</label>
          <input
            type="date"
            className="form-control"
            name="fechaIngreso"
            value={formData.fechaIngreso || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-12 mt-3">
          <div className="card bg-light border-0 p-3 shadow-sm">
            <h6 className="text-secondary mb-3">Configuración de Vacaciones</h6>
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="tieneVacacionesSwitch"
                name="tieneVacaciones"
                checked={Boolean(formData.tieneVacaciones)}
                onChange={handleSwitchChange}
              />
              <label
                className="form-check-label fw-bold"
                htmlFor="tieneVacacionesSwitch"
              >
                ¿El empleado acumula o tiene días de vacaciones asignados?
              </label>
            </div>
            {formData.tieneVacaciones && (
              <div className="row">
                <div className="col-md-6">
                  <label
                    htmlFor="diasVacacionesAsignados"
                    className="form-label"
                  >
                    Días de Vacaciones Asignados Iniciales
                  </label>
                  <input
                    type="number"
                    id="diasVacacionesAsignados"
                    name="diasVacacionesAsignados"
                    className="form-control"
                    min="0"
                    value={formData.diasVacacionesAsignados || ""}
                    onChange={handleChange}
                    placeholder="Ej. 15"
                  />
                  <small className="text-muted">
                    Número de días base con los que ingresa o cuenta el
                    colaborador.
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatosLaborales;
