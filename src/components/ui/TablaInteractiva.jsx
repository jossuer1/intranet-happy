import { useId, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { estilosTabla, normalizar } from "../catalogos/tablaEstilos";

export default function TablaInteractiva({ datos = [], columnas, buscarEn, etiqueta = "Buscar registros", keyField = "id", conBuscador = true, cargando = false, filtros, accionesFiltros }) {
  const id = useId();
  const [busqueda, setBusqueda] = useState("");
  const [reinicio, setReinicio] = useState(false);
  const filtrados = useMemo(() => {
    const termino = normalizar(busqueda);
    return termino ? datos.filter(fila => normalizar(buscarEn ? buscarEn(fila) : Object.values(fila).join(" ")).includes(termino)) : datos;
  }, [datos, busqueda, buscarEn]);
  return <div className="hp-datatable">
    {conBuscador && <div className="hp-filtros d-flex align-items-center gap-2 pt-0">
      {filtros}
      <div className="input-group input-group-sm hp-tabla-buscador">
        <label htmlFor={id} className="input-group-text bg-white"><i className="bi bi-search" aria-hidden="true" /><span className="visually-hidden">{etiqueta}</span></label>
        <input id={id} type="search" className="form-control" placeholder={etiqueta} value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setReinicio(v => !v); }} />
      </div>
      {accionesFiltros}
      <span className="text-muted small ms-auto text-nowrap" aria-live="polite">{filtrados.length} {filtrados.length === 1 ? "registro" : "registros"}</span>
    </div>}
    <DataTable columns={columnas} data={filtrados} keyField={keyField} customStyles={estilosTabla}
      pagination paginationPerPage={10} paginationRowsPerPageOptions={[10, 25, 50]}
      paginationResetDefaultPage={reinicio}
      paginationComponentOptions={{ rowsPerPageText: "Filas por página:", rangeSeparatorText: "de", selectAllRowsItem: false }}
      highlightOnHover responsive persistTableHead progressPending={cargando}
      progressComponent={<p className="text-muted p-4" role="status">Cargando registros…</p>}
      noDataComponent={<p className="text-muted text-center p-4 mb-0">No hay registros que coincidan con la búsqueda.</p>} />
  </div>;
}
