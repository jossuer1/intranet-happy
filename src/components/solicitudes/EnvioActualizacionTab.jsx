import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import {
  getUsuarios,
  permisoActualizacion,
  habilitarActualizacion,
  enviarRecordatorioActualizacion,
} from "../../services/usuariosService";
import {
  pedirFechaLimite,
  pedirRecordatorio,
} from "../usuarios/modalHabilitarActualizacion";
import { estaActivo } from "../../utils/usuariosEstado";
import { formatearFechaEC } from "../../utils/fechasEcuador";
import { Toast, toastError, toastExito } from "../../utils/toast";

const customStyles = {
  headCells: {
    style: {
      textTransform: "uppercase",
      fontSize: "12px",
      fontWeight: 700,
      color: "var(--bs-secondary-color, #6c757d)",
      backgroundColor: "#f8f9fa",
    },
  },
  rows: { style: { minHeight: "56px" } },
};

const paginationComponentOptions = {
  rowsPerPageText: "Filas por página:",
  rangeSeparatorText: "de",
};

// Estado de la actualización de cada usuario, calculado desde los campos que
// ya trae GET /usuarios. Un solo valor por fila para poder filtrar y pintar.
//   pendiente | atrasado | sinResponder | noHabilitado
const estadoActualizacion = (u) => {
  if (u.tieneSolicitudPendiente) return "pendiente";
  if (u.puedeActualizarPerfil) return u.atrasado ? "atrasado" : "sinResponder";
  return "noHabilitado";
};

const FILTROS = [
  { clave: "todos", texto: "Todos" },
  { clave: "noHabilitado", texto: "Sin habilitar" },
  { clave: "sinResponder", texto: "Sin responder" },
  { clave: "atrasado", texto: "Atrasados" },
  { clave: "pendiente", texto: "Con solicitud" },
];

const nombreDe = (u) => u.nombres || u.nombre || "este usuario";

function BadgeActualizacion({ u }) {
  const est = estadoActualizacion(u);
  const hasta = formatearFechaEC(u.puedeActualizarHasta);

  if (est === "pendiente")
    return (
      <span className="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle">
        Solicitud pendiente
      </span>
    );
  if (est === "atrasado")
    return (
      <span className="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle">
        Atrasado{hasta ? ` · venció ${hasta}` : ""}
      </span>
    );
  if (est === "sinResponder")
    return (
      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
        Sin responder{hasta ? ` · hasta ${hasta}` : ""}
      </span>
    );
  return <span className="badge bg-light text-secondary border">No habilitado</span>;
}

