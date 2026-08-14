import React, { useState } from "react";
import AppLayout from "../../components/layout/AppLayout";

function RegistroAsistencia() {
  const [fechaDesde, setFechaDesde] = useState("2026-08-01");
  const [fechaHasta, setFechaHasta] = useState("2026-08-12");

  // Simulación de registros sincronizados desde el marcador físico/tag
  const [asistencias] = useState([
    {
      id: 1,
      fecha: "2026-08-12",
      entrada: "08:02 AM",
      salidaAlmuerzo: "01:05 PM",
      entradaAlmuerzo: "02:00 PM",
      salida: "05:01 PM",
      estado: "A Tiempo",
      observacion: "Marcación física Tag #402",
    },
    {
      id: 2,
      fecha: "2026-08-11",
      entrada: "08:15 AM",
      salidaAlmuerzo: "01:00 PM",
      entradaAlmuerzo: "02:02 PM",
      salida: "05:00 PM",
      estado: "Atraso",
      observacion: "Marcación física Tag #402",
    },
    {
      id: 3,
      fecha: "2026-08-10",
      entrada: "07:58 AM",
      salidaAlmuerzo: "01:10 PM",
      entradaAlmuerzo: "02:05 PM",
      salida: "05:10 PM",
      estado: "A Tiempo",
      observacion: "Marcación física Tag #402",
    },
  ]);

  return (
    <AppLayout usuarioRol="RRHH">
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-3">
          <div>
            <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-primary fs-5"></i>
              Mi Historial de Asistencia y Marcaciones
            </h6>
            <small className="text-muted">
              Consulta las marcas registradas por el sistema biométrico / tag
            </small>
          </div>

          <div className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill">
            <i className="bi bi-person-badge me-1"></i> ID Tag: #402 - Activo
          </div>
        </div>

        {/* Filtros de Búsqueda por Rango de Fechas */}
        <div className="row g-3 align-items-end mb-4 bg-light p-3 rounded-3 border">
          <div className="col-md-4">
            <label className="form-label text-muted small fw-semibold mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              className="form-control"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label text-muted small fw-semibold mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              className="form-control"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
          <div className="col-md-4 d-flex gap-2">
            <button className="btn btn-primary w-100 rounded-3 d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-funnel"></i>
              Filtrar
            </button>
            <button
              className="btn btn-outline-secondary rounded-3"
              title="Limpiar filtro"
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>

        {/* Tabla de Registros */}
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light text-uppercase fs-7 text-muted">
              <tr>
                <th>Fecha</th>
                <th className="text-center">Entrada</th>
                <th className="text-center">Salida Almuerzo</th>
                <th className="text-center">Entrada Almuerzo</th>
                <th className="text-center">Salida</th>
                <th className="text-center">Estado</th>
                <th>Origen</th>
              </tr>
            </thead>
            <tbody>
              {asistencias.map((item) => (
                <tr key={item.id}>
                  <td className="fw-semibold text-dark">{item.fecha}</td>
                  <td className="text-center fw-semibold text-success">
                    {item.entrada}
                  </td>
                  <td className="text-center text-muted">
                    {item.salidaAlmuerzo}
                  </td>
                  <td className="text-center text-muted">
                    {item.entradaAlmuerzo}
                  </td>
                  <td className="text-center fw-semibold text-danger">
                    {item.salida}
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge rounded-pill px-2.5 py-1 ${
                        item.estado === "A Tiempo"
                          ? "bg-success-subtle text-success border border-success-subtle"
                          : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                      }`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td>
                    <small className="text-muted">{item.observacion}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

export default RegistroAsistencia;
