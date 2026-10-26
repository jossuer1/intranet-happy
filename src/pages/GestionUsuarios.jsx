import ModalDialog from "../components/ui/ModalDialog";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  actualizarEstadoUsuario,
  subirFotoPerfil,
} from "../services/usuariosService.js";
import { useAuthStore } from "../store/useAuthStore";

function GestionUsuarios() {
  const location = useLocation();
  const navigate = useNavigate();
  const usuarioLogueado = useAuthStore((state) => state.user);

  const [guardando, setGuardando] = useState(false);
  const esCrear = location.pathname === "/gestion-usuarios/crear";

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(false);
  const consulta = useQuery({ queryKey: ["usuarios"], queryFn: getUsuarios,
    select: data => Array.isArray(data) ? data : [] });
  const usuarios = consulta.data || [];
  const loading = consulta.isPending;
  const error = consulta.error?.message;
  // El listado permanece montado: conserva filtros al refrescar tras un cambio.
  const cargarUsuarios = () => consulta.refetch();

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
    if (guardando) return;
    setUsuarioSeleccionado(null);
    if (location.pathname.endsWith("/crear")) navigate("/gestion-usuarios", { replace: true });
  };

  // Activa o desactiva la cuenta de un usuario. No se permite que RRHH se
  // desactive a sí mismo desde esta pantalla (evita quedarse sin acceso).
  const cambiarEstadoUsuario = async (usuario) => {
    if (!usuario?.idUsuario) return;

    if (usuario.idUsuario === usuarioLogueado?.idUsuario) {
      Swal.fire({
        icon: "warning",
        title: "No puedes cambiar tu propio estado",
        text: "Pide a otro usuario de RRHH que lo haga por ti.",
      });
      return;
    }

    const activar = !(
      usuario.estado === true ||
      usuario.estado === "Activo" ||
      usuario.estado === 1
    );

    const confirmacion = await Swal.fire({
      icon: "warning",
      title: activar ? "¿Activar esta cuenta?" : "¿Desactivar esta cuenta?",
      text: activar
        ? "El usuario podrá volver a iniciar sesión."
        : "El usuario no podrá iniciar sesión ni cambiar su contraseña.",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmacion.isConfirmed) return;

    try {
      await actualizarEstadoUsuario(usuario.idUsuario, activar);
      await cargarUsuarios();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: activar ? "Cuenta activada" : "Cuenta desactivada",
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo cambiar el estado",
        text: err.message || "Inténtalo de nuevo en unos segundos.",
      });
    }
  };

  // Guarda tanto la creación como la edición de un usuario.
  // Si targetId es null/undefined -> creación (POST). Si viene con valor -> edición (PUT).
  // archivoFoto es el File real (o null si no se cambió la foto); se sube
  // aparte, a Cloudinary, una vez que ya sabemos el idUsuario definitivo.
  const guardarUsuario = async (targetId, formData, archivoFoto) => {
    setGuardando(true);
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

      await cargarUsuarios({ silencioso: true });
      setUsuarioSeleccionado(null);
      if (location.pathname.endsWith("/crear")) navigate("/gestion-usuarios", { replace: true });

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
    } finally {
      setGuardando(false);
    }
  };
  if (esCrear) return <AppLayout>
    <SectionHeader titulo="Nuevo colaborador" volverA="/gestion-usuarios" />
    <div className="container-fluid mb-4"><div className="card border-0 shadow-sm hp-crear-usuario"><div className="card-body p-4">
      <UsuarioFormCard usuariosDisponibles={usuarios} onGuardar={guardarUsuario} onCancelar={() => { if (!guardando) navigate("/gestion-usuarios"); }} />
    </div></div></div>
  </AppLayout>;

  return (
    <AppLayout>
      <SectionHeader titulo="Gestión de usuarios" volverA="/dashboard" />
      <div className="container-fluid flex-grow-1 mb-4 px-4">
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4">
            <div className="hp-card-header">
              <div><h5 className="fw-bold mb-1">Colaboradores</h5>
                <p className="text-muted small mb-0">Consulta expedientes y administra la información de tu equipo.</p></div>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate("/gestion-usuarios/crear")}>
                <i className="bi bi-person-plus me-2" aria-hidden="true" />Nuevo colaborador
              </button>
            </div>
            {loading ? <div className="text-center py-5" role="status"><span className="spinner-border text-primary" /><p className="text-muted mt-2">Cargando colaboradores…</p></div>
              : error ? <div className="alert alert-danger" role="alert">{error}</div>
              : <TablaUsuarios usuarios={usuarios} onEditar={abrirEdicion} onCambiarEstado={cambiarEstadoUsuario} />}
          </div>
        </div>
      </div>
      {(usuarioSeleccionado || cargandoUsuario) && <ModalDialog
        titulo="Editar expediente"
        subtitulo="Los cambios se guardan sin salir del listado."
        onClose={cancelarEdicion} size="xl" ocupado={guardando || cargandoUsuario}>
        {cargandoUsuario ? <p role="status" className="text-muted py-4">Cargando expediente…</p> : <UsuarioFormCard
          key={usuarioSeleccionado?.idUsuario || "nuevo"}
          usuarioOriginal={usuarioSeleccionado || undefined}
          usuariosDisponibles={usuarios}
          onGuardar={guardarUsuario}
          onCancelar={cancelarEdicion}
        />}
      </ModalDialog>}
    </AppLayout>
  );
}

export default GestionUsuarios;
