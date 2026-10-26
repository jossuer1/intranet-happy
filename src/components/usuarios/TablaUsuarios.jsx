import { estilosTabla as customStyles } from "../catalogos/tablaEstilos";
import PersonaCelda from "../ui/PersonaCelda";
import UsuarioInfoModal from "./UsuarioInfoModal";
import { useState, useMemo, memo } from "react";
import DataTable from "react-data-table-component";
import { estaActivo } from "../../utils/usuariosEstado";


const paginationComponentOptions = {
  rowsPerPageText: "Filas por página:",
  rangeSeparatorText: "de",
  selectAllRowsItem: true,
  selectAllRowsItemText: "Todos",
};
function TablaUsuarios({ usuarios = [], onEditar, onCambiarEstado }) {
  const [filterText, setFilterText] = useState("");
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
  const [usuarioInfo, setUsuarioInfo] = useState(null);

  // Filtrado memoizado para evitar recalcular en cada re-render del padre
  const filteredItems = useMemo(() => {
    const search = filterText.toLowerCase().trim();

    return usuarios.filter((item) => {
      if (filtroEstado === "activos" && !estaActivo(item)) return false;
      if (filtroEstado === "inactivos" && estaActivo(item)) return false;
      if (filtroArea && item.area !== filtroArea) return false;

      if (!search) return true;

      const nombre = `${item.nombres || item.nombre || ""} ${item.apellidos || item.apellido || ""}`.toLowerCase();
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
        name: "Colaborador",
        selector: (row) => `${row.nombres || row.nombre || ""} ${row.apellidos || row.apellido || ""}`.trim(),
        minWidth: "240px",
        sortable: true,
        cell: (row) => (
          <PersonaCelda nombre={row.nombres || row.nombre} apellido={row.apellidos || row.apellido} detalle={<>{row.correoEmpresa || row.correo}{row.cedula && <span className="d-block">C.I. {row.cedula}</span>}</>} />
        ),
      },
      {
        name: "Área y cargo",
        selector: (row) => row.area || "N/A",
        sortable: true,
        minWidth: "210px",
        cell: row => <div><span className="d-block fw-medium">{row.area || "Sin área"}</span><small className="text-muted">{row.cargo || row.nombreCargo || "Sin cargo"}</small></div>,
      },

      {
        name: "Vacaciones",
        selector: (row) => (row.tieneVacaciones === false ? "No" : "Sí"),
        sortable: true,
        width: "135px",
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
        width: "100px",
        cell: (row) => {
          const esActivo = estaActivo(row);

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
        width: "155px",
        cell: (row) => {
          const esActivo = estaActivo(row);
          return (
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center"
                title="Ver información"
                onClick={(e) => {
                  e.stopPropagation();
                  setUsuarioInfo(row);
                }}
              >
                <i className="bi bi-eye"></i>
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center"
                title="Editar información"
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
            </div>
          );
        },
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [onEditar, onCambiarEstado],
  );

  return (
    <>
      <div>
        {/* BUSCADOR CON ICONO DE BOOTSTRAP */}
        {/* FILTROS + BUSCADOR */}
        <div className="hp-filtros">
          <select
            className="form-select form-select-sm" aria-label="Filtrar colaboradores"
            style={{ maxWidth: "170px" }}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>

          <select
            className="form-select form-select-sm" aria-label="Filtrar colaboradores"
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
              aria-label="Buscar colaboradores" placeholder="Buscar nombre, correo o cédula..."
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
          onRowClicked={(row) => setUsuarioInfo(row)}
          noDataComponent={
            <div className="p-4 text-muted">No hay usuarios para mostrar</div>
          }
        />
      </div>
      {usuarioInfo && <UsuarioInfoModal usuario={usuarioInfo} onClose={() => setUsuarioInfo(null)} />}
    </>
  );
}

export default memo(TablaUsuarios);
