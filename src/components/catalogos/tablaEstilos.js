// Estilos y textos compartidos por todas las tablas de administración.
// Son los mismos de TablaUsuarios, para que se vean igual en toda la app.

export const estilosTabla = {
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
      minHeight: "52px",
      cursor: "pointer",
    },
  },
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
