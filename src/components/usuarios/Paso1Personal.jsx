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
                value={formData.correoPersonal}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
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
            <div className="col-md-4">
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
              </select>
            </div>
            <div className="col-md-4">
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
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Paso1Personal;
