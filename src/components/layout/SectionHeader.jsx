import { useContext } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { TopBarContext } from "./TopBarContext";

/**
 * Título de la vista (flecha de volver + título). NO ocupa una fila propia:
 * se dibuja dentro de la fila superior de AppLayout, a la izquierda de la
 * tarjeta del usuario, para que ambos compartan la misma línea y el contenido
 * suba hasta arriba.
 *
 * @param {string} titulo - Título de la vista
 * @param {string} subtitulo - Texto pequeño opcional debajo del título
 * @param {string} volverA - Ruta del botón "Volver" (default: /dashboard)
 * @param {boolean} mostrarVolver - false = sin flecha (p. ej. Inicio o Administración)
 * @param {React.ReactNode} acciones - Slot opcional a la derecha del título
 */
function SectionHeader({
  titulo,
  subtitulo,
  volverA = "/dashboard",
  mostrarVolver = true,
  acciones,
}) {
  const navigate = useNavigate();
  const contenedor = useContext(TopBarContext);

  const contenido = (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 w-100">
      <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
        {mostrarVolver && (
          <button
            type="button"
            className="btn btn-light border d-inline-flex align-items-center justify-content-center rounded-circle p-0"
            style={{ width: "36px", height: "36px", flexShrink: 0 }}
            onClick={() => navigate(volverA)}
            aria-label="Volver"
            title="Volver"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
              />
            </svg>
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          <h4 className="mb-0 fw-bold text-dark text-truncate">{titulo}</h4>
          {subtitulo && (
            <small className="text-muted d-block text-truncate">
              {subtitulo}
            </small>
          )}
        </div>
      </div>

      {acciones && (
        <div className="d-flex align-items-center gap-2">{acciones}</div>
      )}
    </div>
  );

  // Fuera de AppLayout (no debería pasar): se dibuja como antes, en su propia fila
  if (contenedor === undefined) {
    return <div className="container-fluid px-4 pt-4 pb-1">{contenido}</div>;
  }
  // AppLayout aún montando la fila superior (dura un instante, antes de pintar)
  if (contenedor === null) return null;

  return createPortal(contenido, contenedor);
}

export default SectionHeader;
