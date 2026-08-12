import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import logoHappyPay from "../../assets/images/logo_happy.jpg";

/**
 * Navbar principal de la intranet.
 * Se monta una sola vez dentro de AppLayout: ninguna página individual
 * debería volver a dibujar su propio navbar.
 */
function Navbar() {
  const navigate = useNavigate();

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
        navigate("/login");
      }
    });
  };

  return (
    <nav
      className="navbar navbar-expand shadow-sm px-4 py-2 sticky-top bg-brand"
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Logo Empresa */}
        <div
          className="navbar-brand d-flex align-items-center mb-0"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          <img
            src={logoHappyPay}
            alt="Happy Pay Logo"
            style={{ height: "42px", objectFit: "contain" }}
          />
        </div>

        {/* Perfil de Usuario Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center p-0"
            type="button"
            id="dropdownMenuUser"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ width: "42px", height: "42px" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="currentColor"
              className="bi bi-person-circle"
              viewBox="0 0 16 16"
            >
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
              <path
                fillRule="evenodd"
                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
              />
            </svg>
          </button>
          <ul
            className="dropdown-menu dropdown-menu-end shadow border-0 mt-2"
            aria-labelledby="dropdownMenuUser"
          >
            <li>
              <button
                className="dropdown-item"
                onClick={() => navigate("/mi-perfil")}
              >
                Ver perfil
              </button>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button
                className="dropdown-item text-danger"
                onClick={cerrarSesion}
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
