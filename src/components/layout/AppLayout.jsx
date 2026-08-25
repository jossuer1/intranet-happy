import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuthStore } from "../../store/useAuthStore";

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
    key: "registro-asistencia",
    titulo: "Marcación / Asistencia", // Reemplaza a Mis Permisos
    ruta: "/registro-asistencia",
    icono: "bi-clock-history",
  },
];

function AppLayout({ children, usuarioRol = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // Si el usuario no tiene el beneficio de vacaciones habilitado, ni siquiera
  // mostramos la opción en el menú. Por defecto (perfil aún no cargado) se
  // asume true para no "parpadear" el ítem mientras carga.
  const tieneVacaciones = user?.tieneVacaciones ?? true;
  const MODULOS_EMPLEADO = MODULOS_EMPLEADO_BASE.filter(
    (item) => item.key !== "mis-vacaciones" || tieneVacaciones,
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

  // Rol real del usuario logueado. `usuarioRol` (prop) permite forzarlo
  // manualmente si algún día hace falta, pero por defecto se toma del
  // perfil que devuelve el backend (/usuarios/mi-perfil).
  //
  // ⚠️ OJO: no sabemos con certeza cómo se llama el campo de rol en tu API,
  // así que probamos varios nombres comunes. Si el menú de RRHH sigue sin
  // aparecerle a un admin real (o le sigue apareciendo a un empleado),
  // hay que confirmar el nombre exacto del campo y dejar solo ese.
  const rolUsuario =
    usuarioRol ??
    user?.rol ??
    user?.nombreRol ??
    user?.role ??
    user?.tipoUsuario ??
    user?.perfil ??
    null;

  // Fail-closed: si todavía no sabemos el rol (perfil sin cargar, o el
  // campo no vino en la respuesta), NO mostramos el menú de RRHH.
  const esAdminORRHH = ["RRHH", "ADMIN"].includes(
    String(rolUsuario || "").toUpperCase(),
  );

  if (import.meta.env.DEV && user && rolUsuario === null) {
    console.warn(
      "[AppLayout] El perfil del usuario no trae ningún campo de rol reconocido " +
        "(se probó: rol, nombreRol, role, tipoUsuario, perfil). Revisa la respuesta " +
        "de /usuarios/mi-perfil y ajusta AppLayout.jsx. Perfil recibido:",
      user,
    );
  }

  const esGestionUsuariosActivo =
    location.pathname.startsWith("/gestion-usuarios");
  const esGestionNovedadesActivo =
    location.pathname.startsWith("/gestion-novedades");
  const esGestionVacacionesActivo = location.pathname.startsWith(
    "/gestion-vacaciones",
  );

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Navbar />

      <div className="d-flex flex-grow-1">
        <aside
          className="bg-white border-end p-3 d-none d-md-block flex-shrink-0"
          style={{ width: "250px" }}
        >
          {/* Autogestión Empleado */}
          <div className="mb-4">
            <small className="text-uppercase text-muted fw-bold extra-small d-block mb-2">
              Autogestión
            </small>
            <ul className="nav nav-pills flex-column gap-1">
              {MODULOS_EMPLEADO.map((item) => {
                const activo = location.pathname === item.ruta;
                return (
                  <li key={item.key} className="nav-item">
                    <button
                      type="button"
                      className={`nav-link w-100 text-start border-0 d-flex align-items-center gap-2 py-2 px-3 rounded-2 ${
                        activo
                          ? "bg-brand text-white fw-semibold"
                          : "text-dark bg-transparent"
                      }`}
                      onClick={() => navigate(item.ruta)}
                    >
                      <i className={`bi ${item.icono} fs-5`}></i>
                      <span>{item.titulo}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Administración RRHH */}
          {esAdminORRHH && (
            <div>
              <hr className="text-muted opacity-25 my-3" />
              <small className="text-uppercase text-muted fw-bold extra-small d-block mb-2">
                Administración RRHH
              </small>
              <ul className="nav nav-pills flex-column gap-1">
                {/* GESTIÓN DE USUARIOS */}
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link w-100 text-start border-0 d-flex align-items-center justify-content-between py-2 px-3 rounded-2 ${
                      esGestionUsuariosActivo
                        ? "text-brand fw-semibold bg-brand-soft"
                        : "text-dark bg-transparent"
                    }`}
                    onClick={() => setOpenGestionUsuarios(!openGestionUsuarios)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-people fs-5"></i>
                      <span>Gestión de Usuarios</span>
                    </div>
                    <i
                      className={`bi bi-chevron-${openGestionUsuarios ? "down" : "right"} small`}
                    ></i>
                  </button>

                  {openGestionUsuarios && (
                    <ul className="nav nav-pills flex-column ms-3 mt-1 ps-2 border-start gap-1">
                      <li className="nav-item">
                        <button
                          type="button"
                          className={`nav-link w-100 text-start border-0 py-1 px-3 rounded-2 small d-flex align-items-center gap-2 ${
                            location.pathname === "/gestion-usuarios"
                              ? "bg-brand text-white fw-semibold"
                              : "text-muted bg-transparent"
                          }`}
                          onClick={() => navigate("/gestion-usuarios")}
                        >
                          <i className="bi bi-list-ul"></i>
                          <span>Ver Usuarios</span>
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          type="button"
                          className={`nav-link w-100 text-start border-0 py-1 px-3 rounded-2 small d-flex align-items-center gap-2 ${
                            location.pathname === "/gestion-usuarios/crear"
                              ? "bg-brand text-white fw-semibold"
                              : "text-muted bg-transparent"
                          }`}
                          onClick={() => navigate("/gestion-usuarios/crear")}
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
                    className={`nav-link w-100 text-start border-0 d-flex align-items-center justify-content-between py-2 px-3 rounded-2 ${
                      esGestionNovedadesActivo
                        ? "text-brand fw-semibold bg-brand-soft"
                        : "text-dark bg-transparent"
                    }`}
                    onClick={() =>
                      setOpenGestionNovedades(!openGestionNovedades)
                    }
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-megaphone fs-5"></i>
                      <span>Gestión Novedades</span>
                    </div>
                    <i
                      className={`bi bi-chevron-${openGestionNovedades ? "down" : "right"} small`}
                    ></i>
                  </button>

                  {openGestionNovedades && (
                    <ul className="nav nav-pills flex-column ms-3 mt-1 ps-2 border-start gap-1">
                      <li className="nav-item">
                        <button
                          type="button"
                          className={`nav-link w-100 text-start border-0 py-1 px-3 rounded-2 small d-flex align-items-center gap-2 ${
                            location.pathname === "/gestion-novedades" ||
                            location.pathname === "/gestion-novedades/activos"
                              ? "bg-brand text-white fw-semibold"
                              : "text-muted bg-transparent"
                          }`}
                          onClick={() => navigate("/gestion-novedades/activos")}
                        >
                          <i className="bi bi-images"></i>
                          <span>Banners Activos</span>
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          type="button"
                          className={`nav-link w-100 text-start border-0 py-1 px-3 rounded-2 small d-flex align-items-center gap-2 ${
                            location.pathname === "/gestion-novedades/publicar"
                              ? "bg-brand text-white fw-semibold"
                              : "text-muted bg-transparent"
                          }`}
                          onClick={() =>
                            navigate("/gestion-novedades/publicar")
                          }
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
                    className={`nav-link w-100 text-start border-0 d-flex align-items-center justify-content-between py-2 px-3 rounded-2 ${
                      esGestionVacacionesActivo
                        ? "text-brand fw-semibold bg-brand-soft"
                        : "text-dark bg-transparent"
                    }`}
                    onClick={() =>
                      setOpenGestionVacaciones(!openGestionVacaciones)
                    }
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-calendar2-range fs-5"></i>
                      <span>Gestión Vacaciones</span>
                    </div>
                    <i
                      className={`bi bi-chevron-${openGestionVacaciones ? "down" : "right"} small`}
                    ></i>
                  </button>

                  {openGestionVacaciones && (
                    <ul className="nav nav-pills flex-column ms-3 mt-1 ps-2 border-start gap-1">
                      <li className="nav-item">
                        <button
                          type="button"
                          className={`nav-link w-100 text-start border-0 py-1 px-3 rounded-2 small d-flex align-items-center gap-2 ${
                            location.pathname === "/gestion-vacaciones"
                              ? "bg-brand text-white fw-semibold"
                              : "text-muted bg-transparent"
                          }`}
                          onClick={() => navigate("/gestion-vacaciones")}
                        >
                          <i className="bi bi-card-checklist"></i>
                          <span>Gestión Vacaciones</span>
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          type="button"
                          className={`nav-link w-100 text-start border-0 py-1 px-3 rounded-2 small d-flex align-items-center gap-2 ${
                            location.pathname === "/gestion-vacaciones/saldos"
                              ? "bg-brand text-white fw-semibold"
                              : "text-muted bg-transparent"
                          }`}
                          onClick={() => navigate("/gestion-vacaciones/saldos")}
                        >
                          <i className="bi bi-wallet2"></i>
                          <span>Saldos Personal</span>
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </div>
          )}
        </aside>

        <main className="flex-grow-1 p-3 p-md-4 overflow-auto d-flex flex-column">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
