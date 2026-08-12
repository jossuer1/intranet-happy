function Paso1Personal({ formData, handleChange, handleImagenChange }) {
  return (
    <div>
      <h5 className="mb-4 text-secondary">Paso 1: Información Personal</h5>

      <div className="row g-4 align-items-start">
        {/* COLUMNA IZQUIERDA: SECCIÓN DE FOTO DE PERFIL */}
        <div className="col-12 col-md-4 col-lg-3 text-center">
          <div className="card border-0 bg-light p-3 shadow-sm rounded-3">
            <div className="mb-3 d-flex justify-content-center">
              {formData.fotoPreview ? (
                <img
                  src={formData.fotoPreview}
                  alt="Vista previa"
                  className="rounded-circle object-fit-cover border border-3 border-primary shadow"
                  style={{ width: "160px", height: "160px" }}
                />
              ) : (
                <div
                  className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: "160px", height: "160px", fontSize: "4rem" }}
                >
                  👤
                </div>
              )}
            </div>

            <label className="form-label fw-bold mb-2">Foto de Perfil</label>

            {/* Input de archivo estilizado */}
            <input
              type="file"
              id="fotoInput"
              name="foto"
              accept="image/*"
              className="d-none"
              onChange={handleImagenChange}
            />
            <label
              htmlFor="fotoInput"
              className="btn btn-outline-primary btn-sm mb-2 w-100"
            >
              {formData.fotoPreview ? "Cambiar Imagen" : "Subir Imagen"}
            </label>

            <small
              className="text-muted d-block"
              style={{ fontSize: "0.75rem" }}
            >
              Formatos: JPG, PNG o WEBP.
            </small>
          </div>
        </div>

        {/* COLUMNA DERECHA: CAMPOS DEL FORMULARIO */}
        <div className="col-12 col-md-8 col-lg-9">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombres Completos</label>
              <input
                type="text"
                name="nombres"
                className="form-control"
                placeholder="Ej. Juan Pérez"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Cédula</label>
              <input
                type="text"
                name="cedula"
                className="form-control"
                placeholder="Ej. 1726384950"
                value={formData.cedula}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Correo Empresarial</label>
              <input
                type="email"
                name="correoEmpresa"
                className="form-control"
                placeholder="Ej. juan.perez@empresa.com"
                value={formData.correoEmpresa}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Correo Personal</label>
              <input
                type="email"
                name="correoPersonal"
                className="form-control"
                placeholder="Ej. juan.perez@gmail.com"
                value={formData.correoPersonal}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Fecha Nacimiento</label>
              <input
                type="date"
                name="fechaNacimiento"
                className="form-control"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Género</label>
              <select
                name="idGenero"
                className="form-select"
                value={formData.idGenero}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                <option value="1">Masculino</option>
                <option value="2">Femenino</option>
                <option value="3">No binario</option>
                <option value="4">Otro / Prefiero no decir</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Estado Civil</label>
              <select
                name="idEstadoCivil"
                className="form-select"
                value={formData.idEstadoCivil}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                <option value="1">Soltero/a</option>
                <option value="2">Casado/a</option>
                <option value="3">Divorciado/a</option>
                <option value="4">Viudo/a</option>
                <option value="5">Unión de Hecho</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Generación</label>
              <select
                name="generacion"
                className="form-select"
                value={formData.generacion}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                <option value="baby_boomers">Baby Boomers (1946 - 1964)</option>
                <option value="gen_x">Generación X (1965 - 1980)</option>
                <option value="millennials">
                  Millennials / Gen Y (1981 - 1996)
                </option>
                <option value="gen_z">
                  Generación Z / Centennials (1997 - 2012)
                </option>
                <option value="gen_alpha">
                  Generación Alfa (2013 en adelante)
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Paso1Personal;
