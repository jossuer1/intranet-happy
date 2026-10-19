import React from "react";

// Tarjeta con título (misma estética que Datos Laborales)
const Tarjeta = ({ icono, titulo, children }) => (
  <div className="card border shadow-sm h-100">
    <div className="card-header bg-white border-bottom py-2 px-3">
      <span className="small fw-bold text-uppercase text-brand d-flex align-items-center gap-2">
        <i className={`bi ${icono}`}></i>
        {titulo}
      </span>
    </div>
    <div className="card-body p-3">{children}</div>
  </div>
);

const DatosPersonales = ({
  formData,
  handleChange,
  handleFotoChange,
  catalogos,
  opcionesFijas = {},
  camposSoloLectura = [],
}) => {
  const esSoloLectura = (campo) => camposSoloLectura.includes(campo);

  return (
    <div className="row g-3 align-items-stretch">
      {/* ───────── TARJETA 1: IDENTIFICACIÓN ───────── */}
      <div className="col-lg-4">
        <Tarjeta icono="bi-person-vcard" titulo="Identificación">
          <div className="text-center mb-3">
            <div className="d-flex justify-content-center mb-2">
              {formData.foto ? (
                <img
                  src={
                    typeof formData.foto === "string"
                      ? formData.foto
                      : URL.createObjectURL(formData.foto)
                  }
                  alt="Foto de perfil"
                  className="rounded-circle object-fit-cover shadow-sm"
                  style={{ width: "96px", height: "96px" }}
                />
              ) : (
                <div
                  className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: "96px", height: "96px", fontSize: "2.2rem" }}
                >
                  <i className="bi bi-person-fill"></i>
                </div>
              )}
            </div>
            <label className="btn btn-outline-primary btn-sm fw-semibold mb-1">
              <i className="bi bi-upload me-1"></i> Subir Imagen
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFotoChange}
                hidden
              />
            </label>
            <small
              className="text-muted d-block"
              style={{ fontSize: "0.72rem" }}
            >
              Formatos: JPG, PNG o WEBP.
            </small>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Cédula *</label>
              <input
                type="text"
                name="cedula"
                className="form-control"
                placeholder="10 dígitos"
                inputMode="numeric"
                maxLength={10}
                value={formData.cedula || ""}
                onChange={handleChange}
                disabled={esSoloLectura("cedula")}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Nacionalidad</label>
              <select
                name="nacionalidad"
                className="form-select"
                value={formData.nacionalidad || ""}
                onChange={handleChange}
                disabled={esSoloLectura("nacionalidad")}
              >
                {(opcionesFijas.nacionalidades?.length
                  ? opcionesFijas.nacionalidades
                  : ["ECUATORIANA"]
                ).map((n) => (
                  <option key={n} value={n}>
                    {n.charAt(0) + n.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Género</label>
              <select
                name="idGenero"
                className="form-select"
                value={formData.idGenero || ""}
                onChange={handleChange}
                disabled={esSoloLectura("idGenero")}
              >
                <option value="">Seleccione...</option>
                {catalogos.generos?.map((g) => (
                  <option key={g.idGenero} value={g.idGenero}>
                    {g.nombreGenero || g.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Tarjeta>
      </div>

      {/* ───────── TARJETA 2: INFORMACIÓN PERSONAL ───────── */}
      <div className="col-lg-4">
        <Tarjeta icono="bi-person-lines-fill" titulo="Información personal">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                placeholder="Ej. Juan Carlos"
                value={formData.nombre || ""}
                onChange={handleChange}
                disabled={esSoloLectura("nombre")}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Apellido *</label>
              <input
                type="text"
                name="apellido"
                className="form-control"
                placeholder="Ej. Pérez Gómez"
                value={formData.apellido || ""}
                onChange={handleChange}
                disabled={esSoloLectura("apellido")}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Correo Personal</label>
              <input
                type="email"
                name="correoPersonal"
                className="form-control"
                placeholder="correo@personal.com"
                value={formData.correoPersonal || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Celular Personal</label>
              <input
                type="text"
                name="celularPersonal"
                className="form-control"
                placeholder="0991234567"
                inputMode="numeric"
                maxLength={10}
                value={formData.celularPersonal || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                name="direccion"
                className="form-control"
                placeholder="Calle Principal y Secundaria"
                value={formData.direccion || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </Tarjeta>
      </div>

      {/* ───────── TARJETA 3: DATOS ADICIONALES ───────── */}
      <div className="col-lg-4">
        <Tarjeta icono="bi-card-checklist" titulo="Datos adicionales">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Fecha de Nacimiento</label>
              <input
                type="date"
                name="fechaNacimiento"
                className="form-control"
                value={formData.fechaNacimiento || ""}
                onChange={handleChange}
                disabled={esSoloLectura("fechaNacimiento")}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Estado Civil</label>
              <select
                name="idEstadoCivil"
                className="form-select"
                value={formData.idEstadoCivil || ""}
                onChange={handleChange}
                disabled={esSoloLectura("idEstadoCivil")}
              >
                <option value="">Seleccione...</option>
                {catalogos.estadosCiviles?.map((e) => (
                  <option key={e.idEstadoCivil} value={e.idEstadoCivil}>
                    {e.nombreEstadoCivil || e.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Etnia</label>
              <select
                name="idEtnia"
                className="form-select"
                value={formData.idEtnia || ""}
                onChange={handleChange}
                disabled={esSoloLectura("idEtnia")}
              >
                <option value="">Seleccione...</option>
                {catalogos.etnias?.map((et) => (
                  <option key={et.idEtnia} value={et.idEtnia}>
                    {et.nombreEtnia || et.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Tipo de Sangre</label>
              <select
                name="idTipoSangre"
                className="form-select"
                value={formData.idTipoSangre || ""}
                onChange={handleChange}
                disabled={esSoloLectura("idTipoSangre")}
              >
                <option value="">Seleccione...</option>
                {catalogos.tiposSangre?.map((ts) => (
                  <option key={ts.idTipoSangre} value={ts.idTipoSangre}>
                    {ts.nombreTipoSangre || ts.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Tarjeta>
      </div>
    </div>
  );
};

export default DatosPersonales;
