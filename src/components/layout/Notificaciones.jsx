import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { getMiPerfil } from "../../services/usuariosService";
import { getMisSolicitudesVacacion } from "../../services/vacacionesService";
import { solicitudesPerfilService } from "../../services/solicitudesPerfilService";

function leerClaves(clave) {
  try { const datos = JSON.parse(localStorage.getItem(clave) || "[]"); return Array.isArray(datos) ? datos : []; }
  catch { return []; }
}
const ordenar = datos => [...(Array.isArray(datos) ? datos : [])].sort((a, b) =>
  new Date(b.fechaRevision || b.fechaRespuestaJefe || b.fechaSolicitud) - new Date(a.fechaRevision || a.fechaRespuestaJefe || a.fechaSolicitud));

export default function Notificaciones() {
  const id = useId();
  const usuario = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [lecturas, setLecturas] = useState({});
  const habilitado = !!usuario?.idUsuario && !["ADMIN", "ADMINISTRADOR"].includes(String(usuario.rol).toUpperCase());
  const opciones = { enabled: habilitado, staleTime: 30000, refetchInterval: 60000, refetchIntervalInBackground: false };
  const perfil = useQuery({ queryKey: ["alertas", "perfil", usuario?.idUsuario], queryFn: getMiPerfil, ...opciones });
  const cambios = useQuery({ queryKey: ["misSolicitudes", usuario?.idUsuario], queryFn: solicitudesPerfilService.mias, ...opciones });
  const vacaciones = useQuery({ queryKey: ["alertas", "vacaciones", usuario?.idUsuario], queryFn: getMisSolicitudesVacacion, ...opciones });
  const info = perfil.data || usuario;
  const ultima = ordenar(cambios.data)[0];
  const alertas = [];
  if (habilitado && ultima?.estado === "RECHAZADA") alertas.push({
    clave: `perfil-rechazado-${ultima.idSolicitud}-${ultima.fechaRevision || ultima.fechaSolicitud}`,
    titulo: "Actualización de perfil rechazada", texto: ultima.observacionRrhh || "Revisa la observación de RRHH y corrige tu información.", icono: "bi-exclamation-circle", ruta: "/mi-perfil",
  });
  if (habilitado && info?.puedeActualizarPerfil) alertas.push({
    clave: `perfil-habilitado-${info.idUsuario}-${info.puedeActualizarHasta || "abierto"}-${ultima?.idSolicitud || "inicial"}`,
    titulo: "Actualiza tu información", texto: "RRHH habilitó el formulario de actualización de tu perfil.", icono: "bi-person-check", ruta: "/mi-perfil",
  });
  if (habilitado) ordenar(vacaciones.data).filter(s => s.estado === "RECHAZADA_JEFE").slice(0, 5).forEach(s => alertas.push({
    clave: `vacaciones-rechazadas-${s.idSolicitud}-${s.fechaRespuestaJefe || s.fechaSolicitud}`,
    titulo: "Solicitud de vacaciones rechazada", texto: s.observacionJefe || "Consulta el motivo y el estado de tu solicitud.", icono: "bi-calendar-x", ruta: "/mis-vacaciones",
  }));
  const claveLectura = `happypay-alertas-leidas-${usuario?.idUsuario || "sin-sesion"}`;
  const leidas = lecturas[claveLectura] || leerClaves(claveLectura);
  const sinLeer = alertas.filter(a => !leidas.includes(a.clave)).length;
  const marcarLeidas = () => {
    const nuevas = [...new Set([...leidas, ...alertas.map(a => a.clave)])].slice(-100);
    setLecturas(prev => ({ ...prev, [claveLectura]: nuevas }));
    try { localStorage.setItem(claveLectura, JSON.stringify(nuevas)); } catch { /* La lectura sigue vigente durante esta sesión. */ }
  };
  const error = perfil.isError || cambios.isError || vacaciones.isError;
  const cargando = habilitado && (perfil.isPending || cambios.isPending || vacaciones.isPending);
  return <div className="dropdown hp-notificaciones">
    <button id={id} type="button" className="hp-campana" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false"
      aria-label={`Notificaciones${sinLeer ? `, ${sinLeer} sin leer` : ""}`} onClick={marcarLeidas}>
      <i className="bi bi-bell" aria-hidden="true" />{sinLeer > 0 && <span className="hp-campana-punto" aria-hidden="true" />}
    </button>
    <div className="dropdown-menu dropdown-menu-end hp-alertas-menu" aria-labelledby={id}>
      <div className="px-3 py-2 border-bottom"><h2 className="fs-6 fw-semibold mb-1">Notificaciones</h2><p className="text-muted small mb-0">Alertas importantes de tu cuenta</p></div>
      {cargando && <p className="small text-muted p-3 mb-0" role="status">Consultando alertas…</p>}
      {error && <div className="small text-muted p-3">No se pudieron actualizar todas las alertas. <button type="button" className="btn btn-link btn-sm p-0" onClick={() => { perfil.refetch(); cambios.refetch(); vacaciones.refetch(); }}>Reintentar</button></div>}
      {!cargando && !error && !alertas.length && <p className="small text-muted text-center p-4 mb-0"><i className="bi bi-check2-circle d-block fs-4 mb-2" />No tienes alertas importantes.</p>}
      <div className="hp-alertas-lista">{alertas.map(a => <button type="button" key={a.clave} className="dropdown-item hp-alerta" onClick={() => { marcarLeidas(); navigate(a.ruta); }}>
        <i className={`bi ${a.icono}`} aria-hidden="true" /><span><strong>{a.titulo}</strong><small>{a.texto}</small></span>
      </button>)}</div>
    </div>
  </div>;
}
