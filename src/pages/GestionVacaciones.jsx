import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import AppLayout from "../components/layout/AppLayout";
import HistorialVacacionesPanel from "../components/vacaciones/HistorialVacacionesPanel";
import {
  getResumenVacaciones,
  registrarDescuentoVacaciones,
  registrarAjusteVacaciones,
  getSolicitudesPendientesRrhh,
  responderSolicitudComoRrhh,
  descargarConstanciaSolicitud,
} from "../services/vacacionesService";

function GestionVacaciones() {
  const [tab, setTab] = useState("saldos");
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [procesandoSolicitudId, setProcesandoSolicitudId] = useState(null);
  const [descargandoId, setDescargandoId] = useState(null);

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarioHistorial, setUsuarioHistorial] = useState(null);
  const [tipoOperacion, setTipoOperacion] = useState("DESCUENTO");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [diasAcreditar, setDiasAcreditar] = useState("");
  const [motivo, setMotivo] = useState("");
  const [procesando, setProcesando] = useState(false);

  // Estado para la búsqueda global
  const [filterText, setFilterText] = useState("");
  const [filterArea, setFilterArea] = useState("");
  // "" = todos | "con" = con vacaciones | "sin" = sin vacaciones
  const [filterVacaciones, setFilterVacaciones] = useState("");

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getResumenVacaciones();
      setPersonal(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error al cargar la información de vacaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarSolicitudesPendientes = async () => {
    try {
      setLoadingSolicitudes(true);
      const data = await getSolicitudesPendientesRrhh();
      setSolicitudesPendientes(Array.isArray(data) ? data : []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudieron cargar las solicitudes pendientes",
        text: err.message || "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  useEffect(() => {
    if (tab === "solicitudes") {
      cargarSolicitudesPendientes();
    }
  }, [tab]);

  const responderSolicitud = async (solicitud, aprobar) => {
    const confirmacion = await Swal.fire({
      icon: "question",
      title: aprobar
        ? "¿Dar el visto bueno final?"
        : "¿Rechazar esta solicitud?",
      html:
        `<b>${solicitud.solicitanteNombre}</b><br/>${new Date(
          solicitud.fechaInicio,
        ).toLocaleDateString()} — ${new Date(solicitud.fechaFin).toLocaleDateString()}<br/>` +
        (aprobar ? "Se descontarán los días del saldo del empleado." : ""),
      input: "text",
      inputLabel: "Observación (opcional)",
      showCancelButton: true,
      confirmButtonText: aprobar ? "Sí, aprobar" : "Sí, rechazar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmacion.isConfirmed) return;

    try {
      setProcesandoSolicitudId(solicitud.idSolicitud);
      await responderSolicitudComoRrhh(
        solicitud.idSolicitud,
        aprobar,
        confirmacion.value || null,
      );
      await cargarSolicitudesPendientes();
      cargarDatos();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: aprobar
          ? "Solicitud aprobada y días descontados"
          : "Solicitud rechazada",
        showConfirmButton: false,
        timer: 2200,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar la respuesta",
        text: err.message || "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setProcesandoSolicitudId(null);
    }
  };

  const descargarConstancia = async (idSolicitud) => {
    try {
      setDescargandoId(idSolicitud);
      const blob = await descargarConstanciaSolicitud(idSolicitud);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `constancia-vacaciones-${idSolicitud}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo descargar la constancia",
        text: err.message || "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setDescargandoId(null);
    }
  };

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

    if (diasAfectados <= 0) {
      Swal.fire(
        "Atención",
        "Por favor ingresa un rango o número de días válido.",
        "warning",
      );
      return;
    }

    if (!motivo.trim()) {
      Swal.fire(
        "Atención",
        "El motivo / observación es obligatorio.",
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

  // Filtros combinables: nombre, área y si tiene/no tiene vacaciones
  const filteredItems = personal.filter((item) => {
    const nombre = item.nombre ? item.nombre.toLowerCase() : "";
    const coincideNombre = nombre.includes(filterText.toLowerCase().trim());
    const coincideArea = !filterArea || item.departamento === filterArea;
    const sinBeneficio = item.tieneVacaciones === false;
    const coincideVacaciones =
      !filterVacaciones ||
      (filterVacaciones === "con" && !sinBeneficio) ||
      (filterVacaciones === "sin" && sinBeneficio);
    return coincideNombre && coincideArea && coincideVacaciones;
  });

  const hayFiltros = filterText || filterArea || filterVacaciones;
  const limpiarFiltros = () => {
    setFilterText("");
    setFilterArea("");
    setFilterVacaciones("");
  };

  // Configuración de columnas para React Data Table Component
  const columns = [
    {
      name: "Colaborador",
      selector: (row) => row.nombre,
      sortable: true,
      cell: (row) => (
        <span className="fw-semibold text-dark">{row.nombre}</span>
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
              className="btn btn-sm btn-outline-info rounded-3 px-3"
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
  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página:",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  return (
    <AppLayout usuarioRol="RRHH">
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
          <div>
            <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
              <i className="bi bi-calendar2-range text-primary"></i>
              Gestión de Vacaciones
            </h6>
            <small className="text-muted">
              Asignación de períodos vacacionales y acreditación de saldo por
              antigüedad
            </small>
          </div>
        </div>

        {!loading && !error && tab === "saldos" && (
          <div className="row g-2 mb-3 align-items-center">
            <div className="col-12 col-md-4">
              <input
                type="search"
                className="form-control form-control-sm rounded-3"
                placeholder="Buscar por nombre..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm rounded-3"
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
              >
                <option value="">Todas las áreas</option>
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm rounded-3"
                value={filterVacaciones}
                onChange={(e) => setFilterVacaciones(e.target.value)}
              >
                <option value="">Con y sin vacaciones</option>
                <option value="con">Con vacaciones</option>
                <option value="sin">Sin vacaciones</option>
              </select>
            </div>
            <div className="col-12 col-md-2">
              {hayFiltros && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-3 w-100"
                  onClick={limpiarFiltros}
                >
                  <i className="bi bi-x-circle me-1"></i>Limpiar
                </button>
              )}
            </div>
          </div>
        )}

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
              Solicitudes Pendientes
              {solicitudesPendientes.length > 0 && (
                <span className="badge bg-danger ms-2">
                  {solicitudesPendientes.length}
                </span>
              )}
            </button>
          </li>
        </ul>

        {tab === "solicitudes" ? (
          loadingSolicitudes ? (
            <div className="text-center my-5 py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando solicitudes...</span>
              </div>
            </div>
          ) : solicitudesPendientes.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-check2-circle fs-1 d-block mb-3"></i>
              No hay solicitudes esperando el visto bueno de RRHH.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Empleado</th>
                    <th>Desde</th>
                    <th>Hasta</th>
                    <th>Días</th>
                    <th>Motivo</th>
                    <th>Jefe aprobó</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesPendientes.map((s) => (
                    <tr key={s.idSolicitud}>
                      <td className="fw-semibold">{s.solicitanteNombre}</td>
                      <td>{new Date(s.fechaInicio).toLocaleDateString()}</td>
                      <td>{new Date(s.fechaFin).toLocaleDateString()}</td>
                      <td>{s.diasSolicitados}</td>
                      <td className="small text-muted">{s.motivo}</td>
                      <td className="small text-muted">
                        {s.jefeAprobadorNombre || "—"}
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success me-2"
                          disabled={procesandoSolicitudId === s.idSolicitud}
                          onClick={() => responderSolicitud(s, true)}
                        >
                          <i className="bi bi-check-lg"></i> Aprobar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger me-2"
                          disabled={procesandoSolicitudId === s.idSolicitud}
                          onClick={() => responderSolicitud(s, false)}
                        >
                          <i className="bi bi-x-lg"></i> Rechazar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          disabled={descargandoId === s.idSolicitud}
                          onClick={() => descargarConstancia(s.idSolicitud)}
                          title="Descargar constancia"
                        >
                          <i className="bi bi-file-earmark-pdf"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
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
          <DataTable
            columns={columns}
            data={filteredItems}
            pagination
            paginationPerPage={10}
            paginationComponentOptions={paginationComponentOptions}
            noDataComponent={
              <div className="text-center text-muted py-4">
                No se encontraron colaboradores.
              </div>
            }
            conditionalRowStyles={[
              {
                when: (row) => row.tieneVacaciones === false,
                style: {
                  opacity: 0.5,
                },
              },
            ]}
            highlightOnHover
            responsive
          />
        )}

        {usuarioHistorial && (
          <HistorialVacacionesPanel
            usuario={usuarioHistorial}
            onClose={() => setUsuarioHistorial(null)}
          />
        )}

        {usuarioSeleccionado && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow rounded-4">
                <div className="modal-header border-bottom">
                  <h6 className="modal-title fw-bold">
                    Gestionar Vacaciones: {usuarioSeleccionado.nombre}
                  </h6>
                  <button
                    type="button"
                    className="btn-close"
                    disabled={procesando}
                    onClick={() => setUsuarioSeleccionado(null)}
                  ></button>
                </div>
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
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default GestionVacaciones;
