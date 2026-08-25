import React from "react";

function BannersActivos({
  novedades,
  onNuevoBannerClick,
  onToggleEstado,
  onEliminar,
}) {
  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
      {/* Encabezado con Botón Principal */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <i className="bi bi-images text-primary"></i>
            Banners Registrados
          </h5>
          <small className="text-muted">
            Total de publicaciones: {novedades.length}
          </small>
        </div>
        <button
          className="btn btn-success px-3 py-2 rounded-3 fw-semibold shadow-sm"
          onClick={onNuevoBannerClick}
        >
          <i className="bi bi-plus-lg me-1"></i> Nuevo Banner
        </button>
      </div>

      {novedades.length === 0 ? (
        <div className="text-center py-5 text-muted bg-light rounded-4 border border-dashed">
          <i className="bi bi-image-alt fs-1 d-block mb-2 text-secondary opacity-50"></i>
          <p className="fw-medium mb-1">
            No hay banners registrados en el sistema
          </p>
          <small>
            Haz clic en "Nuevo Banner" para crear la primera publicación.
          </small>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle border-top">
            <thead className="table-light">
              <tr className="text-uppercase fs-7 text-muted tracking-wide">
                <th style={{ width: "110px" }}>Vista Previa</th>
                <th>Título / Descripción</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th className="text-end" style={{ width: "130px" }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {novedades.map((item) => (
                <tr key={item.idImagen}>
                  <td>
                    <img
                      src={item.rutaImagen}
                      alt={item.titulo}
                      style={{
                        width: "80px",
                        height: "45px",
                        objectFit: "cover",
                      }}
                      className="rounded-3 border shadow-sm"
                    />
                  </td>
                  <td className="fw-semibold text-dark">{item.titulo}</td>
                  <td>
                    <span className="badge bg-light text-secondary border px-2 py-1 fw-normal">
                      <i className="bi bi-calendar3 me-1"></i>
                      {item.fechaCreacion
                        ? new Date(item.fechaCreacion).toLocaleDateString()
                        : "-"}
                    </span>
                  </td>
                  <td>
                    {item.estado ? (
                      <span className="badge bg-success text-white rounded-pill px-3 py-1 fw-semibold">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Activo
                      </span>
                    ) : (
                      <span className="badge bg-secondary text-white rounded-pill px-3 py-1 fw-semibold">
                        <i className="bi bi-dash-circle-fill me-1"></i>
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="d-flex gap-2 justify-content-end">
                      {/* Botón Activar / Desactivar con color sólido */}
                      <button
                        type="button"
                        className={`btn btn-sm px-3 py-1.5 rounded-3 shadow-sm border-0 ${
                          item.estado
                            ? "btn-warning text-dark"
                            : "btn-success text-white"
                        }`}
                        onClick={() => onToggleEstado(item.idImagen)}
                        title={
                          item.estado ? "Ocultar Banner" : "Mostrar Banner"
                        }
                      >
                        <i
                          className={`bi ${
                            item.estado ? "bi-eye-slash-fill" : "bi-eye-fill"
                          } fs-6`}
                        ></i>
                      </button>

                      {/* Botón Eliminar con color rojo sólido */}
                      <button
                        type="button"
                        className="btn btn-sm btn-danger text-white px-3 py-1.5 rounded-3 shadow-sm border-0"
                        onClick={() => onEliminar(item.idImagen)}
                        title="Eliminar Banner"
                      >
                        <i className="bi bi-trash3-fill fs-6"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BannersActivos;