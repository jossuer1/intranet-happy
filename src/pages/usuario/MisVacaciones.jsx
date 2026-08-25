import { useQuery } from "@tanstack/react-query";
import AppLayout from "../../components/layout/AppLayout";
import SectionHeader from "../../components/layout/SectionHeader";
import { getSaldo, getMisVacaciones } from "../../services/vacacionesService";
import { useAuthStore } from "../../store/useAuthStore";

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

// El backend registra movimientos de tipo "Descuento" (vacación tomada) o "Ajuste"
// (corrección manual). No existe un flujo de aprobación con estados Pendiente/Aprobado.
function badgeTipoMovimiento(tipo) {
  return tipo === "Descuento" ? "bg-danger" : "bg-success";
}

function MisVacaciones() {
  const userStore = useAuthStore((state) => state.user);
  const fetchPerfil = useAuthStore((state) => state.fetchPerfil);

  // 1. Query para cargar el perfil si no existe en el store
  const { data: user, isLoading: loadingPerfil } = useQuery({
    queryKey: ["perfilUsuario"],
    queryFn: fetchPerfil,
    initialData: userStore || undefined,
    staleTime: 1000 * 60 * 5,
  });

  const idUsuario = user?.idUsuario;
  const habilitado = Boolean(
    user && user.tieneVacaciones !== false && idUsuario,
  );

  // 2. Saldo actual (GET /vacaciones/saldo/{idUsuario}) -> SaldoVacacionesDto
  const {
    data: saldo,
    isLoading: loadingSaldo,
    isError: errorSaldo,
    error: errSaldo,
  } = useQuery({
    queryKey: ["vacaciones", "saldo", idUsuario],
    queryFn: () => getSaldo(idUsuario),
    enabled: habilitado,
    staleTime: 1000 * 60 * 2,
  });

  // 3. Historial de movimientos propios (GET /vacaciones/mis-vacaciones) -> VacacionDto[]
  const {
    data: historial,
    isLoading: loadingHistorial,
    isError: errorHistorial,
    error: errHistorial,
  } = useQuery({
    queryKey: ["vacaciones", "mis-vacaciones"],
    queryFn: getMisVacaciones,
    enabled: habilitado,
    staleTime: 1000 * 60 * 2,
    select: (data) => (Array.isArray(data) ? data : []),
  });

  const loading = loadingPerfil || (habilitado && (loadingSaldo || loadingHistorial));
  const isError = errorSaldo || errorHistorial;
  const error = errSaldo || errHistorial;

  // Guard: Si no tiene el beneficio de vacaciones
  if (user && user.tieneVacaciones === false) {
    return (
      <AppLayout>
        <SectionHeader titulo="Mis Vacaciones" volverA="/dashboard" />
        <div className="container my-5 flex-grow-1">
          <div className="text-center py-5 text-muted">
            <i className="bi bi-lock fs-1 d-block mb-3"></i>
            <p className="mb-0 fw-semibold">
              Aún no tienes acceso a esta opción.
            </p>
            <small>
              Tu perfil no tiene habilitado el beneficio de vacaciones. Si crees
              que esto es un error, contacta a RRHH.
            </small>
          </div>
        </div>
      </AppLayout>
    );
  }

  const movimientos = historial || [];

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
        ) : isError ? (
          <div className="alert alert-danger my-3" role="alert">
            {error?.message ||
              "No se pudo cargar la información de tus vacaciones."}
          </div>
        ) : (
          <>
            <div className="row g-3 mb-4">
              <TarjetaResumen
                etiqueta="Días asignados"
                valor={saldo?.diasAsignados ?? 0}
              />
              <TarjetaResumen
                etiqueta="Días tomados"
                valor={saldo?.diasDescontados ?? 0}
              />
              <TarjetaResumen
                etiqueta="Días disponibles"
                valor={saldo?.diasDisponibles ?? 0}
              />
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h5 className="card-title fw-bold mb-4">
                  Historial de movimientos
                </h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Tipo</th>
                        <th>Desde</th>
                        <th>Hasta</th>
                        <th>Días</th>
                        <th>Observación</th>
                        <th>Registrado por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientos.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center text-muted py-4"
                          >
                            No tienes movimientos de vacaciones registrados.
                          </td>
                        </tr>
                      ) : (
                        movimientos.map((m) => (
                          <tr key={m.idVacacion}>
                            <td>
                              <span
                                className={`badge ${badgeTipoMovimiento(m.tipoMovimiento)}`}
                              >
                                {m.tipoMovimiento}
                              </span>
                            </td>
                            <td>
                              {m.fechaInicio
                                ? new Date(m.fechaInicio).toLocaleDateString()
                                : "—"}
                            </td>
                            <td>
                              {m.fechaFin
                                ? new Date(m.fechaFin).toLocaleDateString()
                                : "—"}
                            </td>
                            <td>{m.diasTomados}</td>
                            <td className="text-muted small">
                              {m.observacion || "—"}
                            </td>
                            <td className="text-muted small">
                              {m.registradoPorNombre}
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