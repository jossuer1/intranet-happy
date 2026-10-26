export default function PersonaCelda({ nombre, apellido, detalle, compacta = false }) {
  const completo = [nombre, apellido].filter(Boolean).join(" ").trim() || "Colaborador";
  const partes = completo.split(/\s+/);
  const iniciales = (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
  return <div className={`hp-persona ${compacta ? "hp-persona-sm" : ""}`}>
    <span className="hp-avatar" aria-hidden="true">{iniciales}</span>
    <div className="hp-persona-texto"><span className="hp-persona-nombre">{completo}</span>
      {detalle && <small className="hp-persona-detalle">{detalle}</small>}
    </div>
  </div>;
}
