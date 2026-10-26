import Swal from "sweetalert2";
import { hoyEC } from "../../utils/fechasEcuador";

// Estilo común de los modales (botones con los colores de la marca; las clases
// .swal-hp-* están en index.css).
const estiloModal = {
  buttonsStyling: false,
  reverseButtons: true,
  customClass: {
    popup: "swal-hp-popup",
    title: "swal-hp-title",
    htmlContainer: "swal-hp-html",
    actions: "swal-hp-actions",
    confirmButton: "btn bg-brand text-white px-4",
    cancelButton: "btn btn-outline-secondary px-4",
  },
};

// "2026-10-29" -> "jueves, 29 de octubre de 2026"
const fechaLarga = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("es-EC", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// hoy (YYYY-MM-DD) + n días
const sumarDias = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const ATAJOS = [
  { texto: "7 días", dias: 7 },
  { texto: "15 días", dias: 15 },
  { texto: "30 días", dias: 30 },
];

// Modal único de "fecha límite" para los puntos de entrada (fila, selección y
// todos los activos). Devuelve "YYYY-MM-DD" o null si cancela.
export const pedirFechaLimite = async ({ titulo, texto }) => {
  const hoy = hoyEC();
  const inicial = sumarDias(hoy, 7);

  const { isConfirmed, value } = await Swal.fire({
    ...estiloModal,
    icon: "question",
    iconColor: "#004d40",
    title: titulo,
    html: `
      <p class="mb-3">${texto}</p>
      <div class="swal-hp-fecha text-start">
        <label for="swal-fecha-limite" class="form-label fw-semibold mb-2">
          <i class="bi bi-calendar-event me-1"></i>Fecha límite para actualizar
        </label>
        <div class="d-flex flex-wrap gap-2 mb-2">
          ${ATAJOS.map(
            (a) =>
              `<button type="button" class="btn btn-sm btn-outline-secondary rounded-pill swal-hp-atajo" data-dias="${a.dias}">${a.texto}</button>`,
          ).join("")}
        </div>
        <input type="date" id="swal-fecha-limite" class="form-control swal-hp-date"
               min="${hoy}" value="${inicial}">
        <div id="swal-fecha-previa" class="text-muted mt-2" style="font-size:.9rem"></div>
      </div>
    `,
    didOpen: () => {
      const input = document.getElementById("swal-fecha-limite");
      const previa = document.getElementById("swal-fecha-previa");
      const atajos = document.querySelectorAll(".swal-hp-atajo");

      const refrescar = () => {
        previa.textContent = input.value
          ? `Vence el ${fechaLarga(input.value)}`
          : "";
        atajos.forEach((b) => {
          const activo = sumarDias(hoy, Number(b.dataset.dias)) === input.value;
          b.classList.toggle("active", activo);
        });
      };

      atajos.forEach((b) =>
        b.addEventListener("click", () => {
          input.value = sumarDias(hoy, Number(b.dataset.dias));
          refrescar();
        }),
      );
      input.addEventListener("input", refrescar);
      refrescar();
    },
    showCancelButton: true,
    confirmButtonText: "Habilitar y notificar",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const fecha = document.getElementById("swal-fecha-limite").value;
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

// Modal del recordatorio. Opcionalmente amplía la fecha de referencia (por defecto hoy + 7).
// Devuelve { nuevaFechaLimite: "YYYY-MM-DD" | null } o null si cancela.
export const pedirRecordatorio = async ({ cantidad }) => {
  const hoy = hoyEC();

  const { isConfirmed, value } = await Swal.fire({
    ...estiloModal,
    icon: "question",
    iconColor: "#004d40",
    title: "Enviar recordatorio",
    html: `
      <p class="mb-3">Se enviará un recordatorio por correo a <b>${cantidad}</b> ${
        cantidad === 1 ? "persona" : "personas"
      }.</p>
      <div class="form-check text-start mb-2">
        <input class="form-check-input" type="checkbox" id="swal-ampliar">
        <label class="form-check-label" for="swal-ampliar">Ampliar la fecha de referencia</label>
      </div>
      <input type="date" id="swal-nueva-fecha" class="form-control swal-hp-date" min="${hoy}" value="${sumarDias(hoy, 7)}" disabled>
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
