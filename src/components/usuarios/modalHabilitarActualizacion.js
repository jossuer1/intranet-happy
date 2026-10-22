import Swal from "sweetalert2";
import { hoyEC } from "../../utils/fechasEcuador";

// Modal único de "fecha límite" para los tres puntos de entrada
// (fila, selección y todos los activos). Devuelve "YYYY-MM-DD" o null si cancela.
export const pedirFechaLimite = async ({ titulo, texto }) => {
  const hoy = hoyEC();

  const { isConfirmed, value } = await Swal.fire({
    icon: "question",
    title: titulo,
    html: `
      <p class="mb-3">${texto}</p>
      <label for="swal-fecha-limite" class="form-label fw-semibold small">
        Fecha límite para actualizar
      </label>
    `,
    input: "date",
    inputAttributes: { min: hoy },
    showCancelButton: true,
    confirmButtonText: "Habilitar y notificar",
    cancelButtonText: "Cancelar",
    preConfirm: (fecha) => {
      if (!fecha) {
        Swal.showValidationMessage("Selecciona la fecha límite.");
        return false;
      }
      if (fecha < hoy) {
        Swal.showValidationMessage("La fecha límite no puede ser anterior a hoy.");
        return false;
      }
      return fecha;
    },
  });

  return isConfirmed ? value : null;
};
