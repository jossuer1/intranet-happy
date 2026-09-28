import React from "react";

const DatosPersonales = ({
  formData,
  handleChange,
  handleFotoChange,
  catalogos,
  camposSoloLectura = [],
}) => {
  const esSoloLectura = (campo) => camposSoloLectura.includes(campo);

  return (
    <div className="row g-4 align-items-start">
      {/* COLUMNA IZQUIERDA: Foto de Perfil */}
      <div className="col-lg-3 col-md-4 text-center">
        <div className="card border-0 shadow-sm p-3 bg-light rounded-3">
          <div className="mb-3 d-flex justify-content-center">
            {formData.foto ? (
              <img
                src={
                  typeof formData.foto === "string"
                    ? formData.foto
                    : URL.createObjectURL(formData.foto)
                }
                alt="Foto de perfil"
                className="rounded-circle object-fit-cover shadow-sm"
                style={{ width: "120px", height: "120px" }}
              />
            ) : (
              <div
                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: "120px", height: "120px", fontSize: "2.5rem" }}
              >
                <i className="bi bi-person-fill"></i>
              </div>
            )}
          </div>
          <label className="btn btn-outline-primary btn-sm w-100 fw-semibold mb-1">
            <i className="bi bi-upload me-1"></i> Subir Imagen
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFotoChange}
              hidden
            />
          </label>
          <small
            className="text-muted text-center d-block"
            style={{ fontSize: "0.75rem" }}
          >
            Formatos: JPG, PNG o WEBP.
          </small>
        </div>
      </div>

      {/* COLUMNA DERECHA: Campos de Formulario */}
      <div className="col-lg-9 col-md-8">
        {/* SECCIÓN 1: Campos de texto largo (Columna vertical / Filas completas) */}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold text-center d-block">
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              className="form-control"
              placeholder="Ej. Juan Carlos"
              value={formData.nombre || ""}
              onChange={handleChange}
              disabled={esSoloLectura("nombre")}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold text-center d-block">
              Apellido *
            </label>
            <input
              type="text"
              name="apellido"
              className="form-control"
              placeholder="Ej. Pérez Gómez"
              value={formData.apellido || ""}
              onChange={handleChange}
              disabled={esSoloLectura("apellido")}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold text-center d-block">
              Cédula *
            </label>
            <input
              type="text"
              name="cedula"
              className="form-control"
              placeholder="10 dígitos"
              value={formData.cedula || ""}
              onChange={handleChange}
              disabled={esSoloLectura("cedula")}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold text-center d-block">
              Correo Personal
            </label>
            <input
              type="email"
              name="correoPersonal"
              className="form-control"
              placeholder="correo@personal.com"
              value={formData.correoPersonal || ""}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold text-center d-block">
              Celular Personal
            </label>
            <input
              type="text"
              name="celularPersonal"
              className="form-control"
              placeholder="0991234567"
              value={formData.celularPersonal || ""}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold text-center d-block">
              Dirección
            </label>
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

        {/* SECCIÓN 2: Campos Cortos y Seleccionables (Fila horizontal de 3 por fila) */}
        <div className="row g-3 pt-2 border-top">
          <div className="col-md-4">
            <label className="form-label fw-semibold text-center d-block">
              Fecha Nacimiento
            </label>
            <input
              type="date"
              name="fechaNacimiento"
              className="form-control"
              value={formData.fechaNacimiento || ""}
              onChange={handleChange}
              disabled={esSoloLectura("fechaNacimiento")}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold text-center d-block">
              Género
            </label>
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
          <div className="col-md-4">
            <label className="form-label fw-semibold text-center d-block">
              Estado Civil
            </label>
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

          <div className="col-md-6 col-lg-6">
            <label className="form-label fw-semibold text-center d-block">
              Etnia
            </label>
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
          <div className="col-md-6 col-lg-6">
            <label className="form-label fw-semibold text-center d-block">
              Tipo de Sangre
            </label>
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
      </div>
    </div>
  );
};

export default DatosPersonales;
