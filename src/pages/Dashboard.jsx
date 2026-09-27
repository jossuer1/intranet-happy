import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import AppLayout from "../components/layout/AppLayout";
import { getImagenesActivas } from "../services/imagenesService.js";

function Dashboard() {
  const carouselRef = useRef(null);
  const carouselInstanceRef = useRef(null);

  const { data: imagenes = [], isLoading: cargando } = useQuery({
    queryKey: ["imagenesActivas"],
    queryFn: async () => {
      const respuesta = await getImagenesActivas();
      return Array.isArray(respuesta) ? respuesta : [];
    },
  });

  useEffect(() => {
    if (!carouselRef.current || imagenes.length === 0) return;
    if (!window.bootstrap?.Carousel) return;

    carouselInstanceRef.current?.dispose();
    carouselInstanceRef.current = new window.bootstrap.Carousel(
      carouselRef.current,
      {
        interval: 5000,
        ride: "carousel",
      },
    );

    return () => carouselInstanceRef.current?.dispose();
  }, [imagenes]);

  return (
    <AppLayout>
      <div className="container-fluid px-3 px-md-4 py-3 flex-grow-1 d-flex flex-column">
        <h5 className="mb-3 text-secondary fw-semibold">Novedades</h5>

        {cargando ? (
          <div className="text-center py-5 my-auto">
            <div className="spinner-border text-brand" role="status">
              <span className="visually-hidden">Cargando carrusel...</span>
            </div>
          </div>
        ) : imagenes.length === 0 ? (
          <div className="text-center py-5 text-muted bg-white rounded-4 border shadow-sm my-auto">
            <i className="bi bi-image-alt fs-1 d-block mb-2 text-secondary opacity-50"></i>
            <p className="fw-medium mb-0">
              No hay novedades publicadas por el momento.
            </p>
          </div>
        ) : (
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white flex-grow-1 d-flex flex-column">
            <div
              id="dashboardCarousel"
              ref={carouselRef}
              className="carousel slide h-100 d-flex flex-column justify-content-center"
            >
              {/* Indicadores */}
              <div className="carousel-indicators mb-2">
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
              <div className="carousel-inner h-100">
                {imagenes.map((img, index) => (
                  <div
                    key={img.idImagen || img.id || index}
                    className={`carousel-item h-100 ${index === 0 ? "active" : ""}`}
                  >
                    <div className="d-flex justify-content-center align-items-center h-100 bg-dark rounded-3 overflow-hidden">
                      <img
                        src={img.rutaImagen}
                        className="img-fluid w-100 h-auto"
                        alt={img.titulo || img.descripcion || "Imagen carrusel"}
                        style={{
                          maxHeight: "75vh", // Permite mayor altura en pantallas grandes
                          objectFit: "contain", // Cambiado a 'contain' para que NUNCA se corte la imagen
                          width: "100%",
                        }}
                      />
                    </div>
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
                  className="carousel-control-prev-icon bg-dark rounded-circle p-3 shadow"
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
                  className="carousel-control-next-icon bg-dark rounded-circle p-3 shadow"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Siguiente</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Dashboard;
