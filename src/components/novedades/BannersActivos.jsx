import { useState } from "react";
import TablaInteractiva from "../ui/TablaInteractiva";
import ModalDialog from "../ui/ModalDialog";
import { formatearFechaHoraEC } from "../../utils/fechasEcuador";

export default function BannersActivos({ novedades = [], onNuevoBannerClick, onToggleEstado, onEliminar }) {
  const [vista, setVista] = useState(null);
  const [estado, setEstado] = useState("todos");
  const datos = novedades.filter(n => estado === "todos" || (estado === "activos" ? n.estado : !n.estado));
  const columnas = [
    { name: "Banner", selector: n => n.titulo, sortable: true, minWidth: "280px", grow: 2,
      cell: n => <div className="d-flex align-items-center gap-3"><button type="button" className="hp-banner-miniatura" aria-label={`Ver banner: ${n.titulo}`} onClick={() => setVista(n)}>
        <img src={n.rutaImagen} alt="" loading="lazy" /></button><div><strong className="d-block">{n.titulo}</strong><small className="text-muted text-break">{n.descripcion || "Sin descripción"}</small></div></div> },
    { name: "Fecha de publicación", selector: n => n.fechaCreacion || "", sortable: true, minWidth: "190px", cell: n => formatearFechaHoraEC(n.fechaCreacion) || "Sin fecha" },
    { name: "Orden", selector: n => n.orden ?? 0, sortable: true, width: "100px" },
    { name: "Estado", selector: n => n.estado ? "Activo" : "Inactivo", sortable: true, width: "120px", cell: n => <span className={`badge ${n.estado ? "bg-success" : "bg-secondary"}`}>{n.estado ? "Activo" : "Inactivo"}</span> },
    { name: "Acciones", width: "160px", cell: n => <div className="d-flex gap-2">
      <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setVista(n)} title="Ver banner"><i className="bi bi-eye" /></button>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onToggleEstado(n.idImagen)} title={n.estado ? "Ocultar banner" : "Mostrar banner"}><i className={`bi ${n.estado ? "bi-eye-slash" : "bi-check-circle"}`} /></button>
      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(n.idImagen)} title="Eliminar banner"><i className="bi bi-trash3" /></button>
    </div>, ignoreRowClick: true },
  ];
  return <div className="card border-0 shadow-sm rounded-3"><div className="card-body p-4">
    <div className="hp-card-header"><div><h5 className="fw-bold mb-1">Banners activos y registrados</h5><p className="text-muted small mb-0">Administra las publicaciones de la intranet.</p></div>
      <button type="button" className="btn btn-primary btn-sm" onClick={onNuevoBannerClick}><i className="bi bi-plus-lg me-2" />Nuevo banner</button></div>
    <TablaInteractiva key={estado} datos={datos} columnas={columnas} keyField="idImagen" etiqueta="Buscar por título, descripción o estado…"
      filtros={<select aria-label="Estado de publicación" className="form-select form-select-sm hp-filtro-tabla" value={estado} onChange={e => setEstado(e.target.value)}><option value="todos">Todos los estados</option><option value="activos">Activos</option><option value="inactivos">Inactivos</option></select>}
      buscarEn={n => `${n.titulo} ${n.descripcion || ""} ${n.estado ? "Activo" : "Inactivo"} ${formatearFechaHoraEC(n.fechaCreacion) || ""}`} />
    {vista && <ModalDialog titulo={vista.titulo} subtitulo={vista.descripcion} onClose={() => setVista(null)} size="xl"><img src={vista.rutaImagen} alt={vista.titulo} className="img-fluid rounded-3 w-100" /></ModalDialog>}
  </div></div>;
}
