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
      <div className="container-fluid px-4 my-4 flex-grow-1">
        <div className="row">
          <div className="col-12">
            <h5 className="mb-3 text-secondary fw-semibold">Novedades</h5>

            {cargando ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando carrusel...</span>
                </div>
              </div>
            ) : imagenes.length === 0 ? (
              <div className="text-center py-5 text-muted bg-light rounded-4 border">
                <i className="bi bi-image-alt fs-1 d-block mb-2 text-secondary opacity-50"></i>
                <p className="fw-medium mb-0">
                  No hay novedades publicadas por el momento.
                </p>
              </div>
            ) : (
              <div
                id="dashboardCarousel"
                ref={carouselRef}
                className="carousel slide shadow-sm rounded-3 overflow-hidden w-100"
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
                      key={img.idImagen || img.id || index}
                      className={`carousel-item ${index === 0 ? "active" : ""}`}
                    >
                      <img
                        src={img.rutaImagen}
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
