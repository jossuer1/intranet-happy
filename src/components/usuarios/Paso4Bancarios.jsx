function Paso4Bancarios({
  formData,
  handleChange,
  agregarCuentaBancaria,
  eliminarCuentaBancaria,
  handleBancoChange,
}) {
  return (
    <div>
      <h5 className="mb-3 text-secondary">Paso 4: Datos Bancarios y Décimos</h5>

      <div className="mb-4 col-md-6">
        <label className="form-label fw-bold d-block">¿Acumula Décimos?</label>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="acumulaDecimos"
            id="acumulaDecimosSi"
            value="1"
            checked={
              formData.acumulaDecimos === "1" || formData.acumulaDecimos === 1
            }
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="acumulaDecimosSi">
            Sí
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="acumulaDecimos"
            id="acumulaDecimosNo"
            value="0"
            checked={
              formData.acumulaDecimos === "0" || formData.acumulaDecimos === 0
            }
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="acumulaDecimosNo">
            No
          </label>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="m-0 fw-bold text-dark">Cuentas Bancarias</h6>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={agregarCuentaBancaria}
        >
          + Agregar Cuenta
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
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Paso4Bancarios;
