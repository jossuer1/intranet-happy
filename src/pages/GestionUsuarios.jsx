import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import UsuarioFormCard from "../components/usuarios/UsuarioFormCard.jsx";
import TablaUsuarios from "../components/usuarios/TablaUsuarios";
import AppLayout from "../components/layout/AppLayout";
import SectionHeader from "../components/layout/SectionHeader";
import {
  getUsuarios,
  getPorId,
  crearUsuario,
  actualizarUsuario,
  actualizarVacacionesUsuario,
  subirFotoPerfil,
} from "../services/usuariosService.js";

function GestionUsuarios() {
  const location = useLocation();
  const navigate = useNavigate();

  const esCrear = location.pathname === "/gestion-usuarios/crear";

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(false);
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

  // La fila de la tabla (usuario) solo trae los campos resumidos de
  // GET /usuarios. Para editar necesitamos la ficha completa, así que
  // pedimos el detalle a GET /usuarios/{id} antes de abrir el formulario.
  const abrirEdicion = async (usuario) => {
    if (!usuario?.idUsuario) return;

    try {
      setCargandoUsuario(true);
      const perfilCompleto = await getPorId(usuario.idUsuario);
      setUsuarioSeleccionado(perfilCompleto);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo cargar el usuario",
        text: err.message || "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setCargandoUsuario(false);
    }
  };

  const cancelarEdicion = () => {
    setUsuarioSeleccionado(null);
  };

  // Guarda tanto la creación como la edición de un usuario.
  // Si targetId es null/undefined -> creación (POST). Si viene con valor -> edición (PUT).
  // archivoFoto es el File real (o null si no se cambió la foto); se sube
  // aparte, a Cloudinary, una vez que ya sabemos el idUsuario definitivo.
  const guardarUsuario = async (targetId, formData, archivoFoto) => {
    const esEdicion = Boolean(targetId);

    try {
      let idUsuarioFinal = targetId;

      if (esEdicion) {
        // 1. Petición principal con la ficha completa del usuario
        await actualizarUsuario(targetId, formData);

        // 2. Petición para actualizar vacaciones
        await actualizarVacacionesUsuario(targetId, {
          tieneVacaciones: formData.tieneVacaciones,
          diasVacacionesAsignados: formData.tieneVacaciones
            ? Number(formData.diasVacacionesAsignados || 15)
            : null,
        });
      } else {
        // Creación: un único POST con toda la ficha (incluidas vacaciones)
        const usuarioCreado = await crearUsuario(formData);
        idUsuarioFinal = usuarioCreado?.idUsuario;
      }

      // 3. Si se seleccionó una foto nueva, se sube una vez que el usuario
      //    ya existe (recién creado o el que se estaba editando). Se hace
      //    aparte para que un fallo acá no se confunda con un fallo al
      //    guardar el resto de la ficha, que ya se guardó bien.
      let fotoFallo = false;
      if (archivoFoto && idUsuarioFinal) {
        try {
          await subirFotoPerfil(idUsuarioFinal, archivoFoto);
        } catch (errFoto) {
          fotoFallo = true;
          await Swal.fire({
            icon: "warning",
            title: "Usuario guardado, pero la foto no se pudo subir",
            text:
              errFoto.message ||
              "Intenta subir la foto de nuevo desde la edición del usuario.",
          });
        }
      }

      await cargarUsuarios();
      setUsuarioSeleccionado(null);
      navigate("/gestion-usuarios");

      if (fotoFallo) return;

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: esEdicion
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: esEdicion ? "Error al actualizar" : "Error al crear",
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
          {/* MODO CREACIÓN Y EDICIÓN: mismo formulario, mismo flujo de guardado */}
          {esCrear ? (
            <UsuarioFormCard
              onGuardar={guardarUsuario}
              onCancelar={() => navigate("/gestion-usuarios")}
            />
          ) : usuarioSeleccionado ? (
            <UsuarioFormCard
              usuarioOriginal={usuarioSeleccionado}
              onGuardar={guardarUsuario}
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

                {loading || cargandoUsuario ? (
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
