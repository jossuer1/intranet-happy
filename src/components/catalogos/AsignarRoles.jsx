import PersonaCelda from "../ui/PersonaCelda";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import ModalBase from "./ModalBase";
import {
  estilosTabla,
  opcionesPaginacion,
  filasPorPagina,
  normalizar,
} from "./tablaEstilos";
import {
  getRoles,
  getUsuariosConRol,
  asignarRol,
  quitarRol,
} from "../../services/rolesService";
import { useAuthStore } from "../../store/useAuthStore";

const claseRol = (rol) => {
  if (!rol) return "bg-light text-muted border";
  if (rol === "ADMIN") return "bg-dark";
  if (rol === "RRHH")
    return "bg-info-subtle text-info-emphasis border border-info-subtle";
  return "bg-primary-subtle text-primary-emphasis border border-primary-subtle";
};

const nombreCompleto = (u) => `${u.nombre} ${u.apellido}`.trim();

const avisoExito = (titulo) =>
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: titulo,
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
  });

const avisoError = (err, titulo) =>
  Swal.fire({
    icon: "error",
    title: titulo,
    text: err?.message || "Inténtalo de nuevo en unos segundos.",
  });

/**
 * Asignar roles a usuarios. No se crean roles aquí: solo se elige a la
 * persona y se le asigna uno de los roles que ya existen (RRHH, ADMIN...).
 */
