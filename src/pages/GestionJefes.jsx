import ModalDialog from "../components/ui/ModalDialog";
import PersonaCelda from "../components/ui/PersonaCelda";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AppLayout from "../components/layout/AppLayout";
import SectionHeader from "../components/layout/SectionHeader";
import TablaEquipo from "../components/usuarios/TablaEquipo";
import { getJefes, getEquipoJefe, traspasarEquipo } from "../services/usuariosService";

export default function GestionJefes() {
  const [mostrarReemplazo, setMostrarReemplazo] = useState(false);
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const jefes = useQuery({ queryKey: ["usuarios", "jefes"], queryFn: getJefes });
  const equipo = useQuery({ queryKey: ["usuarios", "equipo", origen], queryFn: () => getEquipoJefe(origen), enabled: !!origen });
  const cambio = useMutation({ mutationFn: traspasarEquipo });
  const lista = jefes.data || [];
  const jefe = lista.find(j => String(j.idUsuario) === origen);
  const reemplazo = lista.find(j => String(j.idUsuario) === destino && j.estado && String(j.idUsuario) !== origen);
  const reemplazar = async () => {
    if (!jefe || !reemplazo) return;
    const confirmacion = await Swal.fire({ icon: "warning", title: "¿Reemplazar jefe?", text: `El equipo de ${jefe.nombre} ${jefe.apellido} (${equipo.data?.length || 0} personas) pasará a ${reemplazo.nombre} ${reemplazo.apellido}. Se trasladarán ${jefe.cantidadSolicitudesPendientes ?? 0} solicitudes pendientes. Si el reemplazo está en el equipo, heredará el superior del jefe anterior. Los conteos pueden cambiar si hay actividad simultánea.`, showCancelButton: true, confirmButtonText: "Sí, reemplazar", cancelButtonText: "Cancelar" });
    if (!confirmacion.isConfirmed) return;
    try {
      const resultado = await cambio.mutateAsync({ idJefeAnterior: Number(origen), idJefeNuevo: Number(destino) });
      setDestino("");
      setMostrarReemplazo(false);
      await Swal.fire({ icon: "success", title: "Equipo trasladado", text: `${resultado.empleadosTrasladados} empleados y ${resultado.solicitudesPendientesTrasladadas} solicitudes pendientes actualizados.` });
    } catch (error) {
      await Swal.fire({ icon: "error", title: "No se pudo reemplazar al jefe", text: error.message });
    }
  };
  return <AppLayout><SectionHeader titulo="Jefes y equipos" volverA="/gestion-usuarios" />
    <div className="container-fluid mb-4"><div className="card border-0 shadow-sm"><div className="card-body p-0">
      <div className="p-4 border-bottom"><h5 className="mb-1">Organización de equipos</h5><p className="text-muted small mb-0">Selecciona un jefe para consultar a sus colaboradores o reemplazarlo.</p></div>
      <div className="row g-0">
        <aside className="col-lg-4 hp-jefes-aside p-4">
          <h6 className="small text-uppercase text-muted mb-3">Jefes registrados · {lista.length}</h6>
          {jefes.isPending ? <p role="status">Cargando jefes…</p> : jefes.isError ? <div className="alert alert-danger">{jefes.error.message}<button className="btn btn-link" onClick={() => jefes.refetch()}>Reintentar</button></div> :
            <div className="list-group list-group-flush">{lista.map(j => <button key={j.idUsuario} disabled={cambio.isPending}
              aria-pressed={String(j.idUsuario) === origen} className={`list-group-item list-group-item-action rounded-3 border-0 mb-1 py-3 ${String(j.idUsuario) === origen ? "active" : ""}`}
              onClick={() => { setOrigen(String(j.idUsuario)); setDestino(""); }}>
              <PersonaCelda nombre={j.nombre} apellido={j.apellido} detalle={`${j.cargo || "Sin cargo"} · ${j.cantidadEmpleados} empleados${!j.estado ? " · Inactivo" : ""}`} />
            </button>)}{!lista.length && <p className="text-muted">No hay jefes registrados.</p>}</div>}
        </aside>
        <section className="col-lg-8 p-4">
          {!jefe ? <div className="text-center text-muted py-5"><i className="bi bi-diagram-3 fs-1 d-block mb-3" /><p>Selecciona un jefe para ver su equipo.</p></div> : <>
            <div className="hp-card-header"><div><h5 className="mb-1">Equipo de {jefe.nombre} {jefe.apellido}</h5><small className="text-muted">{equipo.data?.length ?? jefe.cantidadEmpleados} colaboradores asignados</small></div>
              <button className="btn btn-outline-primary btn-sm" onClick={() => setMostrarReemplazo(true)} disabled={equipo.isFetching || equipo.isError || !equipo.data?.length}>Reemplazar jefe</button>
            </div>
            {equipo.isPending ? <p role="status">Cargando equipo…</p> : equipo.isError ? <div className="alert alert-danger">{equipo.error.message}<button className="btn btn-link" onClick={() => equipo.refetch()}>Reintentar</button></div> : <TablaEquipo key={origen} empleados={equipo.data} />}
          </>}
        </section>
      </div>
    </div></div></div>
    {mostrarReemplazo && jefe && <ModalDialog titulo="Reemplazar jefe" subtitulo={`Equipo de ${jefe.nombre} ${jefe.apellido}`} onClose={() => setMostrarReemplazo(false)} ocupado={cambio.isPending}>
      <p className="text-muted">Se trasladarán {equipo.data?.length || 0} colaboradores y {jefe.cantidadSolicitudesPendientes || 0} solicitudes pendientes.</p>
      <label htmlFor="nuevo-jefe" className="form-label">Nuevo jefe</label>
      <select id="nuevo-jefe" className="form-select mb-3" value={destino} disabled={cambio.isPending} onChange={e => setDestino(e.target.value)}><option value="">Selecciona un jefe activo</option>{lista.filter(j => j.estado && String(j.idUsuario) !== origen).map(j => <option key={j.idUsuario} value={j.idUsuario}>{j.nombre} {j.apellido}</option>)}</select>
      <p className="text-muted small">El jefe anterior conserva su condición de jefe. Las solicitudes resueltas mantienen su historial.</p>
      <div className="d-flex justify-content-end gap-2"><button className="btn btn-outline-secondary" onClick={() => setMostrarReemplazo(false)} disabled={cambio.isPending}>Cancelar</button>
        <button className="btn btn-primary" disabled={!reemplazo || cambio.isPending} onClick={reemplazar}>{cambio.isPending ? "Trasladando…" : "Continuar"}</button></div>
    </ModalDialog>}
  </AppLayout>;
}
