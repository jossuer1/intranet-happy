import { useState } from "react";
import DataTable from "react-data-table-component";

function TablaUsuarios({ usuarios = [], onEditar, onEliminar }) {
  const [filterText, setFilterText] = useState("");

  // 1. Filtrado para el buscador global
  const filteredItems = usuarios.filter((item) => {
    const search = filterText.toLowerCase();
    return (
      item.nombre?.toLowerCase().includes(search) ||
      item.correo?.toLowerCase().includes(search) ||
      item.rol?.toLowerCase().includes(search)
    );
  });

  // 2. Definición de Columnas
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Usuario",
      selector: (row) => row.nombre,
      sortable: true,
      cell: (row) => <span className="fw-semibold">{row.nombre}</span>,
    },
    {
      name: "Correo",
      selector: (row) => row.correo,
      sortable: true,
    },
    {
      name: "Rol",
      selector: (row) => row.rol,
      sortable: true,
      cell: (row) => <span className="badge bg-info text-dark">{row.rol}</span>,
    },
    {
      name: "Estado",
      selector: (row) => row.estado,
      sortable: true,
      cell: (row) => (
        <span
          className={`badge ${
            row.estado === "Activo" ? "bg-success" : "bg-secondary"
          }`}
        >
          {row.estado}
        </span>
      ),
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="d-flex gap-1">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onEditar && onEditar(row)}
            title="Editar"
          >
            ✏️
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => onEliminar && onEliminar(row.id)}
            title="Eliminar"
          >
            🗑️
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // 3. Traducción al español para los controles de paginación
  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página:",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-3">
        {/* BUSCADOR DENTRO DEL SUBHEADER */}
        <div className="d-flex justify-content-end mb-3">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ maxWidth: "300px" }}
            placeholder="🔍 Buscar..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        {/* COMPONENTE DATATABLE */}
        <DataTable
          columns={columns}
          data={filteredItems}
          pagination
          paginationComponentOptions={paginationComponentOptions}
          highlightOnHover
          responsive
          noDataComponent={
            <div className="p-4 text-muted">No hay usuarios para mostrar</div>
          }
        />
      </div>
    </div>
  );
}

export default TablaUsuarios;
