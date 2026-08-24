import React, { useState, useEffect } from "react";
import { getBancos } from "../../services/apiService";

function Paso4Bancos({ formData, setFormData }) {
  const [bancos, setBancos] = useState([]);
  const [loadingBancos, setLoadingBancos] = useState(true);

  useEffect(() => {
    const cargarBancos = async () => {
      try {
        const dataBancos = await getBancos();
        setBancos(dataBancos);
      } catch (error) {
        console.error("Error al cargar bancos:", error);
      } finally {
        setLoadingBancos(false);
      }
    };

    cargarBancos();
  }, []);

  const handleBancoChange = (index, e) => {
    const { name, value } = e.target;
    const nuevasCuentas = [...formData.datosBancarios];
    nuevasCuentas[index][name] = value;
    setFormData({
      ...formData,
      datosBancarios: nuevasCuentas,
    });
  };

  const agregarCuenta = () => {
    setFormData({
      ...formData,
      datosBancarios: [
        ...formData.datosBancarios,
        { idBanco: "", tipoCuenta: "Ahorros", numeroCuenta: "" },
      ],
    });
  };

  const eliminarCuenta = (index) => {
    const nuevasCuentas = formData.datosBancarios.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      datosBancarios: nuevasCuentas,
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="text-secondary m-0">Paso 4: Información Bancaria</h5>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={agregarCuenta}
        >
          + Agregar Cuenta Bancaria
        </button>
      </div>

      {formData.datosBancarios.length === 0 ? (
        <div className="text-center py-4 bg-light rounded-3 text-muted">
          <p className="mb-1">No has agregado ninguna cuenta bancaria.</p>
          <small>
            Requerido para la acreditación de pagos de nómina o beneficios.
          </small>
        </div>
      ) : (
        formData.datosBancarios.map((cuenta, index) => (
          <div
            key={index}
            className="card border-0 bg-light p-3 mb-3 shadow-sm"
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold text-primary">
                Cuenta Bancaria #{index + 1}
              </span>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => eliminarCuenta(index)}
              >
                Eliminar
              </button>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Banco</label>
                <select
                  name="idBanco"
                  className="form-select"
                  value={cuenta.idBanco}
                  onChange={(e) => handleBancoChange(index, e)}
                  required
                  disabled={loadingBancos}
                >
                  <option value="">Seleccione un banco...</option>
                  {bancos.map((banco) => (
                    <option key={banco.idBanco} value={banco.idBanco}>
                      {banco.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Tipo de Cuenta</label>
                <select
                  name="tipoCuenta"
                  className="form-select"
                  value={cuenta.tipoCuenta}
                  onChange={(e) => handleBancoChange(index, e)}
                  required
                >
                  <option value="Ahorros">Ahorros</option>
                  <option value="Corriente">Corriente</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Número de Cuenta</label>
                <input
                  type="text"
                  name="numeroCuenta"
                  className="form-control"
                  placeholder="Ej. 2200112233"
                  value={cuenta.numeroCuenta}
                  onChange={(e) => handleBancoChange(index, e)}
                  required
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Paso4Bancos;
