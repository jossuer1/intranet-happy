import React from "react";

const DatosLaborales = ({
  formData,
  handleChange,
  catalogos = {},
  usuariosDisponibles = [],
  opcionesFijas = {},
  idUsuarioActual = null,
}) => {
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

  // Solo se puede elegir como jefe directo a usuarios activos marcados como
  // jefe (el backend lo valida); y nadie puede ser su propio jefe.
  const posiblesJefes = usuariosDisponibles.filter(
    (u) =>
      u.esJefe &&
      u.estado !== false &&
      (!idUsuarioActual || u.idUsuario !== idUsuarioActual),
  );

  const requiereFechaFin = (opcionesFijas.tiposContratoConFechaFin || []).includes(
    formData.tipoContrato,
  );

  // Al cambiar el tipo de contrato, se limpia la fecha de fin si ya no aplica
  const handleTipoContratoChange = (e) => {
    handleChange(e);
    if (!(opcionesFijas.tiposContratoConFechaFin || []).includes(e.target.value)) {
      handleChange({ target: { name: "fechaFinContrato", value: "" } });
    }
  };

  return (
    <div>
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
          <label className="form-label">Jefe Directo</label>
          <select
            className="form-select"
            name="idJefeDirecto"
            value={formData.idJefeDirecto || ""}
            onChange={handleChange}
          >
            <option value="">Sin jefe directo asignado</option>
            {posiblesJefes.map((u) => (
              <option key={u.idUsuario} value={u.idUsuario}>
                {u.nombre} {u.apellido}
                {u.cargo ? ` — ${u.cargo}` : ""}
              </option>
            ))}
          </select>
          <small className="text-muted">
            Se usa para el flujo de aprobación de vacaciones (jefe → RRHH).
          </small>
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
            <h6 className="text-secondary mb-3">Condición Laboral</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Tipo de Contrato</label>
                <select
                  className="form-select"
                  name="tipoContrato"
                  value={formData.tipoContrato || ""}
                  onChange={handleTipoContratoChange}
                >
                  <option value="">Seleccione un tipo...</option>
                  {(opcionesFijas.tiposContrato || []).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              {requiereFechaFin && (
                <div className="col-md-6">
                  <label className="form-label">Fecha de Fin de Contrato *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="fechaFinContrato"
                    value={formData.fechaFinContrato || ""}
                    min={formData.fechaIngreso || undefined}
                    onChange={handleChange}
                    required
                  />
                  <small className="text-muted">
                    Debe ser posterior a la fecha de ingreso.
                  </small>
                </div>
              )}
              <div className="col-md-6">
                <label className="form-label">Jornada</label>
                <select
                  className="form-select"
                  name="jornada"
                  value={formData.jornada || ""}
                  onChange={handleChange}
                >
                  <option value="">Seleccione una jornada...</option>
                  {(opcionesFijas.jornadas || []).map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Cargo IESS</label>
                <input
                  type="text"
                  className="form-control"
                  name="cargoIess"
                  maxLength={100}
                  value={formData.cargoIess || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Sectorial</label>
                <input
                  type="text"
                  className="form-control"
                  name="sectorial"
                  maxLength={60}
                  value={formData.sectorial || ""}
                  onChange={handleChange}
                  placeholder="Ej. 1910000000012 o BAJO FACTURA"
                />
              </div>
              <div className="col-12 d-flex flex-wrap gap-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="recibeComisionesSwitch"
                    name="recibeComisiones"
                    checked={Boolean(formData.recibeComisiones)}
                    onChange={handleSwitchChange}
                  />
                  <label className="form-check-label" htmlFor="recibeComisionesSwitch">
                    Recibe comisiones
                  </label>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="acumulaDecimosSwitch"
                    name="acumulaDecimos"
                    checked={Boolean(formData.acumulaDecimos)}
                    onChange={handleSwitchChange}
                  />
                  <label className="form-check-label" htmlFor="acumulaDecimosSwitch">
                    Acumula décimos
                  </label>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="esJefeSwitch"
                    name="esJefe"
                    checked={Boolean(formData.esJefe)}
                    onChange={handleSwitchChange}
                  />
                  <label className="form-check-label fw-bold" htmlFor="esJefeSwitch">
                    Es jefe (puede ser elegido como jefe directo y aprobar vacaciones)
                  </label>
                </div>
              </div>
            </div>
          </div>
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
