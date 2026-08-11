import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CrearUsuarioWizard from "./CrearUsuarioWizard";

function GestionUsuarios() {
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState("tabla");

  const [usuarios] = useState([
    {
      id: 1,
      nombre: "Juan Pérez",
      correo: "juan.perez@empresa.com",
      rol: "Administrador",
      estado: "Activo",
    },
    {
      id: 2,
      nombre: "María López",
      correo: "maria.lopez@empresa.com",
      rol: "Usuario",
      estado: "Activo",
    },
  ]);

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand bg-white shadow-sm px-4 py-2">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/dashboard")}
            >
              ← Volver al Dashboard
            </button>
            <h5 className="mb-0 fw-bold text-secondary">Gestión de Usuarios</h5>
          </div>
        </div>
      </nav>

      <div className="container-fluid flex-grow-1 my-4 px-4">
        <div className="row h-100">
          <div className="col-12 col-md-3 col-lg-2 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-body p-3">
                <p className="text-uppercase text-muted fw-bold small mb-2">
                  Opciones
                </p>
                <div className="nav flex-column nav-pills">
                  <button
                    className={`nav-link text-start mb-2 ${tabActiva === "tabla" ? "active" : "text-dark"}`}
                    onClick={() => setTabActiva("tabla")}
                  >
                    👥 Ver usuarios
                  </button>
                  <button
                    className={`nav-link text-start ${tabActiva === "crear" ? "active" : "text-dark"}`}
                    onClick={() => setTabActiva("crear")}
                  >
                    ➕ Crear usuario
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-9 col-lg-10">
            {tabActiva === "tabla" && (
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="card-title fw-bold m-0">
                      Lista de Usuarios
                    </h5>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setTabActiva("crear")}
                    >
                      + Nuevo usuario
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Nombre</th>
                          <th>Correo</th>
                          <th>Rol</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((usr) => (
                          <tr key={usr.id}>
                            <td>{usr.id}</td>
                            <td className="fw-semibold">{usr.nombre}</td>
                            <td>{usr.correo}</td>
                            <td>
                              <span className="badge bg-info text-dark">
                                {usr.rol}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-success">
                                {usr.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {tabActiva === "crear" && (
              <CrearUsuarioWizard
                onCancelar={() => setTabActiva("tabla")}
                onGuardarExitoso={() => setTabActiva("tabla")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GestionUsuarios;
