import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import AppLayout from "../components/layout/AppLayout";
import HistorialVacacionesPanel from "../components/vacaciones/HistorialVacacionesPanel";
import {
  getResumenVacaciones,
  registrarDescuentoVacaciones,
  registrarAjusteVacaciones,
} from "../services/vacacionesService";

function GestionVacaciones() {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        "info"
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
        "warning"
      );
      return;
    }

    if (!motivo.trim()) {
      Swal.fire(
        "Atención",
        "El motivo / observación es obligatorio.",
        "warning"
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

  // Filtrado global sobre nombre y departamento
  const filteredItems = personal.filter((item) => {
    const busqueda = filterText.toLowerCase();
    const nombre = item.nombre ? item.nombre.toLowerCase() : "";
    const depto = item.departamento ? item.departamento.toLowerCase() : "";
    return nombre.includes(busqueda) || depto.includes(busqueda);
  });

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
          {!loading && !error && (
            <input
              type="search"
              className="form-control form-control-sm rounded-3"
              style={{ maxWidth: "260px" }}
              placeholder="Buscar colaborador..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          )}
        </div>

        {loading ? (
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