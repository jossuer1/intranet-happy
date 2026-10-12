import { useQuery, useQueryClient } from "@tanstack/react-query";
import PerfilPestanas from "../../components/usuarios/PerfilPestanas";
import AppLayout from "../../components/layout/AppLayout";
import SectionHeader from "../../components/layout/SectionHeader";
import UsuarioFormCard from "../../components/usuarios/UsuarioFormCard";
import { usuariosService } from "../../services/usuariosService";
import { formatearFecha } from "../../utils/dateUtils";
import { useAuthStore } from "../../store/useAuthStore";

const fechaODash = (f) => (f ? formatearFecha(f) : "—");

function MiPerfil() {
  const userStore = useAuthStore((state) => state.user);
  const fetchPerfil = useAuthStore((state) => state.fetchPerfil);
  const queryClient = useQueryClient();

  const debeActualizarPerfil = Boolean(userStore?.puedeActualizarPerfil);

  // Incluir el idUsuario actual garantiza una clave única por sesión
  const currentUserId = userStore?.idUsuario;

  const handleGuardarPerfil = async (_idUsuario, payload, fotoArchivo) => {
    if (fotoArchivo) {
      await usuariosService.subirFotoPerfil(userStore.idUsuario, fotoArchivo);
    }
    await usuariosService.actualizarMiPerfil(payload);
    await queryClient.invalidateQueries({ queryKey: ["perfilUsuario"] });
  };

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["perfilUsuario", currentUserId],
    queryFn: async () => {
      // Siempre solicita la información actualizada al backend
      return await fetchPerfil();
    },
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 5,
  });

  if (debeActualizarPerfil) {
    return (
      <AppLayout>
        <SectionHeader titulo="Actualiza tu Perfil" />
        <div className="container my-4 flex-grow-1">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <div className="alert alert-warning shadow-sm">
                <i className="bi bi-person-vcard me-2"></i>
                RRHH habilitó la actualización de tu información de contacto,
                familiares y contactos de emergencia. Debes revisarla y guardar
                para poder seguir usando el sistema.
              </div>
              <UsuarioFormCard
                usuarioOriginal={userStore}
                modoAutogestion
                onGuardar={handleGuardarPerfil}
              />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <SectionHeader titulo="Mi Perfil" volverA="/dashboard" />
        <div className="container my-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError || !user) {
    return (
      <AppLayout>
        <SectionHeader titulo="Mi Perfil" volverA="/dashboard" />
        <div className="container my-5">
          <div className="alert alert-danger" role="alert">
            {error?.message || "No se encontró la información del usuario."}
          </div>
        </div>
      </AppLayout>
    );
  }

  const iniciales = (user.nombre || "??")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();



  const nombreCompleto = `${user?.nombre || ""} ${user?.apellido || ""}`.trim();

  const antiguedad = (fechaIngreso) => {
    if (!fechaIngreso) return "—";

    const inicio = new Date(fechaIngreso);
    const hoy = new Date();

    if (Number.isNaN(inicio.getTime()) || inicio > hoy) return "—";

    let anios = hoy.getFullYear() - inicio.getFullYear();
    let meses = hoy.getMonth() - inicio.getMonth();

    if (hoy.getDate() < inicio.getDate()) meses--;

    if (meses < 0) {
      anios--;
      meses += 12;
    }

    if (anios === 0 && meses === 0) return "Menos de 1 mes";
    if (anios === 0) return `${meses} ${meses === 1 ? "mes" : "meses"}`;
    if (meses === 0) return `${anios} ${anios === 1 ? "año" : "años"}`;

    return `${anios} ${anios === 1 ? "año" : "años"} y ${meses} ${
      meses === 1 ? "mes" : "meses"
    }`;
  };

  const cantidadFamiliares = user.familiares?.length ?? 0;

  return (
    <AppLayout>
      <SectionHeader titulo="Mi Perfil" volverA="/dashboard" />

      <div className="container-fluid px-4 pb-4">
        {/* =========================================================
            1. ENCABEZADO DEL COLABORADOR
            ========================================================= */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body p-3 p-lg-4">
            <div className="d-flex flex-column flex-xl-row align-items-xl-center gap-3">
              <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                {user.urlImagenPerfil || user.fotoUrl ? (
                  <img
                    src={user.urlImagenPerfil || user.fotoUrl}
                    alt="Foto de perfil"
                    className="rounded-circle object-fit-cover border border-2 border-primary shadow-sm flex-shrink-0"
                    style={{ width: "78px", height: "78px" }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-brand-soft text-brand d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                    style={{
                      width: "78px",
                      height: "78px",
                      fontSize: "1.7rem",
                    }}
                  >
                    {iniciales}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <h4 className="fw-bold mb-0 text-dark">{nombreCompleto}</h4>
                    {user.estado !== undefined && (
                      <span
                        className={`badge rounded-pill ${
                          user.estado ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        <i
                          className="bi bi-circle-fill me-1"
                          style={{ fontSize: "0.45rem" }}
                        ></i>
                        {user.estado ? "Activo" : "Inactivo"}
                      </span>
                    )}
                    {user.esJefe && (
                      <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle">
                        Jefe
                      </span>
                    )}
                  </div>

                  <div className="text-muted">
                    {user.cargo || "Colaborador"}
                    {user.departamento && (
                      <span className="text-brand fw-semibold">
                        {" "}
                        · {user.departamento}
                      </span>
                    )}
                  </div>

                  <div className="d-flex flex-wrap gap-3 mt-2 small text-muted">
                    <span>
                      <i className="bi bi-envelope me-1 text-brand"></i>
                      {user.correoEmpresa || "Sin correo institucional"}
                    </span>
                    {user.celularEmpresa && (
                      <span>
                        <i className="bi bi-telephone me-1 text-brand"></i>
                        {user.celularEmpresa}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-3 border-xl-start ps-xl-4">
                <div className="small">
                  <span className="text-muted d-block">Fecha de ingreso</span>
                  <span className="fw-semibold text-dark">
                    {fechaODash(user.fechaIngreso)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            2. MÉTRICAS RÁPIDAS
            ========================================================= */}
        <div className="row g-3 mb-3">
          <div className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div
                  className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "42px", height: "42px" }}
                >
                  <i className="bi bi-umbrella fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block">Vacaciones</span>
                  <span className="fw-bold text-dark">
                    {user.diasVacacionesAsignados
                      ? `${user.diasVacacionesAsignados} días`
                      : "0 días"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div
                  className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "42px", height: "42px" }}
                >
                  <i className="bi bi-clock-history fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block">Antigüedad</span>
                  <span className="fw-bold text-dark">
                    {antiguedad(user.fechaIngreso)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div
                  className="rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "42px", height: "42px" }}
                >
                  <i className="bi bi-droplet-fill fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block">
                    Tipo de sangre
                  </span>
                  <span className="fw-bold text-dark">
                    {user.tipoSangre || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div
                  className="rounded-circle bg-info-subtle text-info d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "42px", height: "42px" }}
                >
                  <i className="bi bi-people fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block">
                    Carga familiar
                  </span>
                  <span className="fw-bold text-dark">
                    {cantidadFamiliares}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            3. INFORMACIÓN POR SECCIONES (pestañas)
            ========================================================= */}
        <PerfilPestanas info={user} esRRHH={false} />
      </div>
    </AppLayout>
  );
}

export default MiPerfil;
