import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AppLayout from "../components/layout/AppLayout";
import BannersActivos from "../components/novedades/BannersActivos";
import PublicarBanner from "../components/novedades/PublicarBanner";
import {
  getTodasLasImagenes,
  agregarImagen,
  actualizarImagen,
  desactivarImagen,
} from "../services/imagenesService";

function GestionNovedades() {
  const location = useLocation();
  const navigate = useNavigate();

  const esPublicar = location.pathname.endsWith("/publicar");

  const [novedades, setNovedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states para el banner
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [publicando, setPublicando] = useState(false);

  const cargarBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodasLasImagenes();
      setNovedades(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "No se pudieron cargar los banners informativos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!esPublicar) {
      cargarBanners();
    }
  }, [location.pathname]);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoImagen(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nuevoTitulo.trim() || !archivoImagen) {
      Swal.fire(
        "Atención",
        "Por favor completa el título y selecciona una imagen.",
        "warning"
      );
      return;
    }

    try {
      setPublicando(true);
      const formData = new FormData();
      formData.append("Titulo", nuevoTitulo);
      formData.append("Archivo", archivoImagen); // Corregido: sin la '/' al final
      formData.append("Orden", 0);

      await agregarImagen(formData);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Banner publicado correctamente",
        showConfirmButton: false,
        timer: 2000,
      });

      setNuevoTitulo("");
      setArchivoImagen(null);
      setImagenPreview(null);

      navigate("/gestion-novedades/activos");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al publicar",
        text: err.message || "No se pudo guardar la imagen en el servidor.",
      });
    } finally {
      setPublicando(false);
    }
  };

  const handleToggleEstado = async (id) => {
    const banner = novedades.find((item) => (item.idImagen || item.id) === id);
    if (!banner) return;

    try {
      const targetId = banner.idImagen || banner.id;
      const nuevoEstado = !(banner.estado ?? banner.activo);

      // Mapeo alineado a ImagenActualizarDto de C#
      const payloadActualizar = {
        titulo: banner.titulo,
        descripcion: banner.descripcion || "",
        rutaImagen: banner.rutaImagen,
        orden: banner.orden || 0,
        estado: nuevoEstado,
      };

      await actualizarImagen(targetId, payloadActualizar);

      setNovedades((prev) =>
        prev.map((item) => {
          const idActual = item.idImagen || item.id;
          return idActual === targetId
            ? { ...item, estado: nuevoEstado, activo: nuevoEstado }
            : item;
        })
      );

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: `Banner ${nuevoEstado ? "activado" : "desactivado"}`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error de estado",
        text: err.message || "No se pudo cambiar el estado del banner.",
      });
    }
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar o desactivar banner?",
      text: "El banner dejará de mostrarse en la sección de novedades.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await desactivarImagen(id);

        setNovedades((prev) =>
          prev.filter((item) => (item.idImagen || item.id) !== id)
        );

        Swal.fire(
          "Eliminado",
          "El banner ha sido removido con éxito.",
          "success"
        );
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error al eliminar",
          text: err.message || "No se pudo eliminar el registro.",
        });
      }
    }
  };

  return (
    <AppLayout>
      <div className="container-fluid px-4 my-4">
        <div className="d-flex align-items-center mb-4">
          <i className="bi bi-megaphone-fill fs-3 text-primary me-2"></i>
          <h4 className="m-0 text-secondary fw-bold">
            Gestión de Novedades e Intranet
          </h4>
        </div>

        <div className="w-100">
          {esPublicar ? (
            <PublicarBanner
              nuevoTitulo={nuevoTitulo}
              setNuevoTitulo={setNuevoTitulo}
              imagenPreview={imagenPreview}
              onImagenChange={handleImagenChange}
              onSubmit={handleSubmit}
              publicando={publicando}
              onCancelar={() => navigate("/gestion-novedades/activos")}
            />
          ) : loading ? (
            <div className="text-center my-5 py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando novedades...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger my-3" role="alert">
              {error}
            </div>
          ) : (
            <BannersActivos
              novedades={novedades}
              onNuevoBannerClick={() => navigate("/gestion-novedades/publicar")}
              onToggleEstado={handleToggleEstado}
              onEliminar={handleEliminar}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default GestionNovedades;