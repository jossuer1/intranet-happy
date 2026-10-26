import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Notificaciones from "./Notificaciones";
import { TopBarContext } from "./TopBarContext";
import {
  SECCIONES_CATALOGO,
  SECCION_ROLES,
  RUTA_ADMIN,
  seccionDesdeUrl,
} from "../catalogos/seccionesAdmin";
import { useAuthStore } from "../../store/useAuthStore";
import logoHappyPayBlanco from "../../assets/images/logo_happy_blanco.png";

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

  // Grupo "Catálogos y roles" del ADMIN: abierto por defecto (es su única pantalla)
  const [openCatalogos, setOpenCatalogos] = useState(true);

  const [rutaMenuAbierto, setRutaMenuAbierto] = useState(null);
  const rutaActual = location.pathname + location.search;
  const sidebarOpen = rutaMenuAbierto === rutaActual;
  const setSidebarOpen = abrir => setRutaMenuAbierto(abrir ? rutaActual : null);
  // Zona izquierda de la fila superior: cada página mete aquí su título
  const [zonaTitulo, setZonaTitulo] = useState(null);


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

  const debeActualizarPerfil = Boolean(user?.puedeActualizarPerfil);

  const irA = (ruta) => {
    if (debeActualizarPerfil) {
      navigate("/mi-perfil", { replace: true });
      return;
    }
    navigate(ruta);
  };

  // Administración (ADMIN): ¿estoy en esa pantalla y en qué sección?
  const enAdmin = location.pathname === RUTA_ADMIN;
  const seccionAdmin = seccionDesdeUrl(location.search);
  const irASeccionAdmin = (key) => irA(`${RUTA_ADMIN}?seccion=${key}`);

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
    <div className="hp-app bg-light min-vh-100 d-flex flex-column flex-md-row">
      <style>{`
        .app-sidebar {
          width: 270px;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          z-index: 1045;
        }

        .app-sidebar {
          background-color: #004d40;
          color: #fff;
        }

        .sidebar-section-title {
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.6);
        }

        .sidebar-divider {
          border-color: rgba(255, 255, 255, 0.3);
          opacity: 1;
        }

        .app-sidebar .sidebar-item-btn {
          color: #fff;
          background-color: transparent;
          transition: all 0.15s ease-in-out;
          font-size: 0.92rem;
        }

        .app-sidebar .sidebar-sub-btn {
          color: rgba(255, 255, 255, 0.78);
        }

        .app-sidebar .sidebar-item-btn:hover,
        .app-sidebar .sidebar-item-btn:focus-visible {
          background-color: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        /* Ítem de la página actual */
        .app-sidebar .sidebar-item-btn.is-active {
          background-color: #2c6d72;
          color: #fff;
        }

        /* Grupo desplegado que contiene la página actual */
        .app-sidebar .sidebar-item-btn.is-active-parent {
          background-color: rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .app-sidebar .border-start {
          border-color: rgba(255, 255, 255, 0.3) !important;
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

      {/* Sidebar completo */}
      <aside
        id="hp-sidebar"
        className={`app-sidebar px-3 py-3 flex-shrink-0 ${
          sidebarOpen ? "open" : ""
        }`}
      >
        {/* Cabecera del Sidebar con Logo + Botón de cerrar para móvil */}
        <div className="d-flex align-items-center justify-content-between pb-3 mb-2 px-2">
          <div
            className="d-flex align-items-center gap-2 cursor-pointer"
            onClick={() => irA("/dashboard")}
          >
            <img
              src={logoHappyPayBlanco}
              alt="HappyPay Logo"
              style={{ height: "36px", objectFit: "contain" }}
            />
            <span className="fw-bold fs-5 text-white tracking-tight">
              HappyPay
            </span>
          </div>

          <button
            type="button"
            className="btn-close btn-close-white d-md-none"
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
                        activo ? "is-active fw-semibold" : ""
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
            <hr className="sidebar-divider my-3" />
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
                      ? "is-active-parent fw-semibold"
                      : ""
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
                      <button type="button" className={`nav-link w-100 text-start border-0 py-2 px-3 rounded-2 small sidebar-item-btn ${location.pathname === "/gestion-usuarios/jefes" ? "is-active fw-semibold" : "sidebar-sub-btn"}`} onClick={() => irA("/gestion-usuarios/jefes")}>
                        <i className="bi bi-person-badge me-2"></i>Jefes
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link w-100 text-start border-0 py-2 px-3 rounded-2 small d-flex align-items-center gap-2 sidebar-item-btn ${
                          location.pathname === "/gestion-usuarios"
                            ? "is-active fw-semibold"
                            : "sidebar-sub-btn"
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
                            ? "is-active fw-semibold"
                            : "sidebar-sub-btn"
                        }`}
                        onClick={() => irA("/gestion-usuarios/crear")}
                      >
                        <i className="bi bi-person-plus"></i>
                        <span>Crear Usuario</span>
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link w-100 text-start border-0 py-2 px-3 rounded-2 small d-flex align-items-center gap-2 sidebar-item-btn ${
                          location.pathname === "/gestion-usuarios/solicitudes"
                            ? "is-active fw-semibold"
                            : "sidebar-sub-btn"
                        }`}
                        onClick={() => irA("/gestion-usuarios/solicitudes")}
                      >
                        <i className="bi bi-person-check"></i>
                        <span>Solicitudes de actualización</span>
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
                      ? "is-active-parent fw-semibold"
                      : ""
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
                            ? "is-active fw-semibold"
                            : "sidebar-sub-btn"
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
                            ? "is-active fw-semibold"
                            : "sidebar-sub-btn"
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
                      ? "is-active-parent fw-semibold"
                      : ""
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
                            ? "is-active fw-semibold"
                            : "sidebar-sub-btn"
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

        {/* Administración (ADMIN): "Catálogos y roles" con sus secciones debajo */}
        {esADMIN && (
          <div>
            <small className="text-uppercase fw-bold sidebar-section-title d-block mb-2 px-2">
              Administración
            </small>
            <ul className="nav nav-pills flex-column gap-1">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link w-100 text-start border-0 d-flex align-items-center justify-content-between py-2.5 px-3 rounded-2 sidebar-item-btn ${
                    enAdmin ? "is-active-parent fw-semibold" : ""
                  }`}
                  onClick={() => setOpenCatalogos(!openCatalogos)}
                  aria-expanded={openCatalogos}
                >
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-collection fs-5"></i>
                    <span>Catálogos y roles</span>
                  </div>
                  <i
                    className={`bi bi-chevron-${openCatalogos ? "down" : "right"} small opacity-75`}
                  ></i>
                </button>

                {openCatalogos && (
                  <ul className="nav nav-pills flex-column ms-3 mt-1 ps-2 border-start gap-1">
                    {SECCIONES_CATALOGO.map((sec) => (
                      <li className="nav-item" key={sec.key}>
                        <button
                          type="button"
                          className={`nav-link w-100 text-start border-0 py-2 px-3 rounded-2 small d-flex align-items-center gap-2 sidebar-item-btn ${
                            enAdmin && seccionAdmin === sec.key
                              ? "is-active fw-semibold"
                              : "sidebar-sub-btn"
                          }`}
                          onClick={() => irASeccionAdmin(sec.key)}
                        >
                          <i className={`bi ${sec.icono}`}></i>
                          <span>{sec.titulo}</span>
                        </button>
                      </li>
                    ))}

                    {/* Roles de usuario: separado, porque no es un catálogo */}
                    <li aria-hidden="true">
                      <hr className="sidebar-divider my-1" />
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link w-100 text-start border-0 py-2 px-3 rounded-2 small d-flex align-items-center gap-2 sidebar-item-btn ${
                          enAdmin && seccionAdmin === SECCION_ROLES.key
                            ? "is-active fw-semibold"
                            : "sidebar-sub-btn"
                        }`}
                        onClick={() => irASeccionAdmin(SECCION_ROLES.key)}
                      >
                        <i className={`bi ${SECCION_ROLES.icono}`}></i>
                        <span>{SECCION_ROLES.titulo}</span>
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>
        )}
      </aside>

      {/* Overlay oscuro cuando el menú está desplegado en móviles */}
      {sidebarOpen && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100"
          style={{
            background: "rgba(0,0,0,0.5)",
            zIndex: 1049,
          }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Contenedor Principal */}
      <div className="hp-workspace flex-grow-1 d-flex flex-column min-vh-100 overflow-hidden">
        {/* Una sola fila arriba: título a la izquierda, tarjeta a la derecha */}
        <header className="topbar d-flex align-items-center justify-content-between gap-3" aria-label="Barra superior">
          <button type="button" className="btn btn-light d-md-none hp-menu-toggle" aria-label="Abrir menú" aria-controls="hp-sidebar" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(!sidebarOpen)}><i className="bi bi-list fs-4" /></button>
          <div ref={setZonaTitulo} className="topbar-titulo"></div>
          <div className="hp-topbar-actions"><Notificaciones /><Navbar /></div>
        </header>

        {/* Sin padding superior: el contenido sube hasta pegarse a la fila de arriba */}
        <main className="flex-grow-1 px-3 px-md-4 pt-0 pb-3 pb-md-4 overflow-auto">
          <TopBarContext.Provider value={zonaTitulo}>
            {children}
          </TopBarContext.Provider>
        </main>
      </div>

      {/* Modal de actualización obligatoria de perfil */}
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
