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

// hoy (YYYY-MM-DD) + n días
const sumarDias = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// Modal del recordatorio. Opcionalmente amplía la fecha de referencia (por defecto hoy + 7).
// Devuelve { nuevaFechaLimite: "YYYY-MM-DD" | null } o null si cancela.
export const pedirRecordatorio = async ({ cantidad }) => {
  const hoy = hoyEC();

  const { isConfirmed, value } = await Swal.fire({
    icon: "question",
    title: "Enviar recordatorio",
    html: `
      <p class="mb-3">Se enviará un recordatorio por correo a <b>${cantidad}</b> ${
        cantidad === 1 ? "persona" : "personas"
      }.</p>
      <div class="form-check text-start mb-2">
        <input class="form-check-input" type="checkbox" id="swal-ampliar">
        <label class="form-check-label" for="swal-ampliar">Ampliar la fecha de referencia</label>
      </div>
      <input type="date" id="swal-nueva-fecha" class="form-control" min="${hoy}" value="${sumarDias(hoy, 7)}" disabled>
    `,
    didOpen: () => {
      const chk = document.getElementById("swal-ampliar");
      const fecha = document.getElementById("swal-nueva-fecha");
      chk.addEventListener("change", () => {
        fecha.disabled = !chk.checked;
      });
    },
    showCancelButton: true,
    confirmButtonText: "Enviar recordatorio",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const ampliar = document.getElementById("swal-ampliar").checked;
      const fecha = document.getElementById("swal-nueva-fecha").value;
      if (!ampliar) return { nuevaFechaLimite: null };
      if (!fecha) {
        Swal.showValidationMessage("Selecciona la nueva fecha.");
        return false;
      }
      if (fecha < hoy) {
        Swal.showValidationMessage("La fecha no puede ser anterior a hoy.");
        return false;
      }
      return { nuevaFechaLimite: fecha };
    },
  });

  return isConfirmed ? value : null;
};