function AsignarRoles() {
  const yo = useAuthStore((s) => s.user);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState(""); // "" = todos | "sin-rol" | nombre del rol
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [resetPagina, setResetPagina] = useState(false);

  const [modal, setModal] = useState(null); // null | usuario seleccionado
  const [idRolElegido, setIdRolElegido] = useState("");
  const [guardando, setGuardando] = useState(false);

  const usuariosQ = useQuery({
    queryKey: ["admin-roles", "usuarios"],
    queryFn: () => getUsuariosConRol(),
  });
  const rolesQ = useQuery({
    queryKey: ["admin-roles", "roles"],
    queryFn: () => getRoles(),
  });

  const usuarios = useMemo(
    () => (Array.isArray(usuariosQ.data) ? usuariosQ.data : []),
    [usuariosQ.data],
  );
  const roles = useMemo(
    () => (Array.isArray(rolesQ.data) ? rolesQ.data : []),
    [rolesQ.data],
  );

  const hayFiltros = busqueda.trim() || filtroRol || filtroEstado !== "todos";

  const limpiar = () => {
    setBusqueda("");
    setFiltroRol("");
    setFiltroEstado("todos");
    setResetPagina((v) => !v);
  };

  const filas = useMemo(() => {
    const texto = normalizar(busqueda);
    return usuarios.filter((u) => {
      if (filtroRol === "sin-rol" && u.rol) return false;
      if (filtroRol && filtroRol !== "sin-rol" && u.rol !== filtroRol)
        return false;
      if (filtroEstado === "activos" && !u.estado) return false;
      if (filtroEstado === "inactivos" && u.estado) return false;
      if (!texto) return true;
      return [nombreCompleto(u), u.cedula, u.correoEmpresa, u.cargo].some((t) =>
        normalizar(t).includes(texto),
      );
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  const esUnoMismo = (u) => u.idUsuario === yo?.idUsuario;

  const abrirAsignar = (u) => {
    setIdRolElegido(u.idRol ? String(u.idRol) : "");
    setModal(u);
  };

  const rolElegido = roles.find((r) => String(r.idRol) === idRolElegido);

  const guardar = async (e) => {
    e.preventDefault();
    if (!modal || !idRolElegido) return;
    try {
      setGuardando(true);
      await asignarRol(modal.idUsuario, Number(idRolElegido));
      setModal(null);
      avisoExito("Rol asignado");
    } catch (err) {
      avisoError(err, "No se pudo asignar el rol");
    } finally {
      setGuardando(false);
    }
  };

  const quitar = async (u) => {
    const confirmacion = await Swal.fire({
      icon: "warning",
      title: "¿Quitar el rol?",
      html: `<b>${nombreCompleto(u)}</b> dejará de ser <b>${u.rol}</b> y quedará como empleado sin rol.`,
      showCancelButton: true,
      confirmButtonText: "Sí, quitar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmacion.isConfirmed) return;

    try {
      await quitarRol(u.idUsuario);
      avisoExito("Rol quitado");
    } catch (err) {
      avisoError(err, "No se pudo quitar el rol");
    }
  };

  const columnas = [
    {
      name: "Usuario",
      selector: (u) => nombreCompleto(u),
      sortable: true,
      grow: 2,
      cell: (u) => (
        <PersonaCelda nombre={nombreCompleto(u)} detalle={u.cedula ? `C.I. ${u.cedula}` : undefined} />
      ),
    },
    {
      name: "Correo",
      selector: (u) => u.correoEmpresa ?? "N/A",
      sortable: true,
      grow: 2,
    },
    {
      name: "Cargo",
      selector: (u) => u.cargo ?? "N/A",
      sortable: true,
    },
    {
      name: "Rol",
      selector: (u) => u.rol ?? "Sin rol",
      sortable: true,
      width: "140px",
      cell: (u) => (
        <span className={`badge ${claseRol(u.rol)}`}>{u.rol ?? "Sin rol"}</span>
      ),
    },
    {
      name: "Cuenta",
      selector: (u) => (u.estado ? "Activa" : "Inactiva"),
      sortable: true,
      width: "110px",
      cell: (u) => (
        <span className={`badge ${u.estado ? "bg-success" : "bg-secondary"}`}>
          {u.estado ? "Activa" : "Inactiva"}
        </span>
      ),
    },
    {
      name: "Acciones",
      width: "120px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      cell: (u) => (
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center"
            title={
              esUnoMismo(u) ? "No puedes cambiar tu propio rol" : "Asignar rol"
            }
            disabled={esUnoMismo(u)}
            onClick={(e) => {
              e.stopPropagation();
              abrirAsignar(u);
            }}
          >
            <i className="bi bi-person-gear"></i>
          </button>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm d-inline-flex align-items-center justify-content-center"
            title={
              esUnoMismo(u)
                ? "No puedes quitarte tu propio rol"
                : u.rol
                  ? "Quitar rol"
                  : "Este usuario no tiene rol"
            }
            disabled={esUnoMismo(u) || !u.rol}
            onClick={(e) => {
              e.stopPropagation();
              quitar(u);
            }}
          >
            <i className="bi bi-person-dash"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="card shadow-sm border-0 rounded-3">
      <div className="card-body p-4">
        <div className="mb-4">
          <h5 className="card-title fw-bold m-0">Roles de usuario</h5>
          <small className="text-muted">
            Elige a la persona y asígnale uno de los roles existentes. El
            cambio se aplica cuando vuelva a iniciar sesión.
          </small>
        </div>

        {usuariosQ.isLoading || rolesQ.isLoading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : usuariosQ.isError || rolesQ.isError ? (
          <div className="alert alert-danger d-flex justify-content-between align-items-center">
            <span>
              {usuariosQ.error?.message ||
                rolesQ.error?.message ||
                "No se pudo cargar la información."}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => {
                usuariosQ.refetch();
                rolesQ.refetch();
              }}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
              <small className="text-muted me-auto">
                {filas.length === usuarios.length
                  ? `${usuarios.length} usuarios`
                  : `${filas.length} de ${usuarios.length} usuarios`}
              </small>

              <select
                className="form-select form-select-sm"
                style={{ maxWidth: "180px" }}
                value={filtroRol}
                onChange={(e) => {
                  setFiltroRol(e.target.value);
                  setResetPagina((v) => !v);
                }}
                aria-label="Filtrar por rol"
              >
                <option value="">Todos los roles</option>
                <option value="sin-rol">Sin rol</option>
                {roles.map((r) => (
                  <option key={r.idRol} value={r.nombre}>
                    {r.nombre}
                  </option>
                ))}
              </select>

              <select
                className="form-select form-select-sm"
                style={{ maxWidth: "170px" }}
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value);
                  setResetPagina((v) => !v);
                }}
                aria-label="Filtrar por estado de la cuenta"
              >
                <option value="todos">Todas las cuentas</option>
                <option value="activos">Activas</option>
                <option value="inactivos">Inactivas</option>
              </select>

              <div
                className="input-group input-group-sm"
                style={{ maxWidth: "300px" }}
              >
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Buscar por nombre, cédula o correo..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setResetPagina((v) => !v);
                  }}
                />
              </div>

              {hayFiltros && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={limpiar}
                >
                  Limpiar
                </button>
              )}
            </div>

            <DataTable
              columns={columnas}
              data={filas}
              customStyles={estilosTabla}
              pagination
              paginationPerPage={15}
              paginationRowsPerPageOptions={filasPorPagina}
              paginationComponentOptions={opcionesPaginacion}
              paginationResetDefaultPage={resetPagina}
              highlightOnHover
              responsive
              noDataComponent={
                <div className="p-4 text-muted">
                  No hay usuarios que coincidan con los filtros.
                </div>
              }
            />
          </>
        )}
      </div>

      {modal && (
        <ModalBase
          titulo="Asignar rol"
          subtitulo={nombreCompleto(modal)}
          onClose={() => setModal(null)}
        >
          <form onSubmit={guardar}>
            <div className="modal-body">
              <p className="text-muted small mb-3">
                Rol actual:{" "}
                <span className={`badge ${claseRol(modal.rol)}`}>
                  {modal.rol ?? "Sin rol"}
                </span>
              </p>

              <label className="form-label fw-semibold" htmlFor="rol-nuevo">
                Nuevo rol
              </label>
              <select
                id="rol-nuevo"
                className="form-select"
                value={idRolElegido}
                onChange={(e) => setIdRolElegido(e.target.value)}
                autoFocus
                required
              >
                <option value="">Selecciona un rol</option>
                {roles.map((r) => (
                  <option key={r.idRol} value={r.idRol}>
                    {r.nombre}
                  </option>
                ))}
              </select>

              {rolElegido?.nombre === "ADMIN" && (
                <div className="alert alert-warning small mt-3 mb-0">
                  Un usuario <b>ADMIN</b> solo ve la pantalla de
                  administración: no tendrá las opciones de autogestión ni las
                  de RRHH.
                </div>
              )}
            </div>
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setModal(null)}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn text-white bg-brand border-0"
                disabled={
                  guardando ||
                  !idRolElegido ||
                  idRolElegido === String(modal.idRol ?? "")
                }
              >
                {guardando ? "Guardando..." : "Asignar rol"}
              </button>
            </div>
          </form>
        </ModalBase>
      )}
    </div>
  );
}

export default AsignarRoles;
