import { useSearchParams } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import SectionHeader from "../components/layout/SectionHeader";
import CatalogoCrud from "../components/catalogos/CatalogoCrud";
import AsignarRoles from "../components/catalogos/AsignarRoles";
import { CATALOGOS } from "../components/catalogos/catalogosConfig";

// Orden de las pestañas. La última ("roles") no es un catálogo: es la
// asignación de roles a usuarios, y tiene su propio componente.
const TABS = [
  { key: "areas", titulo: "Áreas", icono: "bi-diagram-3" },
  { key: "cargos", titulo: "Cargos", icono: "bi-briefcase" },
  { key: "bancos", titulo: "Bancos", icono: "bi-bank" },
  { key: "provincias", titulo: "Provincias", icono: "bi-map" },
  { key: "ciudades", titulo: "Ciudades", icono: "bi-geo-alt" },
  { key: "etnias", titulo: "Etnias", icono: "bi-people" },
  { key: "estados-civiles", titulo: "Estados civiles", icono: "bi-heart" },
  { key: "generos", titulo: "Géneros", icono: "bi-gender-ambiguous" },
  { key: "tipos-sangre", titulo: "Tipos de sangre", icono: "bi-droplet" },
];

const TAB_ROLES = { key: "roles", titulo: "Roles de usuario", icono: "bi-person-gear" };

function GestionCatalogos() {
  // La pestaña activa vive en la URL (?seccion=ciudades): al refrescar la
  // página o compartir el enlace se queda en la misma sección.
  const [params, setParams] = useSearchParams();
  const pedida = params.get("seccion");
  const tab =
    pedida === TAB_ROLES.key || CATALOGOS[pedida] ? pedida : TABS[0].key;

  const irA = (key) => setParams({ seccion: key }, { replace: true });

  const pill = (t) => (
    <li className="nav-item" key={t.key}>
      <button
        type="button"
        className={`nav-link d-flex align-items-center gap-2 ${
          tab === t.key ? "active bg-brand" : "text-dark bg-white border"
        }`}
        onClick={() => irA(t.key)}
      >
        <i className={`bi ${t.icono}`}></i>
        {t.titulo}
      </button>
    </li>
  );

  return (
    <AppLayout>
      <SectionHeader
        titulo="Administración"
        subtitulo="Catálogos base del sistema y roles de los usuarios"
        mostrarVolver={false}
      />

      <div className="container-fluid px-4 pt-1 d-flex flex-column gap-3">

        <ul className="nav nav-pills flex-wrap gap-2 align-items-center">
          {TABS.map(pill)}
          <li className="vr mx-1 d-none d-md-block" aria-hidden="true"></li>
          {pill(TAB_ROLES)}
        </ul>

        <div>
          {tab === TAB_ROLES.key ? (
            <AsignarRoles />
          ) : (
            // key={tab}: al cambiar de pestaña se reinician filtros y buscador
            <CatalogoCrud key={tab} config={CATALOGOS[tab]} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default GestionCatalogos;
