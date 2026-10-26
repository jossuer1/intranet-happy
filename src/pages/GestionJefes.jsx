import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AppLayout from "../components/layout/AppLayout";
import SectionHeader from "../components/layout/SectionHeader";
import TablaEquipo from "../components/usuarios/TablaEquipo";
import { getJefes, getEquipoJefe, traspasarEquipo } from "../services/usuariosService";

export default function GestionJefes() {
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
      await Swal.fire({ icon: "success", title: "Equipo trasladado", text: `${resultado.empleadosTrasladados} empleados y ${resultado.solicitudesPendientesTrasladadas} solicitudes pendientes actualizados.` });
    } catch (error) {
      await Swal.fire({ icon: "error", title: "No se pudo reemplazar al jefe", text: error.message });
    }
  };
  return <AppLayout><SectionHeader titulo="Jefes y equipos" volverA="/gestion-usuarios" />
    <div className="container-fluid px-4 my-3"><div className="row g-4">
      <div className="col-lg-4"><div className="card border-0 shadow-sm"><div className="card-body">
        <h5>Jefes</h5><p className="text-muted small">Selecciona un jefe para consultar su equipo.</p>
        {jefes.isPending ? <p role="status">Cargando jefes…</p> : jefes.isError ? <div className="alert alert-danger">{jefes.error.message}<button className="btn btn-link" onClick={() => jefes.refetch()}>Reintentar</button></div> : <div className="list-group">{lista.map(j => <button key={j.idUsuario} disabled={cambio.isPending} className={`list-group-item list-group-item-action ${String(j.idUsuario) === origen ? "active" : ""}`} onClick={() => { setOrigen(String(j.idUsuario)); setDestino(""); }}>
          <strong>{j.nombre} {j.apellido}</strong><small className="d-block">{j.cargo || "Sin cargo"} · {j.cantidadEmpleados} empleados{!j.estado && " · Inactivo"}</small>
        </button>)}{!lista.length && <p>No hay jefes registrados.</p>}</div>}
      </div></div></div>
      <div className="col-lg-8"><div className="card border-0 shadow-sm"><div className="card-body">
        {!jefe ? <p className="text-muted py-4">Selecciona un jefe de la lista.</p> : <>
          <h5>Equipo de {jefe.nombre} {jefe.apellido}</h5>
          {equipo.isPending ? <p role="status">Cargando equipo…</p> : equipo.isError ? <div className="alert alert-danger">{equipo.error.message}<button className="btn btn-link" onClick={() => equipo.refetch()}>Reintentar</button></div> : <TablaEquipo key={origen} empleados={equipo.data} />}
          <hr /><h6>Reemplazar jefe</h6><label htmlFor="nuevo-jefe" className="form-label">Nuevo jefe</label>
          <select id="nuevo-jefe" className="form-select mb-3" value={destino} disabled={cambio.isPending} onChange={e => setDestino(e.target.value)}><option value="">Selecciona un jefe activo</option>{lista.filter(j => j.estado && String(j.idUsuario) !== origen).map(j => <option key={j.idUsuario} value={j.idUsuario}>{j.nombre} {j.apellido}</option>)}</select>
          <p className="text-muted small">El jefe anterior conserva su condición de jefe. Las solicitudes ya resueltas mantienen su historial.</p>
          <button className="btn btn-primary" disabled={!reemplazo || cambio.isPending || equipo.isFetching || equipo.isError || !equipo.data?.length} onClick={reemplazar}>{cambio.isPending ? "Trasladando…" : "Reemplazar jefe"}</button>
        </>}
      </div></div></div>
    </div></div>
  </AppLayout>;
}
