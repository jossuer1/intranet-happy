import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import SectionHeader from "../../components/layout/SectionHeader";
import { getMisVacaciones } from "../../services/apiService";

function TarjetaResumen({ etiqueta, valor }) {
  return (
    <div className="col-12 col-sm-4">
      <div className="card shadow-sm border-0 h-100 text-center">
        <div className="card-body p-4">
          <p className="text-uppercase text-muted fw-bold small mb-2">
            {etiqueta}
          </p>
          <p className="display-6 fw-bold text-brand mb-0">{valor}</p>
        </div>
      </div>
    </div>
  );
}

function badgeEstado(estado) {
  const clases = {
    Aprobado: "bg-success",
    Pendiente: "bg-warning text-dark",
    Rechazado: "bg-danger",
  };
  return clases[estado] || "bg-secondary";
}

function MisVacaciones() {
  const [resumen, setResumen] = useState({
    diasDisponibles: 0,
    diasTomados: 0,
    diasPendientesAprobacion: 0,
    solicitudes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarHistorialPersonal = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMisVacaciones();

        // Mapeo defensivo asegurando las propiedades del backend
        setResumen({
          diasDisponibles: data?.diasDisponibles ?? 0,
          diasTomados: data?.diasTomados ?? 0,
          diasPendientesAprobacion: data?.diasPendientesAprobacion ?? 0,
          solicitudes: Array.isArray(data?.solicitudes) ? data.solicitudes : [],
        });
      } catch (err) {
        setError(
          err.message || "No se pudo cargar la información de tus vacaciones.",
        );
      } finally {
        setLoading(false);
      }
    };

    cargarHistorialPersonal();
  }, []);

  const {
    diasDisponibles,
    diasTomados,
    diasPendientesAprobacion,
    solicitudes,
  } = resumen;

  return (
    <AppLayout>
      <SectionHeader titulo="Mis Vacaciones" volverA="/dashboard" />

      <div className="container my-4 flex-grow-1">
        {loading ? (
          <div className="text-center my-5 py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando datos...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger my-3" role="alert">
            {error}
          </div>
        ) : (
          <>
            <div className="row g-3 mb-4">
              <TarjetaResumen
                etiqueta="Días disponibles"
                valor={diasDisponibles}
              />
              <TarjetaResumen etiqueta="Días tomados" valor={diasTomados} />
              <TarjetaResumen
                etiqueta="Pendientes de aprobación"
                valor={diasPendientesAprobacion}
              />
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h5 className="card-title fw-bold mb-4">
                  Historial de solicitudes
                </h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Desde</th>
                        <th>Hasta</th>
                        <th>Días</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitudes.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center text-muted py-4"
                          >
                            No tienes solicitudes registradas.
                          </td>
                        </tr>
                      ) : (
                        solicitudes.map((s, index) => (
                          <tr key={s.id || index}>
                            <td>{s.fechaInicio}</td>
                            <td>{s.fechaFin}</td>
                            <td>{s.dias}</td>
                            <td>
                              <span
                                className={`badge ${badgeEstado(s.estado)}`}
                              >
                                {s.estado}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default MisVacaciones;
