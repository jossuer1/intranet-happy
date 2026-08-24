import { useState, useEffect } from "react";
import { getAreas, getCargos, getCiudades } from "../../services/apiService.js";

function Paso2Laboral({ formData, handleChange }) {
  const [areas, setAreas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [dataAreas, dataCargos, dataCiudades] = await Promise.all([
          getAreas(),
          getCargos(),
          getCiudades(),
        ]);
        setAreas(dataAreas);
        setCargos(dataCargos);
        setCiudades(dataCiudades);
      } catch (error) {
        console.error("Error al cargar catálogos del Paso 2:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Manejador específico para el switch que captura correctamente el valor booleano (true/false)
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    handleChange({
      target: {
        name,
        value: checked,
      },
    });
  };

  // Filtrar cargos según el área seleccionada (si tu API devuelve todos, los filtramos; si tu API los filtra por endpoint, puedes ajustar esta lógica)
  const cargosFiltrados = formData.idArea
    ? cargos.filter((cargo) => String(cargo.idArea) === String(formData.idArea))
    : [];

  return (
    <div>
      <h5 className="mb-4 text-secondary">
        Paso 2: Información Laboral y Contacto
      </h5>

      <div className="row g-3">
        {/* ÁREA */}
        <div className="col-md-6">
          <label className="form-label">Área / Departamento</label>
          <select
            name="idArea"
            className="form-select"
            value={formData.idArea || ""}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Seleccione un área...</option>
            {areas.map((area) => (
              <option key={area.idArea} value={area.idArea}>
                {area.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* CARGO (Habilitado solo si se selecciona un área) */}
        <div className="col-md-6">
          <label className="form-label">Cargo / Puesto</label>
          <select
            name="idCargo"
            className="form-select"
            value={formData.idCargo}
            onChange={handleChange}
            required
            disabled={loading || !formData.idArea}
          >
            <option value="">Seleccione un cargo...</option>
            {cargosFiltrados.map((cargo) => (
              <option key={cargo.idCargo} value={cargo.idCargo}>
                {cargo.nombre}
              </option>
            ))}
          </select>
          {!formData.idArea && (
            <small className="text-muted">Primero seleccione un área.</small>
          )}
        </div>

        {/* CIUDAD */}
        <div className="col-md-6">
          <label className="form-label">Ciudad</label>
          <select
            name="idCiudad"
            className="form-select"
            value={formData.idCiudad}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Seleccione una ciudad...</option>
            {ciudades.map((ciudad) => (
              <option key={ciudad.idCiudad} value={ciudad.idCiudad}>
                {ciudad.nombre}{" "}
                {ciudad.provincia ? `(${ciudad.provincia.nombre})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* FECHA DE INGRESO */}
        <div className="col-md-6">
          <label className="form-label">Fecha de Ingreso a la Empresa</label>
          <input
            type="date"
            name="fechaIngreso"
            className="form-control"
            value={formData.fechaIngreso}
            onChange={handleChange}
            required
          />
        </div>

        {/* CELULAR EMPRESA */}
        <div className="col-md-6">
          <label className="form-label">Celular Empresarial</label>
          <input
            type="text"
            name="celularEmpresa"
            className="form-control"
            placeholder="Ej. 0991234567"
            value={formData.celularEmpresa}
            onChange={handleChange}
          />
        </div>

        {/* CELULAR PERSONAL */}
        <div className="col-md-6">
          <label className="form-label">Celular Personal</label>
          <input
            type="text"
            name="celularPersonal"
            className="form-control"
            placeholder="Ej. 0987654321"
            value={formData.celularPersonal}
            onChange={handleChange}
            required
          />
        </div>

        {/* DIRECCIÓN */}
        <div className="col-md-6">
          <label className="form-label">Dirección Domiciliaria</label>
          <input
            type="text"
            name="direccion"
            className="form-control"
            placeholder="Ej. Av. Amazonas y Corea"
            value={formData.direccion}
            onChange={handleChange}
          />
        </div>

        {/* SECCIÓN DE VACACIONES */}
        <div className="col-12 mt-4">
          <div className="card bg-light border-0 p-3 shadow-sm">
            <h6 className="text-secondary mb-3">Configuración de Vacaciones</h6>

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="tieneVacacionesSwitch"
                name="tieneVacaciones"
                // Nos aseguramos de evaluar booleano puro (false por defecto si viene undefined/null)
                checked={!!formData.tieneVacaciones}
                onChange={handleSwitchChange}
              />
              <label
                className="form-check-label fw-bold"
                htmlFor="tieneVacacionesSwitch"
              >
                ¿El empleado acumula o tiene días de vacaciones asignados?
              </label>
            </div>

            {formData.tieneVacaciones && (
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">
                    Días de Vacaciones Asignados Iniciales
                  </label>
                  <input
                    type="number"
                    name="diasVacacionesAsignados"
                    className="form-control"
                    min="0"
                    value={formData.diasVacacionesAsignados || ""}
                    onChange={handleChange}
                    placeholder="Ej. 15"
                  />
                  <small className="text-muted">
                    Número de días base con los que ingresa o cuenta el
                    colaborador.
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Paso2Laboral;
