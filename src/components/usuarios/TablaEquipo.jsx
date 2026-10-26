import PersonaCelda from "../ui/PersonaCelda";
import { useState } from "react";
import HistorialVacacionesPanel from "../vacaciones/HistorialVacacionesPanel";

export default function TablaEquipo({ empleados = [], mostrarHistorial = false }) {
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const filtrados = empleados.filter(e => `${e.nombre} ${e.apellido} ${e.cargo || ""}`.toLowerCase().includes(busqueda.toLowerCase()));
  return <>
    <label className="form-label" htmlFor="buscar-equipo">Buscar empleado</label>
    <input id="buscar-equipo" className="form-control mb-3" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre, apellido o cargo" />
    <div className="table-responsive"><table className="table table-hover align-middle">
      <thead><tr><th>Empleado</th><th>Cargo / Área</th><th>Estado</th>{mostrarHistorial && <th>Vacaciones</th>}</tr></thead>
      <tbody>{filtrados.map(e => <tr key={e.idUsuario}>
        <td><PersonaCelda nombre={e.nombre} apellido={e.apellido} /></td>
        <td>{e.cargo || "—"}<small className="d-block text-muted">{e.area}</small></td>
        <td><span className={`badge ${e.estado ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}>{e.estado ? "Activo" : "Inactivo"}</span></td>
        {mostrarHistorial && <td><button className="btn btn-sm btn-outline-primary" onClick={() => setSeleccionado({ ...e, nombre: `${e.nombre} ${e.apellido}` })}>Ver historial</button></td>}
      </tr>)}</tbody>
    </table></div>
    {!filtrados.length && <p className="text-muted text-center py-3">No hay empleados para mostrar.</p>}
    {seleccionado && <HistorialVacacionesPanel usuario={seleccionado} onClose={() => setSeleccionado(null)} mostrarDocumentos={false} />}
  </>;
}
