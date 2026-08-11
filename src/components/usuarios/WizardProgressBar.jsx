function WizardProgressBar({ pasoActual }) {
  const pasos = [
    "1. Personal",
    "2. Laboral",
    "3. Familia",
    "4. Banco",
    "5. Títulos",
  ];

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between mb-2">
        {pasos.map((paso, index) => (
          <span
            key={index}
            className={`fw-bold ${pasoActual >= index + 1 ? "text-primary" : "text-muted"}`}
          >
            {paso}
          </span>
        ))}
      </div>
      <div className="progress" style={{ height: "6px" }}>
        <div
          className="progress-bar bg-primary"
          role="progressbar"
          style={{ width: `${(pasoActual / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

export default WizardProgressBar;
