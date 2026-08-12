import { useState } from "react";
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

function IconEditar() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
    </svg>
  );
}

function TablaUsuarios({ usuarios = [], onEditar }) {
  const [filterText, setFilterText] = useState("");

  const filteredItems = usuarios.filter((item) => {
    const search = filterText.toLowerCase();
    return (
      item.nombre?.toLowerCase().includes(search) ||
      item.correo?.toLowerCase().includes(search)
    );
  });

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
      name: "Estado",
      selector: (row) => row.estado,
      sortable: true,
      width: "130px",
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
      name: "",
      width: "90px",
      cell: (row) => (
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
          onClick={(e) => {
            e.stopPropagation();
            onEditar && onEditar(row);
          }}
        >
          <IconEditar /> Editar
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página:",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-3">
        <div className="d-flex justify-content-end mb-3">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ maxWidth: "260px" }}
            placeholder="Buscar por nombre o correo..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredItems}
          customStyles={customStyles}
          pagination
          paginationComponentOptions={paginationComponentOptions}
          highlightOnHover
          pointerOnHover
          responsive
          onRowClicked={(row) => onEditar && onEditar(row)}
          noDataComponent={
            <div className="p-4 text-muted">No hay usuarios para mostrar</div>
          }
        />
      </div>
    </div>
  );
}

export default TablaUsuarios;
