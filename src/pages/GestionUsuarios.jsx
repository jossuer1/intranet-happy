import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CrearUsuarioWizard from "./CrearUsuarioWizard";
import EditarUsuarioCard from "../components/usuarios/EditarUsuarioCard";
import TablaUsuarios from "../components/usuarios/TablaUsuarios";
import AppLayout from "../components/layout/AppLayout";
import SectionHeader from "../components/layout/SectionHeader";

function GestionUsuarios() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determinar la vista basada en la subruta
  const esCrear = location.pathname === "/gestion-usuarios/crear";

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nombre: "Juan Pérez",
      nombres: "Juan Pérez",
      correo: "juan.perez@empresa.com",
      correoEmpresa: "juan.perez@empresa.com",
      estado: "Activo",
      cargo: "Analista de Sistemas",
      departamento: "Tecnología",
    },
    {
      id: 2,
      nombre: "María López",
      nombres: "María López",
      correo: "maria.lopez@empresa.com",
      correoEmpresa: "maria.lopez@empresa.com",
      estado: "Activo",
      cargo: "Analista de Soporte",
      departamento: "Tecnología",
    },
  ]);

  const abrirEdicion = (usuario) => {
    setUsuarioSeleccionado(usuario);
  };

  const cancelarEdicion = () => {
    setUsuarioSeleccionado(null);
  };

  const guardarEdicion = (formData) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === usuarioSeleccionado.id
          ? {
              ...u,
              ...formData,
              nombre: formData.nombres,
              correo: formData.correoEmpresa,
            }
          : u,
      ),
    );
    setUsuarioSeleccionado(null);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Usuario actualizado",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };

  return (
    <AppLayout>
      <SectionHeader titulo="Gestión de Usuarios" volverA="/dashboard" />

      <div className="container-fluid flex-grow-1 mt-2 mb-4 px-4">
        <div className="w-100">
          {/* MODO CREACIÓN */}
          {esCrear ? (
            <CrearUsuarioWizard
              onCancelar={() => navigate("/gestion-usuarios")}
              onGuardarExitoso={() => navigate("/gestion-usuarios")}
            />
          ) : usuarioSeleccionado ? (
            /* MODO EDICIÓN */
            <EditarUsuarioCard
              usuario={usuarioSeleccionado}
              onGuardar={guardarEdicion}
              onCancelar={cancelarEdicion}
            />
          ) : (
            /* MODO TABLA / LISTA GENERAL */
            <div className="card shadow-sm border-0 rounded-3">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="card-title fw-bold m-0">
                      Lista de Usuarios
                    </h5>
                    <small className="text-muted">
                      Administra y revisa los accesos de los empleados
                    </small>
                  </div>
                  <button
                    className="btn btn-sm text-white bg-brand border-0 d-flex align-items-center gap-2 px-3 py-2"
                    onClick={() => navigate("/gestion-usuarios/crear")}
                  >
                    <i className="bi bi-person-plus"></i>
                    <span>Nuevo usuario</span>
                  </button>
                </div>

                <TablaUsuarios usuarios={usuarios} onEditar={abrirEdicion} />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default GestionUsuarios;
