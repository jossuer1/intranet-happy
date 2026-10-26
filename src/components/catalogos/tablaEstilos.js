// Estilos y textos compartidos por todas las tablas de administración.
// Son los mismos de TablaUsuarios, para que se vean igual en toda la app.

export const estilosTabla = {
  headCells: {
    style: {
      textTransform: "uppercase",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: ".055em",
      color: "#728178",
      backgroundColor: "#f7faf8",
      paddingLeft: "18px",
      paddingRight: "18px",
    },
  },
  rows: {
    style: {
      minHeight: "76px",
      fontSize: "13px",
      color: "#35483e",
      borderBottomColor: "#edf1ee",
    },
    highlightOnHoverStyle: { backgroundColor: "#f3f8f5", outline: "none" },
  },
  cells: { style: { paddingLeft: "18px", paddingRight: "18px", paddingTop: "12px", paddingBottom: "12px" } },
  headRow: { style: { minHeight: "48px", borderBottomColor: "#e8eee9" } },
  pagination: { style: { borderTopColor: "#edf1ee", color: "#687970", minHeight: "62px" } },
};

export const opcionesPaginacion = {
  rowsPerPageText: "Filas por página:",
  rangeSeparatorText: "de",
  selectAllRowsItem: true,
  selectAllRowsItemText: "Todos",
};

export const filasPorPagina = [10, 15, 25, 50, 100];

// Minúsculas y sin tildes: "Quito", "quito" y "QUITÓ" coinciden al buscar.
export const normalizar = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
