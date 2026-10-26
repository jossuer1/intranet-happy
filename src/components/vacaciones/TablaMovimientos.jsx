import { formatearFecha } from "../../utils/dateUtils";
import ModalDialog from "../ui/ModalDialog";
import { useState } from "react";
import TablaInteractiva from "../ui/TablaInteractiva";

function badgeTipoMovimiento(tipo) {
  return tipo === "Descuento" ? "bg-danger" : "bg-success";
}

export function TablaMovimientos({ movimientos, loadingHistorial }) {
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const [tipo, setTipo] = useState("");
  const filtrados = (movimientos || []).filter(m => !tipo || m.tipoMovimiento === tipo);

  const columnas = [
    { name: "Tipo", selector: m => m.tipoMovimiento || "", sortable: true,
      cell: m => <span className={`badge ${badgeTipoMovimiento(m.tipoMovimiento)}`}>{m.tipoMovimiento}</span> },
    { name: "Desde", selector: m => m.fechaInicio || "", sortable: true, cell: m => m.fechaInicio ? formatearFecha(m.fechaInicio) : "—" },
    { name: "Hasta", selector: m => m.fechaFin || "", sortable: true, cell: m => m.fechaFin ? formatearFecha(m.fechaFin) : "—" },
    { name: "Días", selector: m => m.diasTomados, sortable: true, width: "85px" },
    { name: "Observación", selector: m => m.observacion || "—", sortable: true, wrap: true, grow: 2 },
    { name: "Registrado por", selector: m => m.registradoPorNombre || "Sistema", sortable: true, wrap: true },
    { name: "Detalle", button: true, cell: m => <button type="button" className="btn btn-sm btn-outline-secondary rounded-circle"
      onClick={() => setMovimientoSeleccionado(m)} title="Ver detalle del movimiento" aria-label="Ver detalle del movimiento"><i className="bi bi-eye" /></button> },
  ];
  return (
    <>
      <TablaInteractiva key={tipo} datos={filtrados} columnas={columnas} keyField="idVacacion" cargando={loadingHistorial}
        filtros={<select className="form-select form-select-sm hp-filtro-tabla" aria-label="Filtrar movimientos por tipo" value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="Ajuste">Ajustes</option>
          <option value="Descuento">Descuentos</option>
        </select>}
        etiqueta="Buscar movimiento por tipo, fecha, observación o responsable…"
        buscarEn={m => `${m.tipoMovimiento || ""} ${m.fechaInicio ? formatearFecha(m.fechaInicio) : ""} ${m.fechaFin ? formatearFecha(m.fechaFin) : ""} ${m.diasTomados} ${m.observacion || ""} ${m.registradoPorNombre || "Sistema"}`} />

      {/* MODAL DETALLE DE MOVIMIENTO (OJITO) */}
      {movimientoSeleccionado && (
          <ModalDialog titulo={"Detalle del movimiento"} onClose={() => setMovimientoSeleccionado(null)} bodyClassName="p-0">
<div className="modal-body py-3">
                <div className="mb-3 d-flex align-items-center gap-2">
                  <span className="fw-semibold">Tipo de Movimiento:</span>
                  <span
                    className={`badge ${badgeTipoMovimiento(movimientoSeleccionado.tipoMovimiento)}`}
                  >
                    {movimientoSeleccionado.tipoMovimiento}
                  </span>
                </div>

                <div className="row g-2 mb-3 bg-light p-2 rounded">
                  <div className="col-6">
                    <small className="text-muted d-block">Fecha Inicio</small>
                    <span className="fw-semibold">
                      {movimientoSeleccionado.fechaInicio
                        ? formatearFecha(movimientoSeleccionado.fechaInicio)
                        : "—"}
                    </span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Fecha Fin</small>
                    <span className="fw-semibold">
                      {movimientoSeleccionado.fechaFin
                        ? formatearFecha(movimientoSeleccionado.fechaFin)
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">Días afectación</small>
                  <span className="fs-5 fw-bold text-brand">
                    {movimientoSeleccionado.diasTomados} día(s)
                  </span>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block">
                    Observación / Motivo
                  </small>
                  <p className="bg-light p-2 rounded small text-dark mb-0 border">
                    {movimientoSeleccionado.observacion ||
                      "Sin observación registrada."}
                  </p>
                </div>

                <div>
                  <small className="text-muted d-block">Registrado por</small>
                  <span className="fw-semibold text-secondary">
                    {movimientoSeleccionado.registradoPorNombre || "Sistema"}
                  </span>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setMovimientoSeleccionado(null)}
                >
                  Cerrar
                </button>
              </div>
          </ModalDialog>
        )}
    </>
  );
}

export default TablaMovimientos;
