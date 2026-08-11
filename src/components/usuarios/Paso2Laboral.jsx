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
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Cargo</label>
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
        <div className="col-md-6">
          <label className="form-label">Celular Personal</label>
          <input
            type="text"
            name="celularPersonal"
            className="form-control"
            value={formData.celularPersonal}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Celular Empresa</label>
          <input
            type="text"
            name="celularEmpresa"
            className="form-control"
            value={formData.celularEmpresa}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}

export default Paso2Laboral;
