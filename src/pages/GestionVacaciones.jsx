import SectionHeader from "../components/layout/SectionHeader";
import { formatearFecha } from "../utils/dateUtils";
import ModalDialog from "../components/ui/ModalDialog";
import TablaInteractiva from "../components/ui/TablaInteractiva";
import PersonaCelda from "../components/ui/PersonaCelda";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AppLayout from "../components/layout/AppLayout";
import HistorialVacacionesPanel from "../components/vacaciones/HistorialVacacionesPanel";
import DescargarDocumentos from "../components/vacaciones/DescargarDocumentos";
import { BadgeEstadoSolicitud } from "../components/vacaciones/TablaSolicitudes";
import {
  getResumenVacaciones,
  registrarDescuentoVacaciones,
  registrarAjusteVacaciones,
  getTodasSolicitudes,
} from "../services/vacacionesService";

function GestionVacaciones() {
  const [tab, setTab] = useState("saldos");
  const resumen = useQuery({ queryKey: ["vacaciones", "resumen"], queryFn: getResumenVacaciones,
    select: datos => Array.isArray(datos) ? datos : [] });
  const personal = (resumen.data || []).filter(persona => persona.tieneVacaciones === true);
  const loading = resumen.isPending;
  const error = resumen.error?.message;
  const consultaSolicitudes = useQuery({ queryKey: ["vacaciones", "todas-solicitudes"], queryFn: getTodasSolicitudes,
    enabled: tab === "solicitudes", select: datos => Array.isArray(datos) ? datos : [] });
  const solicitudes = consultaSolicitudes.data || [];
  const loadingSolicitudes = consultaSolicitudes.isPending;

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarioHistorial, setUsuarioHistorial] = useState(null);
  const [tipoOperacion, setTipoOperacion] = useState("DESCUENTO");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [diasAcreditar, setDiasAcreditar] = useState("");
  const [motivo, setMotivo] = useState("");
  const [procesando, setProcesando] = useState(false);

  // Estado para la búsqueda global
  const [filterArea, setFilterArea] = useState("");

  const cargarDatos = () => resumen.refetch();

  const calcularDiasRango = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = fin - inicio;
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const abrirModal = (usuario) => {
    if (usuario.tieneVacaciones === false) {
      Swal.fire(
        "Sin beneficio de vacaciones",
        "Este colaborador no tiene habilitado el beneficio de vacaciones. Actívalo primero desde Gestión de Usuarios.",
        "info",
      );
      return;
    }
    setUsuarioSeleccionado(usuario);
    setTipoOperacion("DESCUENTO");
    setFechaInicio("");
    setFechaFin("");
    setDiasAcreditar("");
    setMotivo("");
  };

  const guardarRegistro = async () => {
    const idUsuario =
      usuarioSeleccionado.idUsuario ||
      usuarioSeleccionado.idEmpleado ||
      usuarioSeleccionado.id;
    const diasAfectados =
      tipoOperacion === "DESCUENTO"
        ? calcularDiasRango()
        : Number(diasAcreditar);

    if (!Number.isInteger(diasAfectados) || diasAfectados <= 0 || (tipoOperacion !== "DESCUENTO" && diasAfectados > 365)) {
      Swal.fire(
        "Atención",
        "Por favor ingresa un rango o número de días válido.",
        "warning",
      );
      return;
    }

    if (motivo.trim().length < 3 || motivo.trim().length > 200) {
      Swal.fire(
        "Atención",
        "El motivo debe contener entre 3 y 200 caracteres.",
        "warning",
      );
      return;
    }

    try {
      setProcesando(true);

      if (tipoOperacion === "DESCUENTO") {
        await registrarDescuentoVacaciones({
          idUsuario: Number(idUsuario),
          fechaInicio,
          fechaFin,
          motivo,
        });
      } else {
        await registrarAjusteVacaciones({
          idUsuario: Number(idUsuario),
          dias: diasAfectados,
          motivo,
        });
      }

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title:
          tipoOperacion === "DESCUENTO"
            ? "Período registrado con éxito"
            : "Días acreditados con éxito",
        showConfirmButton: false,
        timer: 2000,
      });

      setUsuarioSeleccionado(null);
      cargarDatos();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al procesar",
        text:
          err.message || "No se pudo completar la operación en el servidor.",
      });
    } finally {
      setProcesando(false);
    }
  };

  // Áreas disponibles para el filtro (salen de los datos cargados)
  const areas = [
    ...new Set(personal.map((p) => p.departamento).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));

  const filteredItems = personal.filter(item => !filterArea || item.departamento === filterArea);

  const hayFiltros = !!filterArea;
  const limpiarFiltros = () => {
    setFilterArea("");
  };

  // Configuración de columnas para React Data Table Component
  const columns = [
    {
      name: "Colaborador",
      selector: (row) => row.nombre,
      sortable: true,
      cell: (row) => (
        <PersonaCelda nombre={row.nombre} />
      ),
    },
    {
      name: "Área",
      selector: (row) => row.departamento || "",
      sortable: true,
      cell: (row) => (
        <span className="badge bg-light text-dark border fw-normal">
          {row.departamento || "—"}
        </span>
      ),
    },
    {
      name: "Fecha Ingreso",
      selector: (row) => row.fechaIngreso || "",
      sortable: true,
      cell: (row) => (
        <small className="text-muted">
          {row.fechaIngreso ? String(row.fechaIngreso).split("T")[0] : "—"}
        </small>
      ),
    },
    {
      name: "Días Totales",
      selector: (row) => row.diasGanados,
      sortable: true,
      center: true,
      cell: (row) =>
        row.tieneVacaciones === false ? null : (
          <span className="text-success fw-semibold">
            +{row.diasGanados} días
          </span>
        ),
    },
    {
      name: "Días Tomados",
      selector: (row) => row.diasTomados,
      sortable: true,
      center: true,
      cell: (row) =>
        row.tieneVacaciones === false ? null : (
          <span className="text-danger fw-semibold">
            -{row.diasTomados} días
          </span>
        ),
    },
    {
      name: "Saldo Disponible",
      selector: (row) => row.saldoDisponible,
      sortable: true,
      center: true,
      cell: (row) =>
        row.tieneVacaciones === false ? (
          <span className="badge bg-secondary-subtle text-secondary border">
            Sin beneficio de vacaciones
          </span>
        ) : (
          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 fw-bold">
            {row.saldoDisponible} días libres
          </span>
        ),
    },
    {
      name: "Acción",
      right: true,
      cell: (row) => {
        const sinBeneficio = row.tieneVacaciones === false;
        return (
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-3 px-3"
              onClick={() => setUsuarioHistorial(row)}
            >
              <i className="bi bi-clock-history me-1"></i>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-3 px-3"
              disabled={sinBeneficio}
              onClick={() => abrirModal(row)}
            >
              <i className="bi bi-pencil-square me-1"></i>
            </button>
          </div>
        );
      },
    },
  ];

  // Opciones de localización en español para la tabla

  const columnasSolicitudes = [
    { name: "Colaborador", selector: s => s.solicitanteNombre, sortable: true, minWidth: "240px", cell: s => <PersonaCelda nombre={s.solicitanteNombre} /> },
    { name: "Período", selector: s => s.fechaInicio, sortable: true, minWidth: "160px", cell: s => <div>{formatearFecha(s.fechaInicio)}<small className="text-muted d-block">hasta {formatearFecha(s.fechaFin)}</small></div> },
    { name: "Días", selector: s => s.diasSolicitados, sortable: true, width: "90px" },
    { name: "Motivo", selector: s => s.motivo, sortable: true, minWidth: "190px", wrap: true },
    { name: "Estado", selector: s => s.estado, sortable: true, minWidth: "175px", cell: s => <BadgeEstadoSolicitud estado={s.estado} /> },
    { name: "Jefe", selector: s => s.jefeAprobadorNombre || "Sin asignar", sortable: true, minWidth: "170px", wrap: true },
    { name: "Documentos", width: "150px", cell: s => s.estado === "APROBADA" ? <DescargarDocumentos idSolicitud={s.idSolicitud} /> : <span className="text-muted">—</span>, ignoreRowClick: true },
  ];

  return (
    <AppLayout usuarioRol="RRHH">
      <SectionHeader titulo="Gestión de Vacaciones" subtitulo="Saldos y solicitudes" />
      <div className="container-fluid mb-4 px-4"><div className="card border-0 shadow-sm rounded-3"><div className="card-body p-4">

        <ul className="nav nav-pills mb-4 gap-2">
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${tab === "saldos" ? "active bg-brand" : "text-dark bg-white border"}`}
              onClick={() => setTab("saldos")}
            >
              Saldos y Movimientos
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${tab === "solicitudes" ? "active bg-brand" : "text-dark bg-white border"}`}
              onClick={() => setTab("solicitudes")}
            >
              Solicitudes
            </button>
          </li>
        </ul>

        {tab === "solicitudes" && consultaSolicitudes.isError && <div className="alert alert-danger" role="alert">{consultaSolicitudes.error.message}</div>}
        {tab === "solicitudes" ? (
          <TablaInteractiva datos={solicitudes} columnas={columnasSolicitudes} keyField="idSolicitud" cargando={loadingSolicitudes}
            etiqueta="Buscar empleado, motivo, estado o jefe…"
            buscarEn={s => `${s.solicitanteNombre} ${s.motivo} ${s.estado.replaceAll("_", " ")} ${s.jefeAprobadorNombre || ""} ${formatearFecha(s.fechaInicio)} ${formatearFecha(s.fechaFin)}`} />
        ) : loading ? (
          <div className="text-center my-5 py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando personal...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger my-3" role="alert">
            {error}
          </div>
        ) : (
          <TablaInteractiva key={filterArea} datos={filteredItems} columnas={columns} keyField="idUsuario"
            filtros={<>
              <select aria-label="Filtrar por área" className="form-select form-select-sm hp-filtro-tabla" value={filterArea} onChange={e => setFilterArea(e.target.value)}>
                <option value="">Todas las áreas</option>{areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </>}
            accionesFiltros={hayFiltros && <button type="button" className="btn btn-sm btn-outline-secondary" onClick={limpiarFiltros}>Limpiar</button>}
            etiqueta="Buscar colaborador, área o fecha…" buscarEn={p => `${p.nombre} ${p.departamento || ""} ${formatearFecha(p.fechaIngreso) || ""}`} />
        )}

        {usuarioHistorial && (
          <HistorialVacacionesPanel
            usuario={usuarioHistorial}
            onClose={() => setUsuarioHistorial(null)}
          />
        )}

        {usuarioSeleccionado && (
          <ModalDialog titulo={`Gestionar vacaciones: ${usuarioSeleccionado.nombre}`} onClose={() => setUsuarioSeleccionado(null)} ocupado={procesando} bodyClassName="p-0">
<div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">
                      ¿Qué acción deseas realizar?
                    </label>
                    <select
                      className="form-select"
                      value={tipoOperacion}
                      onChange={(e) => setTipoOperacion(e.target.value)}
                    >
                      <option value="DESCUENTO">
                        Registrar Período de Vacaciones (Seleccionar Fechas)
                      </option>
                      <option value="ACREDITACION">
                        Acreditar / Sumar Días al Saldo (Por antigüedad/Ajuste)
                      </option>
                    </select>
                  </div>

                  {tipoOperacion === "DESCUENTO" ? (
                    <>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label text-muted small fw-semibold">
                            Desde
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label text-muted small fw-semibold">
                            Hasta
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="bg-light p-3 rounded-3 border mb-3 text-center">
                        <small className="text-muted d-block mb-1">
                          Días a descontar calculados:
                        </small>
                        <span className="fs-5 fw-bold text-danger">
                          {calcularDiasRango()} días
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-semibold">
                        Días a Sumar
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Ej. 15"
                        value={diasAcreditar}
                        min="1"
                        max="365"
                        step="1"
                        onChange={(e) => setDiasAcreditar(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="form-label text-muted small fw-semibold">
                      Motivo / Observación
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder={
                        tipoOperacion === "DESCUENTO"
                          ? "Ej. Vacaciones tomadas período agosto"
                          : "Ej. Incremento de días por cumplimiento de año laboral"
                      }
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top bg-light-subtle">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-3"
                    disabled={procesando}
                    onClick={() => setUsuarioSeleccionado(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm rounded-3 px-3 ${
                      tipoOperacion === "DESCUENTO"
                        ? "btn-danger"
                        : "btn-success"
                    }`}
                    disabled={procesando}
                    onClick={guardarRegistro}
                  >
                    {procesando
                      ? "Guardando..."
                      : tipoOperacion === "DESCUENTO"
                        ? "Registrar Período Vacacional"
                        : "Acreditar Días"}
                  </button>
                </div>
          </ModalDialog>
        )}
      </div></div></div>
    </AppLayout>
  );
}

export default GestionVacaciones;