export default function EnvioActualizacionTab() {
  const queryClient = useQueryClient();
  const [procesando, setProcesando] = useState(false);
  const [seleccionados, setSeleccionados] = useState(() => new Set());
  const [filtro, setFiltro] = useState("todos");
  const [filtroArea, setFiltroArea] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const usuarios = useQuery({ queryKey: ["usuarios"], queryFn: getUsuarios });
  // Solo cuentas activas: a un usuario inactivo no se le puede habilitar nada.
  const lista = useMemo(
    () => (Array.isArray(usuarios.data) ? usuarios.data : []).filter(estaActivo),
    [usuarios.data],
  );

  const refrescar = () =>
    queryClient.invalidateQueries({ queryKey: ["usuarios"] });

  const activos = lista;

  const conteo = useMemo(() => {
    const c = { todos: lista.length };
    lista.forEach((u) => {
      const e = estadoActualizacion(u);
      c[e] = (c[e] || 0) + 1;
    });
    return c;
  }, [lista]);

  const areas = useMemo(
    () =>
      [...new Set(lista.map((u) => u.area).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [lista],
  );

  const filas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return lista.filter((u) => {
      if (filtro !== "todos" && estadoActualizacion(u) !== filtro) return false;
      if (filtroArea && u.area !== filtroArea) return false;
      if (!q) return true;
      return (
        (u.nombres || u.nombre || "").toLowerCase().includes(q) ||
        (u.correoEmpresa || u.correo || "").toLowerCase().includes(q) ||
        (u.cedula || "").toLowerCase().includes(q)
      );
    });
  }, [lista, filtro, filtroArea, busqueda]);

  const idsMarcables = useMemo(
    () => filas.map((u) => u.idUsuario),
    [filas],
  );
  const todosMarcados =
    idsMarcables.length > 0 && idsMarcables.every((id) => seleccionados.has(id));
  const algunoMarcado = idsMarcables.some((id) => seleccionados.has(id));

  // Solo cuentan los que siguen existiendo y activos
  const marcados = useMemo(
    () => activos.filter((u) => seleccionados.has(u.idUsuario)),
    [activos, seleccionados],
  );
  // Para el recordatorio: ventana abierta y sin haber respondido
  const marcadosParaRecordar = marcados.filter(
    (u) => u.puedeActualizarPerfil && !u.tieneSolicitudPendiente,
  );

  const alternarTodos = () => {
    const nuevo = new Set(seleccionados);
    if (todosMarcados) idsMarcables.forEach((id) => nuevo.delete(id));
    else idsMarcables.forEach((id) => nuevo.add(id));
    setSeleccionados(nuevo);
  };
  const alternarFila = (id) => {
    const nuevo = new Set(seleccionados);
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    setSeleccionados(nuevo);
  };

  // ───────── Acciones ─────────

  const avisoBloque = (r) => {
    const habilitados = r?.habilitados ?? 0;
    const omitidos = r?.omitidosPorSolicitudPendiente ?? 0;
    Toast.fire({
      icon: omitidos > 0 ? "warning" : "success",
      title:
        `${habilitados} ${habilitados === 1 ? "habilitado" : "habilitados"}` +
        (omitidos > 0
          ? ` · ${omitidos} ${omitidos === 1 ? "omitido" : "omitidos"} por tener solicitud pendiente`
          : ""),
      timer: 6000,
    });
  };

  // Una sola persona
  const habilitarUno = async (u) => {
    const fecha = await pedirFechaLimite({
      titulo: "Habilitar actualización",
      texto: `Se habilitará la actualización de información para <b>${nombreDe(u)}</b> y recibirá un correo.`,
    });
    if (!fecha) return;
    try {
      setProcesando(true);
      await permisoActualizacion(u.idUsuario, true, fecha);
      await refrescar();
      toastExito("Actualización habilitada");
    } catch (err) {
      toastError(err.message || "No se pudo habilitar la actualización");
    } finally {
      setProcesando(false);
    }
  };

  const cerrarVentana = async (u) => {
    const r = await Swal.fire({
      icon: "question",
      title: "¿Cerrar la ventana de actualización?",
      text: `${nombreDe(u)} ya no podrá actualizar su información hasta que se la vuelvas a habilitar.`,
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar",
    });
    if (!r.isConfirmed) return;
    try {
      setProcesando(true);
      await permisoActualizacion(u.idUsuario, false);
      await refrescar();
      toastExito("Ventana de actualización cerrada");
    } catch (err) {
      toastError(err.message || "No se pudo cerrar la ventana");
    } finally {
      setProcesando(false);
    }
  };

  // Seleccionados o todos los activos
  const habilitarEnBloque = async ({ todosActivos }) => {
    const ids = marcados.map((u) => u.idUsuario);
    const cantidad = todosActivos ? activos.length : ids.length;
    if (cantidad === 0) return;

    const fecha = await pedirFechaLimite({
      titulo: todosActivos ? "Habilitar a todos los activos" : "Habilitar actualización",
      texto: `Se habilitará la actualización de información para <b>${cantidad}</b> ${
        cantidad === 1 ? "persona" : "personas"
      }. Cada una recibirá un correo.${
        todosActivos
          ? "<br><small class='text-muted'>Incluye a quienes ya respondieron. Para insistirle solo a quienes faltan, márcalos y usa \"Enviar recordatorio\".</small>"
          : ""
      }`,
    });
    if (!fecha) return;

    try {
      setProcesando(true);
      const r = await habilitarActualizacion({
        todosActivos,
        idsUsuarios: todosActivos ? [] : ids,
        fechaLimite: fecha,
      });
      await refrescar();
      setSeleccionados(new Set());
      avisoBloque(r);
    } catch (err) {
      toastError(err.message || "No se pudo habilitar la actualización");
    } finally {
      setProcesando(false);
    }
  };

  const enviarRecordatorio = async () => {
    const ids = marcadosParaRecordar.map((u) => u.idUsuario);
    if (ids.length === 0) return;

    const opcion = await pedirRecordatorio({ cantidad: ids.length });
    if (!opcion) return;

    try {
      setProcesando(true);
      const r = await enviarRecordatorioActualizacion({
        idsUsuarios: ids,
        nuevaFechaLimite: opcion.nuevaFechaLimite,
      });
      await refrescar();
      setSeleccionados(new Set());

      const enviados = r?.enviados ?? 0;
      const omitidos = r?.omitidos ?? 0;
      Toast.fire({
        icon: omitidos > 0 ? "warning" : "success",
        title:
          `${enviados} ${enviados === 1 ? "recordatorio enviado" : "recordatorios enviados"}` +
          (omitidos > 0
            ? ` · ${omitidos} ${omitidos === 1 ? "omitido" : "omitidos"} (ya habían respondido)`
            : "") +
          (r?.fechaLimite ? " · fecha ampliada" : ""),
        timer: 6000,
      });
    } catch (err) {
      toastError(err.message || "No se pudo enviar el recordatorio");
    } finally {
      setProcesando(false);
    }
  };

  // ───────── Columnas ─────────
  const columnas = [
    {
      name: (
        <input
          type="checkbox"
          className="form-check-input"
          title="Seleccionar todos los de esta lista"
          aria-label="Seleccionar todos los de esta lista"
          checked={todosMarcados}
          ref={(el) => {
            if (el) el.indeterminate = !todosMarcados && algunoMarcado;
          }}
          disabled={idsMarcables.length === 0}
          onChange={alternarTodos}
        />
      ),
      width: "50px",
      ignoreRowClick: true,
      cell: (u) => (
        <input
          type="checkbox"
          className="form-check-input"
          aria-label="Seleccionar usuario"
          checked={seleccionados.has(u.idUsuario)}
          onChange={() => alternarFila(u.idUsuario)}
        />
      ),
    },
    {
      name: "Usuario",
      sortable: true,
      selector: (u) => u.nombres || u.nombre || "",
      cell: (u) => (
        <div className="py-1">
          <span className="fw-semibold d-block">{u.nombres || u.nombre || "N/A"}</span>
          {u.cedula && <small className="text-muted d-block">C.I: {u.cedula}</small>}
        </div>
      ),
    },
    { name: "Área", sortable: true, selector: (u) => u.area || "—" },
    {
      name: "Cargo",
      sortable: true,
      selector: (u) => u.cargo || u.nombreCargo || "—",
    },
    {
      name: "Actualización",
      sortable: true,
      selector: (u) => estadoActualizacion(u),
      width: "230px",
      cell: (u) => <BadgeActualizacion u={u} />,
    },
    {
      name: "",
      width: "150px",
      ignoreRowClick: true,
      cell: (u) => {
        if (u.puedeActualizarPerfil) {
          return (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={procesando}
              onClick={() => cerrarVentana(u)}
            >
              <i className="bi bi-lock me-1"></i>Cerrar ventana
            </button>
          );
        }
        return (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            disabled={u.tieneSolicitudPendiente || procesando}
            title={
              u.tieneSolicitudPendiente
                ? "Tiene una solicitud pendiente de revisión"
                : "Habilitar actualización"
            }
            onClick={() => habilitarUno(u)}
          >
            <i className="bi bi-unlock me-1"></i>Habilitar
          </button>
        );
      },
    },
  ];

  const hayFiltros = filtro !== "todos" || filtroArea || busqueda;

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-3">
        {/* Encabezado + acción global */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <div>
            <h6 className="fw-bold mb-1">Habilitar actualización de información</h6>
            <small className="text-muted">
              Se listan solo las cuentas activas. Habilita a una persona desde su
              fila, marca varias, o envía a todos. Cada uno recibe un correo con
              la fecha de referencia.
            </small>
          </div>
          <button
            type="button"
            className="btn btn-sm text-white bg-brand border-0 d-flex align-items-center gap-2 px-3 py-2 rounded-3"
            disabled={activos.length === 0 || procesando}
            onClick={() => habilitarEnBloque({ todosActivos: true })}
          >
            <i className="bi bi-people"></i>
            <span>Enviar a todos los activos ({activos.length})</span>
          </button>
        </div>

        {/* Filtros rápidos con contadores */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {FILTROS.map((f) => (
            <button
              key={f.clave}
              type="button"
              className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 ${
                filtro === f.clave ? "btn-dark" : "btn-outline-secondary"
              }`}
              onClick={() => setFiltro(f.clave)}
            >
              {f.texto}
              <span
                className={`badge rounded-pill ${
                  filtro === f.clave ? "bg-light text-dark" : "bg-secondary-subtle text-secondary-emphasis"
                }`}
              >
                {conteo[f.clave] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Búsqueda + área + acciones sobre la selección */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          {marcados.length > 0 ? (
            <div className="d-flex flex-wrap align-items-center gap-2 me-auto">
              <span className="badge bg-brand-soft text-brand fs-6 fw-semibold">
                {marcados.length}{" "}
                {marcados.length === 1 ? "seleccionado" : "seleccionados"}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-warning"
                disabled={procesando}
                onClick={() => habilitarEnBloque({ todosActivos: false })}
              >
                <i className="bi bi-unlock me-1"></i>Habilitar ({marcados.length})
              </button>
              {marcadosParaRecordar.length > 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning"
                  disabled={procesando}
                  onClick={enviarRecordatorio}
                >
                  <i className="bi bi-bell me-1"></i>
                  Recordatorio ({marcadosParaRecordar.length})
                </button>
              )}
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none"
                onClick={() => setSeleccionados(new Set())}
              >
                Quitar selección
              </button>
            </div>
          ) : (
            <span className="me-auto" />
          )}

          <select
            className="form-select form-select-sm"
            style={{ maxWidth: "200px" }}
            value={filtroArea}
            onChange={(e) => setFiltroArea(e.target.value)}
          >
            <option value="">Todas las áreas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <div className="input-group input-group-sm" style={{ maxWidth: "300px" }}>
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Buscar por nombre, correo o cédula..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          {hayFiltros && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setFiltro("todos");
                setFiltroArea("");
                setBusqueda("");
              }}
            >
              Limpiar
            </button>
          )}
        </div>

        {usuarios.isError ? (
          <div className="alert alert-danger mb-0">
            {usuarios.error?.message || "No se pudo cargar la lista."}
          </div>
        ) : (
          <DataTable
            columns={columnas}
            data={filas}
            customStyles={customStyles}
            progressPending={usuarios.isLoading}
            pagination
            paginationComponentOptions={paginationComponentOptions}
            highlightOnHover
            responsive
            noDataComponent={
              <div className="p-4 text-muted">No hay usuarios para mostrar</div>
            }
          />
        )}
      </div>
    </div>
  );
}
