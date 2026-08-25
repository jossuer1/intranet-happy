import React, { memo } from "react";

const PASOS = [
  { numero: 1, titulo: "Personal", icono: "bi-person" },
  { numero: 2, titulo: "Laboral", icono: "bi-briefcase" },
  { numero: 3, titulo: "Familia", icono: "bi-house-heart" },
  { numero: 4, titulo: "Banco", icono: "bi-bank" },
  { numero: 5, titulo: "Títulos", icono: "bi-journal-bookmark" },
];

function WizardProgressBar({ pasoActual }) {
  const porcentaje = (pasoActual / PASOS.length) * 100;

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between mb-2">
        {PASOS.map((paso) => {
          const esCompletado = pasoActual > paso.numero;
          const esActual = pasoActual === paso.numero;

          return (
            <span
              key={paso.numero}
              className={`fw-bold d-inline-flex align-items-center gap-1 ${
                esActual || esCompletado
                  ? "text-primary"
                  : "text-muted opacity-75"
              }`}
            >
              <i
                className={`bi ${
                  esCompletado
                    ? "bi-check-circle-fill text-success"
                    : esActual
                      ? `${paso.icono}-fill text-primary`
                      : paso.icono
                }`}
              ></i>
              <span className="small">
                {paso.numero}. {paso.titulo}
              </span>
            </span>
          );
        })}
      </div>

      <div className="progress" style={{ height: "6px" }}>
        <div
          className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
          role="progressbar"
          style={{ width: `${porcentaje}%` }}
          aria-valuenow={pasoActual}
          aria-valuemin={1}
          aria-valuemax={PASOS.length}
        ></div>
      </div>
    </div>
  );
}

export default memo(WizardProgressBar);
