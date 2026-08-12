import React from "react";

function PublicarBanner({
  nuevoTitulo,
  setNuevoTitulo,
  imagenPreview,
  onImagenChange,
  onSubmit,
  onCancelar,
}) {
  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      {/* Header Superior */}
      <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <i className="bi bi-plus-circle-fill text-success fs-4"></i>
            Subir Nuevo Banner
          </h5>
          <small className="text-muted">
            Publica avisos o novedades para todos los colaboradores de la
            Intranet.
          </small>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary px-3 rounded-3"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-publicar-banner"
            className="btn btn-success px-4 rounded-3 fw-semibold shadow-sm"
          >
            <i className="bi bi-send-fill me-2"></i>Publicar
          </button>
        </div>
      </div>

      <div className="card-body p-4">
        <form id="form-publicar-banner" onSubmit={onSubmit}>
          <div className="row g-4">
            {/* COLUMNA IZQUIERDA: Formulario */}
            <div className="col-lg-6 d-flex flex-column justify-content-between">
              <div>
                {/* Título */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark small text-uppercase tracking-wide">
                    1. Título o Descripción del Banner
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg fs-6 rounded-3 border-light-subtle shadow-none"
                    placeholder="Ej. Aniversario Empresarial u Horarios de Atención"
                    value={nuevoTitulo}
                    onChange={(e) => setNuevoTitulo(e.target.value)}
                    required
                  />
                  <small className="text-muted d-block mt-1">
                    Este texto identificará la publicación en el panel.
                  </small>
                </div>

                {/* Subir Archivo - Drag & Drop Box */}
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark small text-uppercase tracking-wide">
                    2. Seleccionar Imagen
                  </label>
                  <div className="position-relative border border-2 border-dashed rounded-4 p-4 text-center bg-light-subtle hover-bg-light transition-all">
                    <input
                      type="file"
                      className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={onImagenChange}
                      required={!imagenPreview}
                      style={{ cursor: "pointer", zIndex: 2 }}
                    />
                    <div className="py-2">
                      <div className="badge bg-success-subtle text-success p-3 rounded-circle mb-2">
                        <i className="bi bi-cloud-arrow-up-fill fs-3"></i>
                      </div>
                      <h6 className="fw-bold text-dark mb-1">
                        Haz clic o arrastra tu imagen aquí
                      </h6>
                      <small className="text-muted d-block mb-2">
                        Formatos soportados: PNG, JPG o WEBP
                      </small>
                      <span className="btn btn-sm btn-outline-success rounded-pill px-3 fs-7">
                        Examinar archivos
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips de Formato */}
              <div className="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis rounded-3 d-flex align-items-center gap-2 m-0 p-3">
                <i className="bi bi-aspect-ratio fs-4"></i>
                <small className="lh-sm">
                  <strong>Recomendación:</strong> Utiliza imágenes horizontales
                  (16:9) para evitar recortes innecesarios en el banner.
                </small>
              </div>
            </div>

            {/* COLUMNA DERECHA: Vista Previa en Vivo (Simulación de Dashboard) */}
            <div className="col-lg-6">
              <label className="form-label fw-bold text-dark small text-uppercase tracking-wide mb-2">
                Vista Previa en la Intranet
              </label>

              <div className="bg-light rounded-4 p-3 border">
                {/* Header ficticio de la tarjeta */}
                <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                  <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2">
                    <i className="bi bi-eye me-1"></i> Previsualización
                  </span>
                  <small className="text-muted fs-7">
                    {nuevoTitulo ? nuevoTitulo : "Sin título"}
                  </small>
                </div>

                {/* Frame del Banner */}
                <div
                  className="rounded-3 overflow-hidden bg-white border d-flex align-items-center justify-content-center shadow-sm position-relative"
                  style={{
                    height: "280px",
                    backgroundImage: imagenPreview
                      ? `url(${imagenPreview})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {!imagenPreview && (
                    <div className="text-center text-muted p-4">
                      <i className="bi bi-image fs-1 opacity-25 d-block mb-2"></i>
                      <p className="fw-medium mb-0 small">
                        Aún no has seleccionado ninguna imagen
                      </p>
                      <small className="text-muted fs-7">
                        Carga un archivo para ver la vista previa
                      </small>
                    </div>
                  )}

                  {/* Overlay gradiente inferior para simular texto encima si fuera necesario */}
                  {imagenPreview && (
                    <div className="position-absolute bottom-0 start-0 end-0 p-3 text-white bg-dark bg-opacity-50 backdrop-blur">
                      <p className="m-0 fw-semibold text-truncate small">
                        {nuevoTitulo || "Título del banner"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PublicarBanner;
