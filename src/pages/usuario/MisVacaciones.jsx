import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AppLayout from "../../components/layout/AppLayout";
import SectionHeader from "../../components/layout/SectionHeader";
import SolicitarVacacionesModal from "../../components/vacaciones/SolicitarVacacionesModal";
import TablaSolicitudes from "../../components/vacaciones/TablaSolicitudes";
import TablaMovimientos from "../../components/vacaciones/TablaMovimientos";
import {
  getSaldo,
  getMisVacaciones,
  getMisSolicitudesVacacion,
  descargarConstanciaSolicitud,
} from "../../services/vacacionesService";
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

function MisVacaciones() {
  const userStore = useAuthStore((state) => state.user);
  const fetchPerfil = useAuthStore((state) => state.fetchPerfil);

  // Estado de Pestaña activa ('solicitudes' | 'movimientos')
  const [activeTab, setActiveTab] = useState("solicitudes");

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

  const {
    data: saldo,
    isLoading: loadingSaldo,
    isError: errorSaldo,
    error: errSaldo,
    refetch: refetchSaldo,
  } = useQuery({
    queryKey: ["vacaciones", "saldo", idUsuario],
    queryFn: () => getSaldo(idUsuario),
    enabled: habilitado,
    staleTime: 1000 * 60 * 2,
  });

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

  const {
    data: solicitudes,
    isLoading: loadingSolicitudes,
    refetch: refetchSolicitudes,
  } = useQuery({
    queryKey: ["vacaciones", "mis-solicitudes"],
    queryFn: getMisSolicitudesVacacion,
    enabled: habilitado,
    staleTime: 1000 * 30,
    select: (data) => (Array.isArray(data) ? data : []),
  });

  const [modalAbierto, setModalAbierto] = useState(false);
  const [descargandoId, setDescargandoId] = useState(null);

  const descargarConstancia = async (idSolicitud) => {
    try {
      setDescargandoId(idSolicitud);
      const blob = await descargarConstanciaSolicitud(idSolicitud);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `constancia-vacaciones-${idSolicitud}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo descargar la constancia",
        text: err.message || "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setDescargandoId(null);
    }
  };

  const loading =
    loadingPerfil || (habilitado && (loadingSaldo || loadingHistorial));
  const isError = errorSaldo || errorHistorial;
  const error = errSaldo || errHistorial;

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
            {/* CARDS DE RESUMEN SUPERIOR */}
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

            {/* CONTENEDOR CON PESTAÑAS Y TABLA DINÁMICA */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-bottom pt-3 pb-0 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                {/* PESTAÑAS DE NAVEGACIÓN */}
                <ul className="nav nav-tabs card-header-tabs border-bottom-0">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link border-0 ${
                        activeTab === "solicitudes"
                          ? "active fw-bold text-brand border-bottom border-brand border-2"
                          : "text-muted"
                      }`}
                      onClick={() => setActiveTab("solicitudes")}
                    >
                      Solicitar Vacaciones
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link border-0 ${
                        activeTab === "movimientos"
                          ? "active fw-bold text-brand border-bottom border-brand border-2"
                          : "text-muted"
                      }`}
                      onClick={() => setActiveTab("movimientos")}
                    >
                      Historial de movimientos
                    </button>
                  </li>
                </ul>

                {/* BOTÓN NUEVA SOLICITUD (VISIBLE SIEMPRE O EN PESTAÑA SOLICITUDES) */}
                <button
                  type="button"
                  className="btn btn-brand btn-sm my-1"
                  onClick={() => setModalAbierto(true)}
                >
                  <i className="bi bi-calendar-plus me-1"></i>
                  Nueva solicitud
                </button>
              </div>

              {/* CUERPO CON EL COMPONENTE SEGÚN LA PESTAÑA */}
              <div className="card-body p-4">
                {activeTab === "solicitudes" ? (
                  <TablaSolicitudes
                    solicitudes={solicitudes}
                    loadingSolicitudes={loadingSolicitudes}
                    descargandoId={descargandoId}
                    onDescargarConstancia={descargarConstancia}
                  />
                ) : (
                  <TablaMovimientos
                    movimientos={historial}
                    loadingHistorial={loadingHistorial}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {modalAbierto && (
        <SolicitarVacacionesModal
          diasDisponibles={saldo?.diasDisponibles}
          onClose={() => setModalAbierto(false)}
          onCreada={async () => {
            setModalAbierto(false);
            await Promise.all([refetchSolicitudes(), refetchSaldo()]);
          }}
        />
      )}
    </AppLayout>
  );
}

export default MisVacaciones;
