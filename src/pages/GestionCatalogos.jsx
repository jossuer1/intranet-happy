import { useLocation } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import SectionHeader from "../components/layout/SectionHeader";
import CatalogoCrud from "../components/catalogos/CatalogoCrud";
import AsignarRoles from "../components/catalogos/AsignarRoles";
import { CATALOGOS } from "../components/catalogos/catalogosConfig";
import {
  SECCION_ROLES,
  seccionDesdeUrl,
} from "../components/catalogos/seccionesAdmin";

// La sección que se muestra la elige el menú lateral (AppLayout) mediante la
// URL: /gestion-catalogos?seccion=ciudades. Aquí solo se dibuja esa sección.
function GestionCatalogos() {
  const { search } = useLocation();
  const seccion = seccionDesdeUrl(search);

  return (
    <AppLayout>
      <SectionHeader
        titulo="Administración"
        subtitulo="Catálogos base del sistema y roles de los usuarios"
        mostrarVolver={false}
      />

      <div className="container-fluid px-4 pt-1">
        {seccion === SECCION_ROLES.key ? (
          <AsignarRoles />
        ) : (
          // key={seccion}: al cambiar de sección se reinician filtros y buscador
          <CatalogoCrud key={seccion} config={CATALOGOS[seccion]} />
        )}
      </div>
    </AppLayout>
  );
}

export default GestionCatalogos;
