import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuthStore } from "../../store/useAuthStore";

function Navbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const cerrarSesion = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas salir del sistema?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1E5A63",
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
    /* Cambiamos 'bg-white border-bottom' por 'bg-brand' para darle el color verde */
    <nav
      className="navbar navbar-expand bg-brand px-4 py-2 sticky-top shadow-sm"
      style={{ zIndex: 1040, height: "64px" }}
    >
      <div className="container-fluid d-flex justify-content-end align-items-center">
        {/* Dropdown Perfil de Usuario */}
        <div className="dropdown">
          <button
            /* Botón transparente/blanco para contrastar con el fondo verde */
            className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center p-0 border-0"
            type="button"
            id="dropdownMenuUser"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ width: "40px", height: "40px" }}
          >
            <i className="bi bi-person-circle fs-4 text-white"></i>
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end shadow border-0 mt-2"
            aria-labelledby="dropdownMenuUser"
          >
            <li>
              <button
                className="dropdown-item d-flex align-items-center gap-2"
                onClick={() => navigate("/mi-perfil")}
              >
                <i className="bi bi-person"></i>
                <span>Ver perfil</span>
              </button>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button
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
    </nav>
  );
}

export default Navbar;
