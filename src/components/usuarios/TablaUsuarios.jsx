import React, { useState, useMemo, memo } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";

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
  rows: {
    style: {
      minHeight: "56px",
      cursor: "pointer",
    },
  },
};

const paginationComponentOptions = {
  rowsPerPageText: "Filas por página:",
  rangeSeparatorText: "de",
  selectAllRowsItem: true,
  selectAllRowsItemText: "Todos",
};
const estaActivo = (u) =>
  u.estado === "Activo" ||
  u.estado === 1 ||
  u.estado === true ||
  u.idEstado === 1;

function TablaUsuarios({
  usuarios = [],
  onEditar,
  onCambiarEstado,
  onCambiarPermisoPerfil,
}) {
  const [filterText, setFilterText] = useState("");
  // Usuario cuya información general se muestra en la tarjeta flotante.
  // null = tarjeta cerrada.

  const [filtroEstado, setFiltroEstado] = useState("todos"); // todos | activos | inactivos
  const [filtroArea, setFiltroArea] = useState("");

  // Áreas que existen en la lista, sin repetir y ordenadas
  const areas = useMemo(
    () =>
      [...new Set(usuarios.map((u) => u.area).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [usuarios],
  );

  const hayFiltros = filtroEstado !== "todos" || filtroArea || filterText;
  const limpiarFiltros = () => {
    setFiltroEstado("todos");
    setFiltroArea("");
    setFilterText("");
  };
  const navigate = useNavigate();

  // Filtrado memoizado para evitar recalcular en cada re-render del padre
  const filteredItems = useMemo(() => {
    const search = filterText.toLowerCase().trim();

    return usuarios.filter((item) => {
      if (filtroEstado === "activos" && !estaActivo(item)) return false;
      if (filtroEstado === "inactivos" && estaActivo(item)) return false;
      if (filtroArea && item.area !== filtroArea) return false;

      if (!search) return true;

      const nombre = (item.nombres || item.nombre || "").toLowerCase();
      const correo = (item.correoEmpresa || item.correo || "").toLowerCase();
      const cedula = (item.cedula || "").toLowerCase();

      return (
        nombre.includes(search) ||
        correo.includes(search) ||
        cedula.includes(search)
      );
    });
  }, [usuarios, filterText, filtroEstado, filtroArea]);

  // Definición memoizada de columnas
  const columns = useMemo(
    () => [
      {
        name: "#",
        selector: (row, index) => index + 1,
        width: "60px",
      },
      {
        name: "Usuario",
        selector: (row) => row.nombres || row.nombre || "Sin nombre",
        sortable: true,
        cell: (row) => (
          <div className="py-1">
            <span className="fw-semibold d-block">
              {row.nombres || row.nombre || "N/A"}
            </span>
            {row.cedula && (
              <small className="text-muted d-block">C.I: {row.cedula}</small>
            )}
          </div>
        ),
      },
      {
        name: "Correo",
        selector: (row) => row.correoEmpresa || row.correo || "N/A",
        sortable: true,
      },
      {
        name: "Área",
        selector: (row) => row.area || "N/A",
        sortable: true,
      },
      {
        name: "Cargo",
        selector: (row) => row.cargo || row.nombreCargo || "N/A",
        sortable: true,
      },

      {
        name: "Vacaciones",
        selector: (row) => (row.tieneVacaciones === false ? "No" : "Sí"),
        sortable: true,
        width: "130px",
        cell: (row) => {
          const tiene = row.tieneVacaciones !== false;
          return (
            <span
              className={`badge ${
                tiene
                  ? "bg-info-subtle text-info-emphasis border border-info-subtle"
                  : "bg-light text-muted border"
              }`}
            >
              {tiene ? "Habilitadas" : "No aplica"}
            </span>
          );
        },
      },
      {
        name: "Estado",
        selector: (row) => row.estado,
        sortable: true,
        width: "120px",
        cell: (row) => {
          const esActivo =
            row.estado === "Activo" ||
            row.estado === 1 ||
            row.estado === true ||
            row.idEstado === 1;

          return (
            <span
              className={`badge ${esActivo ? "bg-success" : "bg-secondary"}`}
            >
              {esActivo ? "Activo" : "Inactivo"}
            </span>
          );
        },
      },
      {
        name: "Acciones",
        width: "210px",
        cell: (row) => {
          const esActivo =
            row.estado === "Activo" ||
            row.estado === 1 ||
            row.estado === true ||
            row.idEstado === 1;
          return (
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center"
                title="Ver información"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/perfiles/${row.idUsuario}`);
                }}
              >
                <i className="bi bi-eye"></i>
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditar?.(row);
                }}
              >
                <i className="bi bi-pencil-square"></i>
              </button>
              <button
                type="button"
                className={`btn btn-sm d-inline-flex align-items-center justify-content-center ${
                  esActivo ? "btn-outline-danger" : "btn-outline-success"
                }`}
                title={esActivo ? "Desactivar cuenta" : "Activar cuenta"}
                onClick={(e) => {
                  e.stopPropagation();
                  onCambiarEstado?.(row);
                }}
              >
                <i
                  className={`bi ${esActivo ? "bi-person-x" : "bi-person-check"}`}
                ></i>
              </button>
              <button
                type="button"
                className={`btn btn-sm d-inline-flex align-items-center justify-content-center ${
                  row.puedeActualizarPerfil
                    ? "btn-warning"
                    : "btn-outline-primary"
                }`}
                title={
                  row.puedeActualizarPerfil
                    ? "Revocar edición de perfil"
                    : "Permitir que actualice su perfil"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onCambiarPermisoPerfil?.(row);
                }}
              >
                <i
                  className={`bi ${row.puedeActualizarPerfil ? "bi-unlock-fill" : "bi-person-vcard"}`}
                ></i>
              </button>
            </div>
          );
        },
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [onEditar, onCambiarEstado, navigate, onCambiarPermisoPerfil],
  );

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-3">
        {/* BUSCADOR CON ICONO DE BOOTSTRAP */}
        {/* FILTROS + BUSCADOR */}
        <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mb-3">
          <select
            className="form-select form-select-sm"
            style={{ maxWidth: "170px" }}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>

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
              placeholder="Buscar por nombre, correo o cédula..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>

          {hayFiltros && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={limpiarFiltros}
            >
              Limpiar
            </button>
          )}
        </div>
        {/* TABLA DE DATOS */}
        <DataTable
          columns={columns}
          data={filteredItems}
          customStyles={customStyles}
          pagination
          paginationComponentOptions={paginationComponentOptions}
          highlightOnHover
          pointerOnHover
          responsive
          onRowClicked={(row) => onEditar?.(row)}
          noDataComponent={
            <div className="p-4 text-muted">No hay usuarios para mostrar</div>
          }
        />
      </div>
    </div>
  );
}

export default memo(TablaUsuarios);
