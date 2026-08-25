import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CrearUsuarioWizard from "../components/usuarios/CrearUsuarioWizard.jsx";
import EditarUsuarioCard from "../components/usuarios/EditarUsuarioCard";
import TablaUsuarios from "../components/usuarios/TablaUsuarios";
import AppLayout from "../components/layout/AppLayout";
import SectionHeader from "../components/layout/SectionHeader";
import {
  getUsuarios,
  actualizarUsuario,
  actualizarVacacionesUsuario,
} from "../services/usuariosService.js";

function GestionUsuarios() {
  const location = useLocation();
  const navigate = useNavigate();

  const esCrear = location.pathname === "/gestion-usuarios/crear";

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial de usuarios desde el servidor
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!esCrear) {
      cargarUsuarios();
    }
  }, [location.pathname]);

  const abrirEdicion = (usuario) => {
    setUsuarioSeleccionado(usuario);
  };

  const cancelarEdicion = () => {
    setUsuarioSeleccionado(null);
  };

  const guardarEdicion = async (targetId, formData) => {
    try {
      // 1. Petición principal con la ficha completa del usuario
      await actualizarUsuario(targetId, formData);

      // 2. Petición para actualizar vacaciones
      await actualizarVacacionesUsuario(targetId, {
        tieneVacaciones: formData.tieneVacaciones,
        diasVacacionesAsignados: formData.tieneVacaciones
          ? Number(formData.diasVacacionesAsignados || 15)
          : null,
      });

      await cargarUsuarios();
      setUsuarioSeleccionado(null);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Usuario actualizado correctamente",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text:
          err.message || "No se pudieron guardar los cambios en el servidor.",
      });
    }
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
              onGuardarExitoso={() => {
                navigate("/gestion-usuarios");
                cargarUsuarios();
              }}
            />
          ) : usuarioSeleccionado ? (
            /* MODO EDICIÓN - Se corrigió el nombre de la prop a 'usuarioOriginal' */
            <EditarUsuarioCard
              usuarioOriginal={usuarioSeleccionado}
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
                    className="btn btn-sm text-white bg-brand border-0 d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                    onClick={() => navigate("/gestion-usuarios/crear")}
                  >
                    <i className="bi bi-person-plus"></i>
                    <span>Nuevo usuario</span>
                  </button>
                </div>

                {loading ? (
                  <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger my-3" role="alert">
                    {error}
                  </div>
                ) : (
                  <TablaUsuarios usuarios={usuarios} onEditar={abrirEdicion} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default GestionUsuarios;
