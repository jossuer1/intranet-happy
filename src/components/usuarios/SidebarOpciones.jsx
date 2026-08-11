function SidebarOpciones({ opcionActiva, setOpcionActiva }) {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-3">
        <p className="text-uppercase text-muted fw-bold small mb-2">Opciones</p>
        <div className="nav flex-column nav-pills">
          <button
            className={`nav-link text-start mb-2 ${
              opcionActiva === "ver_usuarios" ? "active" : "text-dark"
            }`}
            onClick={() => setOpcionActiva("ver_usuarios")}
          >
            👥 Ver usuarios
          </button>
          <button
            className={`nav-link text-start ${
              opcionActiva === "crear_usuario" ? "active" : "text-dark"
            }`}
            onClick={() => setOpcionActiva("crear_usuario")}
          >
            ➕ Crear usuario
          </button>
        </div>
      </div>
    </div>
  );
}

export default SidebarOpciones;
