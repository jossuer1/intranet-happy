import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuthStore } from "../../store/useAuthStore";

/**
 * Tarjeta del usuario (ícono, nombre y cargo). Ya NO es una barra: AppLayout
 * la coloca a la derecha de la fila superior, en la misma línea que el título
 * de la vista. Al hacer clic se abre un menú con "Mi perfil" y "Cerrar sesión".
 */
function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const nombreCompleto =
    `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim() || "Usuario";

  const rol = String(user?.rol ?? "").trim().toUpperCase();
  const esADMIN = rol === "ADMIN" || rol === "ADMINISTRADOR";
  // El administrador no tiene "Mi perfil" (solo ve la pantalla de administración)
  const subtitulo = user?.cargo || (esADMIN ? "Administrador" : "Colaborador");

  const cerrarSesion = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas salir del sistema?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#004d40",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login");
      }
    });
  };

  return (
    <div className="hp-perfil-menu flex-shrink-0">


      <div className="dropdown">
        <button
          type="button"
          className="user-card dropdown-toggle d-flex align-items-center gap-3 text-start"
          id="dropdownMenuUser"
          aria-label={`Menú de ${nombreCompleto}`}
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="bi bi-person-fill fs-4 flex-shrink-0"></i>
          <span className="d-none d-sm-block overflow-hidden">
            <span className="user-card-nombre d-block text-truncate">
              {nombreCompleto}
            </span>
            <span className="user-card-cargo d-block text-truncate">
              {subtitulo}
            </span>
          </span>
        </button>

        <ul
          className="dropdown-menu dropdown-menu-end shadow border-0 mt-2"
          aria-labelledby="dropdownMenuUser"
        >
          {!esADMIN && (
            <>
              <li>
                <button
                  type="button"
                  className="dropdown-item d-flex align-items-center gap-2"
                  onClick={() => navigate("/mi-perfil")}
                >
                  <i className="bi bi-person"></i>
                  <span>Mi perfil</span>
                </button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
            </>
          )}
          <li>
            <button
              type="button"
              className="dropdown-item text-danger d-flex align-items-center gap-2"
              onClick={cerrarSesion}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Cerrar sesión</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
