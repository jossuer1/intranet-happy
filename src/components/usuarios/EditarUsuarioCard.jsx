import { useState, useEffect } from "react";

function IconGuardar() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11 2H9v3h2z" />
      <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5v-4H1.5a.5.5 0 0 0-.5.5m3-.5v4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
    </svg>
  );
}

function IconMas() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
    </svg>
  );
}

function IconEliminar() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
    </svg>
  );
}

/**
 * Ficha de usuario (Card) con los campos completos del wizard para edición.
 */
function EditarUsuarioCard({ usuario, onGuardar, onCancelar }) {
  const [formData, setFormData] = useState({
    fotoFile: null,
    fotoPreview: null,
    nombres: "",
    cedula: "",
    correoEmpresa: "",
    correoPersonal: "",
    fechaNacimiento: "",
    idGenero: "",
    idEtnia: "",
    idEstadoCivil: "",
    direccion: "",
    idCiudad: "",
    idCargo: "",
    fechaIngreso: "",
    celularPersonal: "",
    celularEmpresa: "",
    numeroHijos: 0,
    familiares: [],
    contactosEmergencia: [],
    acumulaDecimos: "0",
    datosBancarios: [],
    titulos: [],
    estado: "Activo",
  });

  useEffect(() => {
    if (usuario) {
      setFormData({
        fotoFile: null,
        fotoPreview: usuario.fotoPreview || usuario.fotoUrl || null,
        nombres: usuario.nombres || usuario.nombre || "",
        cedula: usuario.cedula || "",
        correoEmpresa: usuario.correoEmpresa || usuario.correo || "",
        correoPersonal: usuario.correoPersonal || "",
        fechaNacimiento: usuario.fechaNacimiento || "",
        idGenero: usuario.idGenero || "",
        idEtnia: usuario.idEtnia || "",
        idEstadoCivil: usuario.idEstadoCivil || "",
        direccion: usuario.direccion || "",
        idCiudad: usuario.idCiudad || "",
        idCargo: usuario.idCargo || "",
        fechaIngreso: usuario.fechaIngreso || "",
        celularPersonal: usuario.celularPersonal || "",
        celularEmpresa: usuario.celularEmpresa || "",
        numeroHijos: usuario.numeroHijos || 0,
        familiares: usuario.familiares || [],
        contactosEmergencia: usuario.contactosEmergencia || [],
        acumulaDecimos:
          usuario.acumulaDecimos !== undefined
            ? String(usuario.acumulaDecimos)
            : "0",
        datosBancarios: usuario.datosBancarios || [],
        titulos: usuario.titulos || [],
        estado: usuario.estado || "Activo",
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        fotoFile: file,
        fotoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const toggleEstado = () => {
    setFormData((prev) => ({
      ...prev,
      estado: prev.estado === "Activo" ? "Inactivo" : "Activo",
    }));
  };

  // --- Handlers Familiares (Hijos) ---
  const agregarFamiliar = () =>
    setFormData((prev) => ({
      ...prev,
      familiares: [...prev.familiares, { nombreHijo: "", fechaNacimiento: "" }],
    }));

  const eliminarFamiliar = (index) =>
    setFormData((prev) => ({
      ...prev,
      familiares: prev.familiares.filter((_, i) => i !== index),
    }));

  const handleFamiliarChange = (index, e) => {
    const { name, value } = e.target;
    const nuevos = [...formData.familiares];
    nuevos[index][name] = value;
    setFormData({ ...formData, familiares: nuevos });
  };

  // --- Handlers Contactos de Emergencia ---
  const agregarContacto = () =>
    setFormData((prev) => ({
      ...prev,
      contactosEmergencia: [
        ...prev.contactosEmergencia,
        { nombre: "", numeroCelular: "", parentesco: "" },
      ],
    }));

  const eliminarContacto = (index) =>
    setFormData((prev) => ({
      ...prev,
      contactosEmergencia: prev.contactosEmergencia.filter(
        (_, i) => i !== index,
      ),
    }));

  const handleContactoChange = (index, e) => {
    const { name, value } = e.target;
    const nuevos = [...formData.contactosEmergencia];
    nuevos[index][name] = value;
    setFormData({ ...formData, contactosEmergencia: nuevos });
  };

  // --- Handlers Cuentas Bancarias ---
  const agregarCuentaBancaria = () =>
    setFormData((prev) => ({
      ...prev,
      datosBancarios: [
        ...prev.datosBancarios,
        { idBanco: "", numeroCuenta: "", tipoCuenta: "AHORROS" },
      ],
    }));

  const eliminarCuentaBancaria = (index) =>
    setFormData((prev) => ({
      ...prev,
      datosBancarios: prev.datosBancarios.filter((_, i) => i !== index),
    }));

  const handleBancoChange = (index, e) => {
    const { name, value } = e.target;
    const nuevas = [...formData.datosBancarios];
    nuevas[index][name] = value;
    setFormData({ ...formData, datosBancarios: nuevas });
  };

  // --- Handlers Títulos ---
  const agregarTitulo = () =>
    setFormData((prev) => ({
      ...prev,
      titulos: [
        ...prev.titulos,
        { titulo: "", institucionEducativaSuperior: "" },
      ],
    }));

  const eliminarTitulo = (index) =>
    setFormData((prev) => ({
      ...prev,
      titulos: prev.titulos.filter((_, i) => i !== index),
    }));

  const handleTituloChange = (index, e) => {
    const { name, value } = e.target;
    const nuevos = [...formData.titulos];
    nuevos[index][name] = value;
    setFormData({ ...formData, titulos: nuevos });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onGuardar) onGuardar(formData);
  };

  const esActivo = formData.estado === "Activo";

  return (
    <div className="card shadow-sm border-0 mb-4">
      {/* Header del Card */}
      <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          {formData.fotoPreview ? (
            <img
              src={formData.fotoPreview}
              alt="Avatar"
              className="rounded-circle object-fit-cover border border-2 border-primary shadow-sm"
              style={{ width: "56px", height: "56px" }}
            />
          ) : (
            <div
              className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: "56px", height: "56px", fontSize: "1.1rem" }}
            >
              {(formData.nombres || "??")
                .split(" ")
                .slice(0, 2)
                .map((p) => p[0])
                .join("")
                .toUpperCase()}
            </div>
          )}
          <div>
            <h5 className="fw-bold mb-0 text-dark">
              {formData.nombres || "Editar Usuario"}
            </h5>
            <small className="text-muted">
              {formData.correoEmpresa ||
                "Actualización de ficha integral de usuario"}
            </small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Switch de Estado Activo / Inactivo */}
          <div className="form-check form-switch d-flex align-items-center gap-2 me-2 mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="switchEstado"
              checked={esActivo}
              onChange={toggleEstado}
              style={{ cursor: "pointer" }}
            />
            <label
              className={`form-check-label small fw-semibold mb-0 ${
                esActivo ? "text-success" : "text-secondary"
              }`}
              htmlFor="switchEstado"
              style={{ cursor: "pointer" }}
            >
              {esActivo ? "Activo" : "Inactivo"}
            </label>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-3"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-sm px-3 text-white d-inline-flex align-items-center gap-2 bg-primary border-0"
            onClick={handleSubmit}
          >
            <IconGuardar /> Guardar Cambios
          </button>
        </div>
      </div>

      {/* Cuerpo del Formulario organizado por Secciones */}
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          {/* SECCIÓN 1: DATOS PERSONALES Y FOTO */}
          <h6 className="fw-bold text-primary mb-3">1. Datos Personales</h6>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-3 text-center border-end pe-md-4">
              <div className="mb-2 d-flex justify-content-center">
                {formData.fotoPreview ? (
                  <img
                    src={formData.fotoPreview}
                    alt="Vista previa"
                    className="rounded-circle object-fit-cover border border-2 border-primary shadow-sm"
                    style={{ width: "120px", height: "120px" }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center shadow-sm"
                    style={{
                      width: "120px",
                      height: "120px",
                      fontSize: "3rem",
                    }}
                  >
                    👤
                  </div>
                )}
              </div>
              <input
                type="file"
                id="editFotoInput"
                name="foto"
                accept="image/*"
                className="d-none"
                onChange={handleImagenChange}
              />
              <label
                htmlFor="editFotoInput"
                className="btn btn-outline-primary btn-sm w-100"
              >
                {formData.fotoPreview ? "Cambiar Imagen" : "Subir Imagen"}
              </label>
            </div>

            <div className="col-12 col-md-9">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    Nombres Completos
                  </label>
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
                  <label className="form-label small fw-semibold">Cédula</label>
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
                  <label className="form-label small fw-semibold">
                    Correo Empresarial
                  </label>
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
                  <label className="form-label small fw-semibold">
                    Correo Personal
                  </label>
                  <input
                    type="email"
                    name="correoPersonal"
                    className="form-control"
                    value={formData.correoPersonal}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">
                    Fecha Nacimiento
                  </label>
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
                  <label className="form-label small fw-semibold">Género</label>
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
                  <label className="form-label small fw-semibold">
                    Estado Civil
                  </label>
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

          <hr className="my-4 text-muted opacity-25" />

          {/* SECCIÓN 2: DATOS LABORALES Y UBICACIÓN */}
          <h6 className="fw-bold text-primary mb-3">
            2. Datos Laborales y Ubicación
          </h6>
          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <label className="form-label small fw-semibold">
                Dirección de Domicilio
              </label>
              <input
                type="text"
                name="direccion"
                className="form-control"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Ciudad</label>
              <select
                name="idCiudad"
                className="form-select"
                value={formData.idCiudad}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                <option value="1">Quito</option>
                <option value="2">Guayaquil</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Cargo</label>
              <select
                name="idCargo"
                className="form-select"
                value={formData.idCargo}
                onChange={handleChange}
              >
                <option value="">Seleccione...</option>
                <option value="1">Analista de Sistemas</option>
                <option value="2">Desarrollador</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">
                Fecha de Ingreso
              </label>
              <input
                type="date"
                name="fechaIngreso"
                className="form-control"
                value={formData.fechaIngreso}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">
                Celular Personal
              </label>
              <input
                type="text"
                name="celularPersonal"
                className="form-control"
                value={formData.celularPersonal}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">
                Celular Empresa
              </label>
              <input
                type="text"
                name="celularEmpresa"
                className="form-control"
                value={formData.celularEmpresa}
                onChange={handleChange}
              />
            </div>
          </div>

          <hr className="my-4 text-muted opacity-25" />

          {/* SECCIÓN 3: INFORMACIÓN FAMILIAR Y CONTACTOS */}
          <h6 className="fw-bold text-primary mb-3">
            3. Información Familiar y Contactos
          </h6>

          {/* Hijos */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold text-dark small">
                Hijos Registrados
              </span>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                onClick={agregarFamiliar}
              >
                <IconMas /> Agregar Hijo
              </button>
            </div>

            {formData.familiares.map((item, index) => (
              <div
                key={index}
                className="row g-2 align-items-center mb-2 bg-light p-2 rounded"
              >
                <div className="col-md-6">
                  <input
                    type="text"
                    name="nombreHijo"
                    className="form-control form-control-sm"
                    placeholder="Nombre del hijo/a"
                    value={item.nombreHijo}
                    onChange={(e) => handleFamiliarChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="date"
                    name="fechaNacimiento"
                    className="form-control form-control-sm"
                    value={item.fechaNacimiento}
                    onChange={(e) => handleFamiliarChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-2 text-end">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => eliminarFamiliar(index)}
                  >
                    <IconEliminar />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Contactos de Emergencia */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold text-dark small">
                Contactos de Emergencia
              </span>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                onClick={agregarContacto}
              >
                <IconMas /> Agregar Contacto
              </button>
            </div>

            {formData.contactosEmergencia.map((item, index) => (
              <div
                key={index}
                className="row g-2 align-items-center mb-2 bg-light p-2 rounded"
              >
                <div className="col-md-4">
                  <input
                    type="text"
                    name="nombre"
                    className="form-control form-control-sm"
                    placeholder="Nombre completo"
                    value={item.nombre}
                    onChange={(e) => handleContactoChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    name="numeroCelular"
                    className="form-control form-control-sm"
                    placeholder="Teléfono"
                    value={item.numeroCelular}
                    onChange={(e) => handleContactoChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    name="parentesco"
                    className="form-control form-control-sm"
                    placeholder="Parentesco / Relación"
                    value={item.parentesco}
                    onChange={(e) => handleContactoChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-2 text-end">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => eliminarContacto(index)}
                  >
                    <IconEliminar />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-4 text-muted opacity-25" />

          {/* SECCIÓN 4: DATOS BANCARIOS Y DÉCIMOS */}
          <h6 className="fw-bold text-primary mb-3">
            4. Datos Bancarios y Décimos
          </h6>
          <div className="mb-3">
            <label className="form-label small fw-semibold d-block">
              ¿Acumula Décimos?
            </label>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="acumulaDecimos"
                id="editAcumulaSi"
                value="1"
                checked={formData.acumulaDecimos === "1"}
                onChange={handleChange}
              />
              <label className="form-check-label small" htmlFor="editAcumulaSi">
                Sí
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="acumulaDecimos"
                id="editAcumulaNo"
                value="0"
                checked={formData.acumulaDecimos === "0"}
                onChange={handleChange}
              />
              <label className="form-check-label small" htmlFor="editAcumulaNo">
                No
              </label>
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold text-dark small">
                Cuentas Bancarias
              </span>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                onClick={agregarCuentaBancaria}
              >
                <IconMas /> Agregar Cuenta
              </button>
            </div>

            {formData.datosBancarios.map((item, index) => (
              <div
                key={index}
                className="row g-2 align-items-center mb-2 bg-light p-2 rounded"
              >
                <div className="col-md-4">
                  <select
                    name="idBanco"
                    className="form-select form-select-sm"
                    value={item.idBanco}
                    onChange={(e) => handleBancoChange(index, e)}
                    required
                  >
                    <option value="">Seleccione Banco...</option>
                    <option value="1">Banco Pichincha</option>
                    <option value="2">Banco Guayaquil</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    name="numeroCuenta"
                    className="form-control form-control-sm"
                    placeholder="N° de Cuenta"
                    value={item.numeroCuenta}
                    onChange={(e) => handleBancoChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <select
                    name="tipoCuenta"
                    className="form-select form-select-sm"
                    value={item.tipoCuenta}
                    onChange={(e) => handleBancoChange(index, e)}
                  >
                    <option value="AHORROS">AHORROS</option>
                    <option value="CORRIENTE">CORRIENTE</option>
                  </select>
                </div>
                <div className="col-md-2 text-end">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => eliminarCuentaBancaria(index)}
                  >
                    <IconEliminar />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-4 text-muted opacity-25" />

          {/* SECCIÓN 5: FORMACIÓN ACADÉMICA */}
          <h6 className="fw-bold text-primary mb-3">5. Formación Académica</h6>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold text-dark small">
                Títulos Obtenidos
              </span>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                onClick={agregarTitulo}
              >
                <IconMas /> Agregar Título
              </button>
            </div>

            {formData.titulos.map((item, index) => (
              <div
                key={index}
                className="row g-2 align-items-center mb-2 bg-light p-2 rounded"
              >
                <div className="col-md-5">
                  <input
                    type="text"
                    name="titulo"
                    className="form-control form-control-sm"
                    placeholder="Ej. Tecnólogo en Desarrollo de Software"
                    value={item.titulo}
                    onChange={(e) => handleTituloChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <input
                    type="text"
                    name="institucionEducativaSuperior"
                    className="form-control form-control-sm"
                    placeholder="Institución Educativa Superior"
                    value={item.institucionEducativaSuperior}
                    onChange={(e) => handleTituloChange(index, e)}
                  />
                </div>
                <div className="col-md-2 text-end">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => eliminarTitulo(index)}
                  >
                    <IconEliminar />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Botones inferiores opcionales de acceso rápido */}
          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={onCancelar}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
            >
              <IconGuardar /> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarUsuarioCard;
