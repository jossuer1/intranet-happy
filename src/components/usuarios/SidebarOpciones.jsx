import React, { memo } from "react";

const OPCIONES_NAVEGACION = [
  {
    id: "ver_usuarios",
    label: "Ver usuarios",
    icono: "bi-people-fill",
  },
  {
    id: "crear_usuario",
    label: "Crear usuario",
    icono: "bi-person-plus-fill",
  },
];

function SidebarOpciones({ opcionActiva, setOpcionActiva }) {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-3">
        <p className="text-uppercase text-muted fw-bold small mb-2">Opciones</p>
        <nav className="nav flex-column nav-pills">
          {OPCIONES_NAVEGACION.map((opcion, index) => {
            const esActiva = opcionActiva === opcion.id;
            const esUltimo = index === OPCIONES_NAVEGACION.length - 1;

            return (
              <button
                key={opcion.id}
                type="button"
                className={`nav-link text-start d-flex align-items-center gap-2 ${
                  !esUltimo ? "mb-2" : ""
                } ${esActiva ? "active" : "text-dark"}`}
                onClick={() => setOpcionActiva(opcion.id)}
                aria-current={esActiva ? "page" : undefined}
              >
                <i className={`bi ${opcion.icono} fs-5`}></i>
                <span>{opcion.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default memo(SidebarOpciones);
