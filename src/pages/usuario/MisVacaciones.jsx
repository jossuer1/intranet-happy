import AppLayout from "../../components/layout/AppLayout";
import SectionHeader from "../../components/layout/SectionHeader";
import { vacacionesMock } from "../../mocks/usuarioActualMock";

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
  // TODO: cuando exista backend, reemplazar por el histórico real del usuario
  const { diasDisponibles, diasTomados, diasPendientesAprobacion, solicitudes } =
    vacacionesMock;

  return (
    <AppLayout>
      <SectionHeader titulo="Mis Vacaciones" volverA="/dashboard" />

      <div className="container my-4 flex-grow-1">
        <div className="row g-3 mb-4">
          <TarjetaResumen etiqueta="Días disponibles" valor={diasDisponibles} />
          <TarjetaResumen etiqueta="Días tomados" valor={diasTomados} />
          <TarjetaResumen
            etiqueta="Pendientes de aprobación"
            valor={diasPendientesAprobacion}
          />
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h5 className="card-title fw-bold mb-4">Historial de solicitudes</h5>
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
                  {solicitudes.map((s) => (
                    <tr key={s.id}>
                      <td>{s.fechaInicio}</td>
                      <td>{s.fechaFin}</td>
                      <td>{s.dias}</td>
                      <td>
                        <span className={`badge ${badgeEstado(s.estado)}`}>
                          {s.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default MisVacaciones;
