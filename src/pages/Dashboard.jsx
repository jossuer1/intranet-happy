import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Tus imports exactos
import logoHappyPay from "../assets/images/logo_happy.jpg";
import valoresImg from "../assets/images/valores_happy.png";
import cumpleImg from "../assets/images/cumpleaños_agosto.png";
import capImg from "../assets/images/capacitacion.png";

function Dashboard() {
  const navigate = useNavigate();

  const carruselImagenes = [
    {
      id: 1,
      url: valoresImg,
      alt: "Valores de Happy Pay",
    },
    {
      id: 2,
      url: cumpleImg,
      alt: "Cumpleaños del Mes",
    },
    {
      id: 3,
      url: capImg,
      alt: "Capacitaciones del Mes",
    },
  ];

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
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* 1. NAVBAR */}
      <nav
        className="navbar navbar-expand shadow-sm px-4 py-2 sticky-top"
        style={{ backgroundColor: "#1E5A63" }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Logo Empresa */}
          <div
            className="navbar-brand d-flex align-items-center mb-0"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
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
                  onClick={() => navigate("/perfil")}
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

      {/* CONTENIDO PRINCIPAL */}
      <div className="container my-4 flex-grow-1">
        {/* 2. CARRUSEL CON TAMAÑO CONTROLADO Y CENTRADO */}
        <div className="row mb-5 justify-content-center">
          <div className="col-12 col-md-10 col-lg-9">
            <div
              id="dashboardCarousel"
              className="carousel slide shadow-sm rounded-3 overflow-hidden bg-white mx-auto"
              style={{ maxWidth: "850px" }}
            >
              {/* Indicadores dinámicos */}
              <div className="carousel-indicators">
                {carruselImagenes.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    data-bs-target="#dashboardCarousel"
                    data-bs-slide-to={index}
                    className={index === 0 ? "active" : ""}
                    aria-current={index === 0 ? "true" : "false"}
                    aria-label={`Slide ${index + 1}`}
                  ></button>
                ))}
              </div>

              {/* Items dinámicos */}
              <div className="carousel-inner">
                {carruselImagenes.map((img, index) => (
                  <div
                    key={img.id}
                    className={`carousel-item ${index === 0 ? "active" : ""}`}
                  >
                    <img
                      src={img.url}
                      className="d-block w-100"
                      alt={img.titulo}
                      style={{
                        height: "450px", // Tú defines la altura fija
                        objectFit: "cover", // Escala y recorta para llenar sin deformar
                        objectPosition: "center", // Centra el recorte
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Controles de navegación */}
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#dashboardCarousel"
                data-bs-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Anterior</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#dashboardCarousel"
                data-bs-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Siguiente</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. SECCIÓN DE CARDS */}
        <h4 className="mb-3 text-secondary fw-semibold">Módulos principales</h4>
        <div className="row">
          <div className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div
              className="card shadow-sm border-0 text-center h-100 cursor-pointer"
              onClick={() => navigate("/gestion-usuarios")}
              style={{ cursor: "pointer" }}
            >
              <div className="card-body p-4 d-flex flex-column justify-content-center align-items-center">
                <div
                  className="rounded-circle p-3 mb-3"
                  style={{
                    backgroundColor: "rgba(30, 90, 99, 0.1)",
                    color: "#1E5A63",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    fill="currentColor"
                    className="bi bi-people-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  </svg>
                </div>

                <h5 className="card-title fw-bold text-dark mb-2">
                  Gestión de Usuarios
                </h5>

                <p className="card-text text-muted small mb-4">
                  Administra los usuarios del sistema, sus roles y accesos.
                </p>

                <button
                  type="button"
                  className="btn btn-sm mt-auto w-100 text-white fw-bold py-2"
                  style={{
                    backgroundColor: "#1E5A63",
                    borderColor: "#1E5A63",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/gestion-usuarios");
                  }}
                >
                  Ingresar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
