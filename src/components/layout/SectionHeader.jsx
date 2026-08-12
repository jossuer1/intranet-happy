import { useNavigate } from "react-router-dom";

/**
 * Título de sección + volver, integrado al fondo de la página
 * (a propósito NO es un <nav> con su propia barra/sombra: eso se
 * veía como un segundo navbar apilado sobre el principal).
 *
 * @param {string} titulo - Título del módulo/página
 * @param {string} volverA - Ruta a la que navega el botón "Volver" (default: /dashboard)
 * @param {React.ReactNode} acciones - Slot opcional a la derecha (botones extra)
 */
function SectionHeader({ titulo, volverA = "/dashboard", acciones }) {
  const navigate = useNavigate();

  return (
    <div className="container-fluid px-4 pt-4 pb-1">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
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
          <h4 className="mb-0 fw-bold text-dark">{titulo}</h4>
        </div>

        {acciones && <div className="d-flex align-items-center gap-2">{acciones}</div>}
      </div>
    </div>
  );
}

export default SectionHeader;
