import { useQuery } from "@tanstack/react-query";

import valoresImg from "../assets/images/valores_happy.png";
import cumpleImg from "../assets/images/cumpleanos_agosto.png";
import capImg from "../assets/images/capacitacion.png";
import AppLayout from "../components/layout/AppLayout";
import { getImagenesActivas } from "../services/imagenesService.js"; // O desde tu servicio modularizado de imágenes

const IMAGENES_POR_DEFECTO = [
  { id: 1, url: valoresImg, titulo: "Valores de Happy Pay" },
  { id: 2, url: cumpleImg, titulo: "Cumpleaños del Mes" },
  { id: 3, url: capImg, titulo: "Capacitaciones del Mes" },
];

function Dashboard() {
  // Manejo de petición y caché con TanStack Query
  const { data: imagenes = IMAGENES_POR_DEFECTO, isLoading: cargando } =
    useQuery({
      queryKey: ["imagenesActivas"],
      queryFn: async () => {
        const respuesta = await getImagenesActivas();
        return Array.isArray(respuesta) && respuesta.length > 0
          ? respuesta
          : IMAGENES_POR_DEFECTO;
      },
      // Fallback directo en caso de error HTTP o de red
      initialData: IMAGENES_POR_DEFECTO,
    });

  return (
    <AppLayout>
      <div className="container-fluid px-4 my-4 flex-grow-1">
        <div className="row">
          <div className="col-12">
            <h5 className="mb-3 text-secondary fw-semibold">
              Novedades e Intranet
            </h5>

            {cargando ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando carrusel...</span>
                </div>
              </div>
            ) : (
              <div
                id="dashboardCarousel"
                className="carousel slide shadow-sm rounded-3 overflow-hidden w-100"
                data-bs-ride="carousel"
              >
                {/* Indicadores */}
                <div className="carousel-indicators">
                  {imagenes.map((_, index) => (
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

                {/* Diapositivas */}
                <div className="carousel-inner">
                  {imagenes.map((img, index) => (
                    <div
                      key={img.id || index}
                      className={`carousel-item ${index === 0 ? "active" : ""}`}
                    >
                      <img
                        src={img.url || img.rutaImagen}
                        className="d-block w-100"
                        alt={img.titulo || img.descripcion || "Imagen carrusel"}
                        style={{
                          maxHeight: "500px",
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Controles de Navegación */}
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
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;
