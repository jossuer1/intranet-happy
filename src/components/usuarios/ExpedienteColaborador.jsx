import { useId, useState } from "react";
import { formatearFecha, calcularEdad } from "../../utils/dateUtils";
import { formatearFechaHoraEC } from "../../utils/fechasEcuador";

const fecha = valor => valor ? formatearFecha(valor) : "Sin registrar";
const siNo = valor => valor == null ? "Sin registrar" : valor ? "Sí" : "No";
function Campo({ etiqueta, valor }) {
  return <div className="col-12 col-sm-6"><dt>{etiqueta}</dt><dd>{valor === null || valor === undefined || valor === "" ? "Sin registrar" : valor}</dd></div>;
}
function Bloque({ titulo, icono = "bi-person-vcard", campos, children }) {
  return <section className="hp-expediente-bloque h-100"><h3><i className={`bi ${icono}`} aria-hidden="true" />{titulo}</h3>
    {campos && <dl className="row g-3 mb-0">{campos.map(([etiqueta, valor]) => <Campo key={etiqueta} etiqueta={etiqueta} valor={valor} />)}</dl>}{children}
  </section>;
}
function Coleccion({ registros = [], render, vacio }) {
  const lista = Array.isArray(registros) ? registros : [];
  return lista.length ? <div className="row g-3">{lista.map((registro, i) => <div className="col-12 col-lg-6" key={i}>{render(registro, i)}</div>)}</div>
    : <p className="text-muted text-center py-4 mb-0">{vacio}</p>;
}

