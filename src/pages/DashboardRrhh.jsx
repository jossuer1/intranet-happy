import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import AppLayout from "../components/layout/AppLayout";
import SectionHeader from "../components/layout/SectionHeader";
import PersonaCelda from "../components/ui/PersonaCelda";
import { dashboardRrhhService } from "../services/dashboardRrhhService";
import { toastError, toastExito } from "../utils/toast";

const claveCumpleanos = ["dashboard-rrhh", "cumpleanos"];
const tarjetas = [
  { campo: "empleadosActivos", titulo: "Empleados activos", icono: "bi-people" },
  { campo: "areas", titulo: "Departamentos (Áreas)", icono: "bi-diagram-3" },
  { campo: "solicitudesPendientes", titulo: "Solicitudes pendientes", icono: "bi-hourglass-split" },
];

const formatoFecha = new Intl.DateTimeFormat("es-EC", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function EstadoConsulta({ consulta }) {
  if (consulta.isPending)
    return <p className="text-muted mb-0" role="status">Cargando…</p>;
  if (consulta.isError)
    return <p className="text-danger mb-0" role="alert">
      {consulta.error.message}{" "}
      <button type="button" className="btn btn-link btn-sm" onClick={() => consulta.refetch()}>
        Reintentar
      </button>
    </p>;
  return null;
}

export default function DashboardRrhh() {
  const cache = useQueryClient();
  const resumen = useQuery({ queryKey: ["dashboard-rrhh", "resumen"], queryFn: dashboardRrhhService.resumen });
  const cumpleanos = useQuery({ queryKey: claveCumpleanos, queryFn: () => dashboardRrhhService.proximos() });
  const envio = useMutation({
    mutationFn: dashboardRrhhService.felicitar,
    onSuccess: (respuesta, idUsuario) => {
      cache.setQueryData(claveCumpleanos, (lista) => lista?.map((persona) =>
        persona.idUsuario === idUsuario ? { ...persona, yaFelicitado: true } : persona));
      toastExito(respuesta.mensaje);
    },
    onError: (error) => {
      toastError(error.message);
      cumpleanos.refetch();
    },
  });

  async function confirmarEnvio(persona) {
    const confirmacion = await Swal.fire({
      title: "¿Enviar felicitación?",
      text: `Se enviará un correo de cumpleaños a ${persona.nombreCompleto}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Felicitar",
      cancelButtonText: "Cancelar",
    });
    if (confirmacion.isConfirmed) envio.mutate(persona.idUsuario);
  }

  return (
    <AppLayout>
      <div className="container-fluid">
        <SectionHeader titulo="Dashboard RRHH" />
        <div className="mb-4">
          <EstadoConsulta consulta={resumen} />
          {resumen.data && <div className="row row-cols-1 row-cols-md-3 g-3">
            {tarjetas.map(({ campo, titulo, icono }) => (
              <div className="col" key={campo}>
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-body p-4">
                    <h2 className="h6 text-muted"><i className={`bi ${icono} me-2`} aria-hidden="true" />{titulo}</h2>
                    <p className="h3 mb-0 fw-bold">{resumen.data[campo]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>}
        </div>

        <section className="card border-0 shadow-sm rounded-3" aria-labelledby="titulo-cumpleanos">
          <div className="card-body p-4">
            <h2 id="titulo-cumpleanos" className="h5 mb-3">Próximos cumpleaños</h2>
            <EstadoConsulta consulta={cumpleanos} />
            {cumpleanos.data?.length === 0 && <p className="text-muted mb-0">No hay cumpleaños próximos</p>}
            {!!cumpleanos.data?.length && <ul className="list-group list-group-flush">
              {cumpleanos.data.map((persona) => {
                const fecha = formatoFecha.format(new Date(persona.fechaCumpleanos));
                const enviando = envio.isPending && envio.variables === persona.idUsuario;
                return (
                  <li key={persona.idUsuario} className="list-group-item px-0 d-flex align-items-center justify-content-between gap-3 flex-wrap">
                    <PersonaCelda nombre={persona.nombreCompleto} foto={persona.foto} detalle={fecha} />
                    <button
                      type="button"
                      className={`btn btn-sm ${persona.yaFelicitado ? "btn-outline-secondary" : "btn-primary"}`}
                      disabled={persona.yaFelicitado || envio.isPending}
                      onClick={() => confirmarEnvio(persona)}
                    >
                      {persona.yaFelicitado ? "Felicitado" : enviando ? "Enviando…" : "Felicitar"}
                    </button>
                  </li>
                );
              })}
            </ul>}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
