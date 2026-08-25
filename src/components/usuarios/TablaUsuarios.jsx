import React, { useState, useMemo, memo } from "react";
import DataTable from "react-data-table-component";

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

function TablaUsuarios({ usuarios = [], onEditar }) {
  const [filterText, setFilterText] = useState("");

  // Filtrado memoizado para evitar recalcular en cada re-render del padre
  const filteredItems = useMemo(() => {
    const search = filterText.toLowerCase().trim();
    if (!search) return usuarios;

    return usuarios.filter((item) => {
      const nombre = (item.nombres || item.nombre || "").toLowerCase();
      const correo = (item.correoEmpresa || item.correo || "").toLowerCase();
      const cedula = (item.cedula || "").toLowerCase();

      return (
        nombre.includes(search) ||
        correo.includes(search) ||
        cedula.includes(search)
      );
    });
  }, [usuarios, filterText]);

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
        width: "110px",
        cell: (row) => (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onEditar?.(row);
            }}
          >
            <i className="bi bi-pencil-square"></i>
            <span>Editar</span>
          </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [onEditar],
  );

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-3">
        {/* BUSCADOR CON ICONO DE BOOTSTRAP */}
        <div className="d-flex justify-content-end mb-3">
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
