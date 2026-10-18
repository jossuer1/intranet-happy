import { useEffect } from "react";

/**
 * Modal de Bootstrap controlado por React (no usa el JS de Bootstrap).
 * Se cierra con la X, con los botones del contenido o con la tecla Esc.
 * A propósito NO se cierra al hacer clic afuera, para no perder lo escrito.
 */
function ModalBase({ titulo, subtitulo, onClose, children }) {
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [onClose]);

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-0 pb-0">
              <div>
                <h5 className="modal-title fw-bold mb-0">{titulo}</h5>
                {subtitulo && (
                  <small className="text-muted">{subtitulo}</small>
                )}
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={onClose}
              ></button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalBase;
