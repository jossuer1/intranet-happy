import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import BannersActivos from "../components/novedades/BannersActivos";
import PublicarBanner from "../components/novedades/PublicarBanner";

import valoresImg from "../assets/images/valores_happy.png";
import cumpleImg from "../assets/images/cumpleaños_agosto.png";
import capImg from "../assets/images/capacitacion.png";

function GestionNovedades() {
  const location = useLocation();
  const navigate = useNavigate();

  // Detecta si la ruta actual es la de publicar
  const esPublicar = location.pathname.endsWith("/publicar");

  const [novedades, setNovedades] = useState([
    {
      id: 1,
      titulo: "Valores de Happy Pay",
      imagenUrl: valoresImg,
      fecha: "2026-08-01",
      activo: true,
    },
    {
      id: 2,
      titulo: "Cumpleaños del Mes",
      imagenUrl: cumpleImg,
      fecha: "2026-08-05",
      activo: true,
    },
    {
      id: 3,
      titulo: "Capacitaciones del Mes",
      imagenUrl: capImg,
      fecha: "2026-08-10",
      activo: false,
    },
  ]);

  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [imagenPreview, setImagenPreview] = useState(null);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setImagenPreview(tempUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nuevoTitulo || !imagenPreview) return;

    const nuevaNovedad = {
      id: Date.now(),
      titulo: nuevoTitulo,
      imagenUrl: imagenPreview,
      fecha: new Date().toISOString().split("T")[0],
      activo: true,
    };

    setNovedades([nuevaNovedad, ...novedades]);
    setNuevoTitulo("");
    setImagenPreview(null);

    // Redirige a la vista de activos después de publicar
    navigate("/gestion-novedades/activos");
  };

  const handleToggleEstado = (id) => {
    setNovedades(
      novedades.map((item) =>
        item.id === id ? { ...item, activo: !item.activo } : item,
      ),
    );
  };

  const handleEliminar = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este banner?")) {
      setNovedades(novedades.filter((item) => item.id !== id));
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
              onCancelar={() => navigate("/gestion-novedades/activos")}
            />
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
