import React from "react";

// Dominio corporativo: es el único permitido para el correo empresarial.
const DOMINIO_EMPRESA = "@happypay.ec";

// Fila de interruptor con título y una línea de ayuda
const Interruptor = ({ id, name, titulo, ayuda, checked, onChange }) => (
  <div className="d-flex align-items-start justify-content-between gap-3 py-2 border-bottom">
    <label
      htmlFor={id}
      className="mb-0 flex-grow-1"
      style={{ cursor: "pointer" }}
    >
      <span className="fw-semibold d-block">{titulo}</span>
      {ayuda && <small className="text-muted fw-normal">{ayuda}</small>}
    </label>
    <div className="form-check form-switch m-0 flex-shrink-0">
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        id={id}
        name={name}
        checked={Boolean(checked)}
        onChange={onChange}
      />
    </div>
  </div>
);

const TituloCard = ({ icono, texto }) => (
  <div className="card-header bg-white border-bottom py-2 px-3">
    <span className="small fw-bold text-uppercase text-brand d-flex align-items-center gap-2">
      <i className={`bi ${icono}`}></i>
      {texto}
    </span>
  </div>
);

const DatosLaborales = ({
  formData,
  handleChange,
  catalogos = {},
  usuariosDisponibles = [],
  opcionesFijas = {},
  idUsuarioActual = null,
}) => {
  // El usuario solo escribe la parte antes de la @; el dominio va fijo.
  // Si pega un correo completo (o con otro dominio) se descarta lo que sigue a
  // la @ y los caracteres no válidos, y siempre se guarda con @happypay.ec.
  const parteLocalCorreo = String(formData.correoEmpresa || "").split("@")[0];

  const handleCorreoEmpresaChange = (e) => {
    const local = e.target.value
      .split("@")[0]
      .replace(/[^a-zA-Z0-9._%+-]/g, "")
      .toLowerCase();
    handleChange({
      target: {
        name: "correoEmpresa",
        value: local ? `${local}${DOMINIO_EMPRESA}` : "",
      },
    });
  };

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

  const requiereFechaFin = (
    opcionesFijas.tiposContratoConFechaFin || []
  ).includes(formData.tipoContrato);

  // Al cambiar el tipo de contrato, se limpia la fecha de fin si ya no aplica
  const handleTipoContratoChange = (e) => {
    handleChange(e);
    if (
      !(opcionesFijas.tiposContratoConFechaFin || []).includes(e.target.value)
    ) {
      handleChange({ target: { name: "fechaFinContrato", value: "" } });
    }
  };

  return (
    <div className="row g-3 align-items-start">
      {/* ───────── TARJETA 1: INFORMACIÓN CLAVE ───────── */}
      <div className="col-lg-7">
        <div className="card border shadow-sm h-100">
          <TituloCard icono="bi-briefcase" texto="Información clave" />
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Área / Departamento *</label>
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
                <label className="form-label">Fecha de Ingreso *</label>
                <input
                  type="date"
                  className="form-control"
                  name="fechaIngreso"
                  value={formData.fechaIngreso || ""}
                  onChange={handleChange}
                />
              </div>
              {requiereFechaFin && (
                <div className="col-md-6">
                  <label className="form-label">
                    Fecha de Fin de Contrato *
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    name="fechaFinContrato"
                    value={formData.fechaFinContrato || ""}
                    min={formData.fechaIngreso || undefined}
                    onChange={handleChange}
                  />
                </div>
              )}

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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────── COLUMNA DERECHA: ACCESO + OPCIONES ───────── */}
      <div className="col-lg-5 d-flex flex-column gap-3">
        {/* TARJETA 2: ACCESO Y CONTACTO */}
        <div className="card border shadow-sm">
          <TituloCard icono="bi-envelope-at" texto="Acceso y contacto" />
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Correo Empresarial</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    name="correoEmpresa"
                    value={parteLocalCorreo}
                    onChange={handleCorreoEmpresaChange}
                    placeholder="nombre.apellido"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <span className="input-group-text fw-semibold text-muted">
                    {DOMINIO_EMPRESA}
                  </span>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label">Celular Empresarial</label>
                <input
                  type="text"
                  className="form-control"
                  name="celularEmpresa"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.celularEmpresa || ""}
                  onChange={handleChange}
                  placeholder="0991234567"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TARJETA 3: OPCIONES (interruptores) */}
        <div className="card border shadow-sm">
          <TituloCard icono="bi-toggles" texto="Opciones del colaborador" />
          <div className="card-body px-3 py-1">
            <Interruptor
              checked={formData.recibeComisiones}
              onChange={handleSwitchChange}
              id="recibeComisionesSwitch"
              name="recibeComisiones"
              titulo="Recibe comisiones"
            />
            <Interruptor
              checked={formData.acumulaDecimos}
              onChange={handleSwitchChange}
              id="acumulaDecimosSwitch"
              name="acumulaDecimos"
              titulo="Acumula décimos"
            />
            <Interruptor
              checked={formData.esJefe}
              onChange={handleSwitchChange}
              id="esJefeSwitch"
              name="esJefe"
              titulo="Jefe"
            />
            <div className={formData.tieneVacaciones ? "border-bottom" : ""}>
              <Interruptor
                checked={formData.tieneVacaciones}
                onChange={handleSwitchChange}
                id="tieneVacacionesSwitch"
                name="tieneVacaciones"
                titulo="Tiene vacaciones"
              />
            </div>
            {formData.tieneVacaciones && (
              <div className="py-3">
                <label htmlFor="diasVacacionesAsignados" className="form-label">
                  Días de vacaciones iniciales
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatosLaborales;
