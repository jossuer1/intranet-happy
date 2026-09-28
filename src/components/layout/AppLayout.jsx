import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuthStore } from "../../store/useAuthStore";
import logoHappyPay from "../../assets/images/logo_happy.jpg";

const MODULOS_EMPLEADO_BASE = [
  {
    key: "dashboard",
    titulo: "Inicio",
    ruta: "/dashboard",
    icono: "bi-house-door",
  },
  {
    key: "mi-perfil",
    titulo: "Mi Perfil",
    ruta: "/mi-perfil",
    icono: "bi-person-gear",
  },
  {
    key: "mis-vacaciones",
    titulo: "Mis Vacaciones",
    ruta: "/mis-vacaciones",
    icono: "bi-calendar-check",
  },
  {
    key: "aprobar-vacaciones",
    titulo: "Aprobar Vacaciones",
    ruta: "/aprobar-vacaciones",
    icono: "bi-clipboard-check",
  },
];

function AppLayout({ children, usuarioRol = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const tieneVacaciones = user?.tieneVacaciones ?? true;
  // "Aprobar Vacaciones" solo aparece para quienes están marcados como jefe
  const esJefe = Boolean(user?.esJefe);
  const MODULOS_EMPLEADO = MODULOS_EMPLEADO_BASE.filter(
    (item) =>
      (item.key !== "mis-vacaciones" || tieneVacaciones) &&
      (item.key !== "aprobar-vacaciones" || esJefe),
  );

  const [openGestionUsuarios, setOpenGestionUsuarios] = useState(
    location.pathname.startsWith("/gestion-usuarios"),
  );
  const [openGestionNovedades, setOpenGestionNovedades] = useState(
    location.pathname.startsWith("/gestion-novedades"),
  );
  const [openGestionVacaciones, setOpenGestionVacaciones] = useState(
    location.pathname.startsWith("/gestion-vacaciones"),
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const rolUsuario = String(
    usuarioRol ??
      user?.rol ??
      user?.nombreRol ??
      user?.role ??
      user?.tipoUsuario ??
      user?.perfil ??
      "",
  )
    .trim()
    .toUpperCase();

  const esRRHH = rolUsuario === "RRHH";
  const esADMIN = rolUsuario === "ADMIN" || rolUsuario === "ADMINISTRADOR";

  // Bloqueo real: mientras RRHH mantenga este flag en true, el empleado no
  // puede navegar a ningún otro módulo. Se apaga solo cuando el backend
  // recibe el guardado de la actualización (ver fetchPerfil tras guardar en
  // la página de "Mi Perfil").
  const debeActualizarPerfil = Boolean(user?.puedeActualizarPerfil);

  // Usar esto en vez de navigate(ruta) para cualquier click del sidebar:
  // si el empleado todavía debe actualizar su perfil, cualquier intento de
  // ir a otro módulo lo regresa a /mi-perfil en lugar de dejarlo salir.
  const irA = (ruta) => {
    if (debeActualizarPerfil) {
      navigate("/mi-perfil", { replace: true });
      return;
    }
    navigate(ruta);
  };

  useEffect(() => {
    if (esADMIN && location.pathname !== "/gestion-catalogos") {
      navigate("/gestion-catalogos", { replace: true });
    }
  }, [esADMIN, location.pathname, navigate]);

  useEffect(() => {
    if (debeActualizarPerfil && location.pathname !== "/mi-perfil") {
      navigate("/mi-perfil", { replace: true });
    }
  }, [debeActualizarPerfil, location.pathname, navigate]);

  const esGestionUsuariosActivo =
    location.pathname.startsWith("/gestion-usuarios");
  const esGestionNovedadesActivo =
    location.pathname.startsWith("/gestion-novedades");
  const esGestionVacacionesActivo = location.pathname.startsWith(
    "/gestion-vacaciones",
  );

  return (
    <div className="bg-light min-vh-100 d-flex">
      <style>{`
        .app-sidebar {
          width: 270px;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          z-index: 1045;
        }

        .sidebar-section-title {
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          color: #8c98a4;
        }

        .sidebar-item-btn {
          transition: all 0.15s ease-in-out;
          font-size: 0.92rem;
        }

        .sidebar-item-btn:hover {
          background-color: rgba(30, 90, 99, 0.06) !important;
        }

        @media (max-width: 767.98px) {
          .app-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 1050;
            transform: translateX(-100%);
            transition: transform 0.25s ease-in-out;
            box-shadow: 2px 0 16px rgba(0, 0, 0, 0.2);
          }
          .app-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>

      {/* Sidebar completo de arriba a abajo */}
      <aside
        className={`app-sidebar bg-white border-end px-3 py-3 flex-shrink-0 d-md-block ${
          sidebarOpen ? "open" : ""
        }`}
      >
        {/* Cabecera del Sidebar con Logo + HappyPay */}
        <div
          className="d-flex align-items-center gap-2 pb-3 mb-3 border-bottom px-2 cursor-pointer"
          style={{ cursor: "pointer", height: "48px" }}
          onClick={() => irA("/dashboard")}
        >
          <img
            src={logoHappyPay}
            alt="HappyPay Logo"
            style={{ height: "36px", objectFit: "contain" }}
          />
          <span className="fw-bold fs-5 text-dark tracking-tight">
            HappyPay
          </span>
        </div>

        <div className="d-flex justify-content-end d-md-none mb-2">
          <button
            type="button"
            className="btn-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          ></button>
        </div>

        {/* Autogestión Empleado */}
        {!esADMIN && (
          <div className="mb-4">
            <small className="text-uppercase fw-bold sidebar-section-title d-block mb-2 px-2">
              Autogestión
            </small>
            <ul className="nav nav-pills flex-column gap-1">
              {MODULOS_EMPLEADO.map((item) => {
                const activo = location.pathname === item.ruta;
                return (
                  <li key={item.key} className="nav-item">
                    <button
                      type="button"
                      className={`nav-link w-100 text-start border-0 d-flex align-items-center gap-3 py-2.5 px-3 rounded-2 sidebar-item-btn ${
                        activo
                          ? "bg-brand text-white fw-semibold shadow-sm"
                          : "text-dark bg-transparent"
                      }`}
                      onClick={() => irA(item.ruta)}
                    >
                      <i className={`bi ${item.icono} fs-5`}></i>
                      <span>{item.titulo}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Administración RRHH */}
        {esRRHH && (
          <div>
            <hr className="text-muted opacity-25 my-3" />
            <small className="text-uppercase fw-bold sidebar-section-title d-block mb-2 px-2">
              Administración RRHH
            </small>
            <ul className="nav nav-pills flex-column gap-1">
              {/* GESTIÓN DE USUARIOS */}
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link w-100 text-start border-0 d-flex align-items-center justify-content-between py-2.5 px-3 rounded-2 sidebar-item-btn ${
                    esGestionUsuariosActivo
                      ? "text-brand fw-semibold bg-brand-soft"
                      : "text-dark bg-transparent"
                  }`}
                  onClick={() => setOpenGestionUsuarios(!openGestionUsuarios)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-people fs-5"></i>
                    <span>Gestión de Usuarios</span>
                  </div>
                  <i
                    className={`bi bi-chevron-${openGestionUsuarios ? "down" : "right"} small opacity-75`}
                  ></i>
                </button>

                {openGestionUsuarios && (
                  <ul className="nav nav-pills flex-column ms-3 mt-1 ps-2 border-start gap-1">
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link w-100 text-start border-0 py-2 px-3 rounded-2 small d-flex align-items-center gap-2 sidebar-item-btn ${
                          location.pathname === "/gestion-usuarios"
                            ? "bg-brand text-white fw-semibold shadow-sm"
                            : "text-secondary bg-transparent"
                        }`}
                        onClick={() => irA("/gestion-usuarios")}
                      >
                        <i className="bi bi-list-ul"></i>
                        <span>Ver Usuarios</span>
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link w-100 text-start border-0 py-2 px-3 rounded-2 small d-flex align-items-center gap-2 sidebar-item-btn ${
                          location.pathname === "/gestion-usuarios/crear"
                            ? "bg-brand text-white fw-semibold shadow-sm"
                            : "text-secondary bg-transparent"
                        }`}
                        onClick={() => irA("/gestion-usuarios/crear")}
                      >
                        <i className="bi bi-person-plus"></i>
                        <span>Crear Usuario</span>
                      </button>
                    </li>
                  </ul>
                )}
              </li>

              {/* GESTIÓN DE NOVEDADES */}
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link w-100 text-start border-0 d-flex align-items-center justify-content-between py-2.5 px-3 rounded-2 sidebar-item-btn ${
                    esGestionNovedadesActivo
                      ? "text-brand fw-semibold bg-brand-soft"
                      : "text-dark bg-transparent"
                  }`}
                  onClick={() => setOpenGestionNovedades(!openGestionNovedades)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-megaphone fs-5"></i>
                    <span>Gestión Novedades</span>
                  </div>
                  <i
                    className={`bi bi-chevron-${openGestionNovedades ? "down" : "right"} small opacity-75`}
                  ></i>
                </button>

                {openGestionNovedades && (
                  <ul className="nav nav-pills flex-column ms-3 mt-1 ps-2 border-start gap-1">
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link w-100 text-start border-0 py-2 px-3 rounded-2 small d-flex align-items-center gap-2 sidebar-item-btn ${
                          location.pathname === "/gestion-novedades" ||
                          location.pathname === "/gestion-novedades/activos"
                            ? "bg-brand text-white fw-semibold shadow-sm"
                            : "text-secondary bg-transparent"
                        }`}
                        onClick={() => irA("/gestion-novedades/activos")}
                      >
                        <i className="bi bi-images"></i>
                        <span>Banners Activos</span>
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link w-100 text-start border-0 py-2 px-3 rounded-2 small d-flex align-items-center gap-2 sidebar-item-btn ${
                          location.pathname === "/gestion-novedades/publicar"
                            ? "bg-brand text-white fw-semibold shadow-sm"
                            : "text-secondary bg-transparent"
                        }`}
                        onClick={() => irA("/gestion-novedades/publicar")}
                      >
                        <i className="bi bi-cloud-arrow-up"></i>
                        <span>Publicar Banner</span>
                      </button>
                    </li>
                  </ul>
                )}
              </li>

              {/* GESTIÓN DE VACACIONES */}
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link w-100 text-start border-0 d-flex align-items-center justify-content-between py-2.5 px-3 rounded-2 sidebar-item-btn ${
                    esGestionVacacionesActivo
                      ? "text-brand fw-semibold bg-brand-soft"
                      : "text-dark bg-transparent"
                  }`}
                  onClick={() =>
                    setOpenGestionVacaciones(!openGestionVacaciones)
                  }
                >
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-calendar2-range fs-5"></i>
                    <span>Gestión Vacaciones</span>
                  </div>
                  <i
                    className={`bi bi-chevron-${openGestionVacaciones ? "down" : "right"} small opacity-75`}
                  ></i>
                </button>

                {openGestionVacaciones && (
                  <ul className="nav nav-pills flex-column ms-3 mt-1 ps-2 border-start gap-1">
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link w-100 text-start border-0 py-2 px-3 rounded-2 small d-flex align-items-center gap-2 sidebar-item-btn ${
                          location.pathname === "/gestion-vacaciones"
                            ? "bg-brand text-white fw-semibold shadow-sm"
                            : "text-secondary bg-transparent"
                        }`}
                        onClick={() => irA("/gestion-vacaciones")}
                      >
                        <i className="bi bi-card-checklist"></i>
                        <span>Gestión Vacaciones</span>
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>
        )}

        {/* Administración (ADMIN) */}
        {esADMIN && (
          <div>
            <small className="text-uppercase fw-bold sidebar-section-title d-block mb-2 px-2">
              Administración
            </small>
            <ul className="nav nav-pills flex-column gap-1">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link w-100 text-start border-0 d-flex align-items-center gap-3 py-2.5 px-3 rounded-2 sidebar-item-btn ${
                    location.pathname === "/gestion-catalogos"
                      ? "bg-brand text-white fw-semibold shadow-sm"
                      : "text-dark bg-transparent"
                  }`}
                  onClick={() => irA("/gestion-catalogos")}
                >
                  <i className="bi bi-collection fs-5"></i>
                  <span>Catálogos</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </aside>

      {sidebarOpen && (
        <div
          className="d-md-none"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1049,
          }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Contenedor Principal (Navbar Blanco Delgado + Área de Contenido) */}
      <div className="flex-grow-1 d-flex flex-column min-vh-100 overflow-hidden">
        <Navbar />

        <main className="flex-grow-1 p-3 p-md-4 overflow-auto">{children}</main>
      </div>
      {/*
        Este overlay solo se ve en el instante antes de que el useEffect de
        arriba complete el redirect a /mi-perfil (o si por algún motivo la
        navegación no ocurre). Una vez en /mi-perfil, debeActualizarPerfil
        sigue siendo true, pero ahí NO debe taparse el formulario: en la
        página de "Mi Perfil" hay que mostrar en su lugar un aviso fijo (no
        descartable) usando este mismo `user.puedeActualizarPerfil`, y dejar
        que el formulario se use. El bloqueo real de "no puede salir" lo da
        irA() + el useEffect de redirect, no este modal.
      */}
      {debeActualizarPerfil && location.pathname !== "/mi-perfil" && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 2000 }}
        >
          <div
            className="card shadow-lg border-0"
            style={{ width: "min(420px, 100%)" }}
          >
            <div className="card-body p-4 text-center">
              <i
                className="bi bi-person-vcard text-brand"
                style={{ fontSize: "2.5rem" }}
              ></i>
              <h5 className="fw-bold mt-3">Actualiza tu información</h5>
              <p className="text-muted small mb-4">
                RRHH habilitó la actualización de tus datos de contacto,
                familiares y contactos de emergencia. Debes guardar esta
                información antes de continuar usando el sistema.
              </p>
              <button
                type="button"
                className="btn btn-brand w-100"
                onClick={() => navigate("/mi-perfil", { replace: true })}
              >
                Ir a actualizar mi perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppLayout;
