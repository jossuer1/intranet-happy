import { useNavigate } from "react-router-dom";

import valoresImg from "../assets/images/valores_happy.png";
import cumpleImg from "../assets/images/cumpleaños_agosto.png";
import capImg from "../assets/images/capacitacion.png";
import AppLayout from "../components/layout/AppLayout";

const MODULOS = [
  {
    key: "gestion-usuarios",
    titulo: "Gestión de Usuarios",
    descripcion: "Administra los usuarios del sistema, sus roles y accesos.",
    ruta: "/gestion-usuarios",
    icono: (
      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    ),
  },
  {
    key: "mi-perfil",
    titulo: "Mi Perfil",
    descripcion: "Revisa y confirma tu información personal y laboral.",
    ruta: "/mi-perfil",
    icono: (
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664H13Z" />
    ),
  },
  {
    key: "mis-vacaciones",
    titulo: "Mis Vacaciones",
    descripcion: "Consulta tus días disponibles y el historial de solicitudes.",
    ruta: "/mis-vacaciones",
    icono: (
      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5ZM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1Z" />
    ),
  },
];

function Dashboard() {
  const navigate = useNavigate();

  const carruselImagenes = [
    { id: 1, url: valoresImg, alt: "Valores de Happy Pay" },
    { id: 2, url: cumpleImg, alt: "Cumpleaños del Mes" },
    { id: 3, url: capImg, alt: "Capacitaciones del Mes" },
  ];

  return (
    <AppLayout>
      <div className="container-fluid px-4 my-4 flex-grow-1">
        <div className="row">
          {/* Ocupa el 100% de la columna principal */}
          <div className="col-12">
            <h5 className="mb-3 text-secondary fw-semibold">
              Novedades e Intranet
            </h5>
            <div
              id="dashboardCarousel"
              className="carousel slide shadow-sm rounded-3 overflow-hidden w-100"
              data-bs-ride="carousel"
            >
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

              <div className="carousel-inner">
                {carruselImagenes.map((img, index) => (
                  <div
                    key={img.id}
                    className={`carousel-item ${index === 0 ? "active" : ""}`}
                  >
                    <img
                      src={img.url}
                      className="d-block w-100"
                      alt={img.alt}
                      style={{
                        maxHeight: "500px",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                ))}
              </div>

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
      </div>
    </AppLayout>
  );
}

export default Dashboard;
