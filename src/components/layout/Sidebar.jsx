/**
 * Sidebar de opciones tipo "pills", reutilizable en cualquier módulo
 * (Gestión de usuarios, y a futuro cualquier otra sección con tabs).
 *
 * @param {Array<{key: string, label: string, icon?: React.ReactNode}>} opciones
 * @param {string} activa - key de la opción activa
 * @param {(key: string) => void} onChange
 * @param {string} titulo - Título pequeño arriba de las opciones
 */
function Sidebar({ opciones, activa, onChange, titulo = "Opciones" }) {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-3">
        <p className="text-uppercase text-muted fw-bold small mb-2">{titulo}</p>
        <div className="nav flex-column nav-pills">
          {opciones.map((opcion, index) => (
            <button
              key={opcion.key}
              type="button"
              className={`nav-link text-start ${
                index < opciones.length - 1 ? "mb-2" : ""
              } ${activa === opcion.key ? "active" : "text-dark"}`}
              onClick={() => onChange(opcion.key)}
            >
              {/* Renderizado seguro para emojis, texto o iconos JSX */}
              {opcion.icon && <span className="me-2">{opcion.icon}</span>}
              {opcion.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