// Vista completa de RRHH; utiliza todos los datos de negocio del DTO Perfil.
export default function ExpedienteColaborador({ info }) {
  const prefijo = useId();
  const [activa, setActiva] = useState("personal");
  const nombre = `${info.nombre || ""} ${info.apellido || ""}`.trim() || "Colaborador";
  const partes = nombre.split(/\s+/);
  const iniciales = (partes[0][0] + (partes.length > 1 ? partes.at(-1)[0] : "")).toUpperCase();
  const pestanas = [
    ["personal", "Información personal", "bi-person-vcard"], ["laboral", "Datos laborales", "bi-briefcase"],
    ["formacion", "Formación", "bi-mortarboard"], ["familiares", "Familiares", "bi-people"],
    ["emergencia", "Emergencia", "bi-telephone-plus"], ["bancarios", "Datos bancarios", "bi-bank"],
    ["control", "Control del expediente", "bi-shield-check"],
  ];
  return <div className="hp-expediente">
    <header className="hp-expediente-cabecera">
      {info.urlImagenPerfil ? <img className="hp-expediente-avatar" src={info.urlImagenPerfil} alt={`Fotografía de ${nombre}`} />
        : <span className="hp-expediente-avatar" aria-hidden="true">{iniciales}</span>}
      <div className="flex-grow-1"><h2>{nombre}</h2><p className="text-muted mb-2">{info.cargo || "Sin cargo asignado"} · {info.departamento || info.area || "Sin área asignada"}</p>
        <div className="d-flex flex-wrap gap-2"><span className={`badge ${info.estado ? "bg-success" : "bg-secondary"}`}>{info.estado ? "Activo" : "Inactivo"}</span>
          {info.rol && <span className="badge bg-primary">{info.rol}</span>}{info.esJefe && <span className="badge bg-primary">Jefe directo</span>}
          <span className="badge bg-light text-secondary">C.I. {info.cedula || "Sin registrar"}</span></div>
      </div>
    </header>
    <ul className="nav nav-pills flex-nowrap overflow-auto hp-expediente-tabs" role="tablist" aria-label="Información del expediente">
      {pestanas.map(([id, titulo, icono], indice) => <li className="nav-item flex-shrink-0" key={id} role="presentation">
        <button id={`${prefijo}-${id}`} type="button" role="tab" aria-selected={activa === id} aria-controls={`${prefijo}-panel`} tabIndex={activa === id ? 0 : -1}
          className={`nav-link ${activa === id ? "active" : ""}`} onClick={() => setActiva(id)}
          onKeyDown={e => { let siguiente;
            if (e.key === "ArrowRight") siguiente = (indice + 1) % pestanas.length;
            if (e.key === "ArrowLeft") siguiente = (indice - 1 + pestanas.length) % pestanas.length;
            if (e.key === "Home") siguiente = 0;
            if (e.key === "End") siguiente = pestanas.length - 1;
            if (siguiente !== undefined) { e.preventDefault(); setActiva(pestanas[siguiente][0]); document.getElementById(`${prefijo}-${pestanas[siguiente][0]}`)?.focus(); }
          }}><i className={`bi ${icono}`} aria-hidden="true" />{titulo}</button>
      </li>)}
    </ul>
    <div id={`${prefijo}-panel`} role="tabpanel" aria-labelledby={`${prefijo}-${activa}`} className="hp-expediente-panel">
      {activa === "personal" && <div className="row g-3">
        <div className="col-12 col-lg-6"><Bloque titulo="Identificación" campos={[
          ["Nombre", info.nombre], ["Apellido", info.apellido], ["Cédula", info.cedula], ["Nacionalidad", info.nacionalidad],
          ["Fecha de nacimiento", fecha(info.fechaNacimiento)], ["Edad", info.fechaNacimiento ? `${calcularEdad(info.fechaNacimiento)} años` : null],
          ["Género", info.genero ?? info.idGenero], ["Estado civil", info.estadoCivil ?? info.idEstadoCivil],
          ["Etnia", info.etnia ?? info.idEtnia], ["Tipo de sangre", info.tipoSangre ?? info.idTipoSangre],
        ]} /></div>
        <div className="col-12 col-lg-6"><Bloque titulo="Contacto y domicilio" icono="bi-geo-alt" campos={[
          ["Correo personal", info.correoPersonal], ["Celular personal", info.celularPersonal], ["Dirección", info.direccion],
          ["Región", info.region ?? info.idRegion], ["Provincia", info.provincia ?? info.idProvincia], ["Ciudad", info.ciudad ?? info.idCiudad],
        ]} /></div>
      </div>}
      {activa === "laboral" && <>
        <div className="row g-3 mb-3"><div className="col-12 col-lg-6"><Bloque titulo="Puesto y organización" icono="bi-diagram-3" campos={[
          ["Cargo", info.cargo ?? info.idCargo], ["Área / departamento", info.departamento || info.area], ["Jefe directo", info.jefeDirecto || (info.idJefeDirecto ? `Colaborador #${info.idJefeDirecto}` : "Sin asignar")],
          ["Es jefe", siNo(info.esJefe)], ["Correo empresarial", info.correoEmpresa], ["Celular empresarial", info.celularEmpresa],
        ]} /></div><div className="col-12 col-lg-6"><Bloque titulo="Contrato y afiliación" icono="bi-file-earmark-text" campos={[
          ["Fecha de ingreso", fecha(info.fechaIngreso)], ["Jornada", info.jornada], ["Tipo de contrato", info.tipoContrato],
          ["Fin de contrato", info.fechaFinContrato ? fecha(info.fechaFinContrato) : "No aplica / sin registrar"], ["Cargo IESS", info.cargoIess], ["Sectorial", info.sectorial],
        ]} /></div><div className="col-12"><Bloque titulo="Beneficios y pagos" icono="bi-wallet2" campos={[
          ["Beneficio de vacaciones", siNo(info.tieneVacaciones)], ["Días de vacaciones asignados", info.diasVacacionesAsignados],
          ["Recibe comisiones", siNo(info.recibeComisiones)], ["Acumula décimos", siNo(info.acumulaDecimos)],
        ]} /></div></div>
        <h3 className="hp-expediente-subtitulo">Historial de períodos IESS</h3>
        <Coleccion registros={info.periodosIess} vacio="Sin períodos IESS registrados." render={(p, i) => <Bloque titulo={`Período ${i + 1}`} icono="bi-clock-history" campos={[
          ["Fecha de ingreso", fecha(p.fechaIngreso)], ["Fecha de salida", p.fechaSalida ? fecha(p.fechaSalida) : "Vigente"], ["Cargo IESS", p.cargoIess], ["Estado", (p.vigente ?? !p.fechaSalida) ? "Vigente" : "Finalizado"],
        ]} />} />
      </>}
      {activa === "formacion" && <Coleccion registros={info.titulos} vacio="Sin títulos académicos registrados." render={(t, i) => <Bloque titulo={`Formación ${i + 1}`} icono="bi-mortarboard" campos={[
        ["Título", t.nombreTitulo], ["Institución", t.institucion], ["Estado", t.culminado ? "Culminado" : "En curso"], ["Fecha de obtención", fecha(t.fechaObtencion)],
      ]} />} />}
      {activa === "familiares" && <Coleccion registros={info.familiares} vacio="Sin familiares registrados." render={(f, i) => <Bloque titulo={`Familiar ${i + 1}`} icono="bi-people" campos={[
        ["Nombre", f.nombre], ["Apellido", f.apellido], ["Parentesco", f.parentesco], ["Cédula", f.cedula], ["Fecha de nacimiento", fecha(f.fechaNacimiento)], ["Fecha de unión", fecha(f.fechaUnion)],
      ]} />} />}
      {activa === "emergencia" && <Coleccion registros={info.contactosEmergencia} vacio="Sin contactos de emergencia registrados." render={(c, i) => <Bloque titulo={`Contacto ${i + 1}`} icono="bi-telephone-plus" campos={[
        ["Nombre", c.nombre], ["Apellido", c.apellido], ["Parentesco", c.parentesco], ["Teléfono", c.telefono], ["Dirección", c.direccion],
      ]} />} />}
      {activa === "bancarios" && <Coleccion registros={info.datosBancarios} vacio="Sin cuentas bancarias registradas." render={(b, i) => <Bloque titulo={`Cuenta ${i + 1}`} icono="bi-bank" campos={[
        ["Banco", b.banco || b.idBanco], ["Tipo de cuenta", b.tipoCuenta], ["Número de cuenta", b.numeroCuenta],
      ]} />} />}
      {activa === "control" && <div className="row g-3"><div className="col-12 col-lg-6"><Bloque titulo="Cuenta y acceso" icono="bi-shield-check" campos={[
        ["Código del colaborador", info.idUsuario], ["Estado de la cuenta", info.estado ? "Activa" : "Inactiva"], ["Rol", info.rol || "Sin rol asignado"], ["Habilitado como jefe", siNo(info.esJefe)],
      ]} /></div><div className="col-12 col-lg-6"><Bloque titulo="Actualización de información" icono="bi-person-check" campos={[
        ["Edición de perfil habilitada", siNo(info.puedeActualizarPerfil)], ["Fecha de referencia", info.puedeActualizarHasta ? formatearFechaHoraEC(info.puedeActualizarHasta) : "Sin fecha de referencia"],
        ["Solicitud pendiente de revisión", siNo(info.tieneSolicitudPendiente)],
      ]} /></div></div>}
    </div>
  </div>;
}
