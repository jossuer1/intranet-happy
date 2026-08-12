function Paso2Laboral({ formData, handleChange }) {
  return (
    <div>
      <h5 className="mb-3 text-secondary">
        Paso 2: Datos Laborales y Ubicación
      </h5>
      <div className="row g-3">
        <div className="col-md-8">
          <label className="form-label">Dirección de Domicilio</label>
          <input
            type="text"
            name="direccion"
            className="form-control"
            placeholder="Ej. Av. Amazonas N34-12 y Av. República"
            value={formData.direccion}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Ciudad</label>
          <select
            name="idCiudad"
            className="form-select"
            value={formData.idCiudad}
            onChange={handleChange}
          >
            <option value="">Seleccione...</option>
            <option value="1">Quito</option>
            <option value="2">Guayaquil</option>
            <option value="3">Cuenca</option>
            <option value="4">Ambato</option>
            <option value="5">Manta</option>
            <option value="6">Santo Domingo</option>
          </select>
        </div>

        {/* CAMPO ÁREA DE LA EMPRESA */}
        <div className="col-md-6">
          <label className="form-label">Área / Departamento</label>
          <select
            name="idArea"
            className="form-select"
            value={formData.idArea}
            onChange={handleChange}
          >
            <option value="">Seleccione...</option>
            <option value="1">Tecnología de la Información / Sistemas</option>
            <option value="2">Recursos Humanos / Talento Humano</option>
            <option value="3">Contabilidad y Finanzas</option>
            <option value="4">Operaciones y Logística</option>
            <option value="5">Ventas y Comercial</option>
            <option value="6">Marketing y Comunicación</option>
            <option value="7">Administración General</option>
          </select>
        </div>

        {/* CAMPO CARGO */}
        <div className="col-md-6">
          <label className="form-label">Cargo</label>
          <select
            name="idCargo"
            className="form-select"
            value={formData.idCargo}
            onChange={handleChange}
          >
            <option value="">Seleccione...</option>
            <option value="1">Director / Gerente de Área</option>
            <option value="2">Jefe de Área / Supervisor</option>
            <option value="3">Coordinador / Líder de Proyecto</option>
            <option value="4">Especialista / Senior</option>
            <option value="5">Analista / Junior</option>
            <option value="6">Asistente / Auxiliar</option>
            <option value="7">Pasante / Practicante</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Fecha de Ingreso</label>
          <input
            type="date"
            name="fechaIngreso"
            className="form-control"
            value={formData.fechaIngreso}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Celular Personal</label>
          <input
            type="text"
            name="celularPersonal"
            className="form-control"
            placeholder="Ej. 0991234567"
            value={formData.celularPersonal}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Celular Empresa</label>
          <input
            type="text"
            name="celularEmpresa"
            className="form-control"
            placeholder="Ej. 0987654321"
            value={formData.celularEmpresa}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}

export default Paso2Laboral;
