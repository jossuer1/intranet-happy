import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useUsuarioForm } from "../../hooks/useUsuarioForm";
import DatosPersonales from "./secciones/DatosPersonales";
import DatosLaborales from "./secciones/DatosLaborales";
import Familiares from "./secciones/Familiares";
import ContactosEmergencia from "./secciones/ContactosEmergencia";
import DatosBancarios from "./secciones/DatosBancarios";
import Titulos from "./secciones/Titulos";
import PeriodosContrato from "./secciones/PeriodosContrato";
import { useCatalogosFormulario } from "../../hooks/useCatalogo";
import { toastError } from "../../utils/toast";
import { validarUsuario } from "../../utils/validacionesUsuario";
import "./UsuarioFormCard.css";

// <input type="date"> solo muestra valores "yyyy-MM-dd". Si el backend manda
// "2015-03-04T00:00:00", el input queda vacío aunque el dato exista.
const aFechaInput = (valor) => (valor ? String(valor).split("T")[0] : "");

const normalizarTexto = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase();

// Si el perfil trae el nombre ("etnia": "Mestizo") pero no el id, se busca
// el id en el catálogo para que el select no quede en "Seleccione...".
const CAMPOS_ID_DESDE_NOMBRE = [
  {
    // GET /usuarios/{id} devuelve el área como texto ("departamento") pero
    // no siempre trae idArea; sin esto el select queda en "Seleccione un área...".
    campo: "idArea",
    texto: ["area", "departamento", "nombreArea"],
    catalogo: "areas",
    nombres: [
      "nombreArea",
      "nombreDepartamento",
      "nombre",
      "area",
      "departamento",
    ],
  },
  {
    campo: "idGenero",
    texto: "genero",
    catalogo: "generos",
    nombres: ["nombreGenero", "nombre"],
  },
  {
    campo: "idEstadoCivil",
    texto: "estadoCivil",
    catalogo: "estadosCiviles",
    nombres: ["nombreEstadoCivil", "nombre"],
  },
  {
    campo: "idEtnia",
    texto: "etnia",
    catalogo: "etnias",
    nombres: ["nombreEtnia", "nombre"],
  },
  {
    campo: "idTipoSangre",
    texto: "tipoSangre",
    catalogo: "tiposSangre",
    nombres: ["nombreTipoSangre", "nombre"],
  },
];

// Campos que el propio empleado NO puede tocar cuando entra en modo
// autogestión (RRHH ya los definió). Solo aplica dentro de Datos Personales;
// Datos Laborales, Bancarios y Títulos se ocultan por completo en ese modo.
const CAMPOS_SENSIBLES_AUTOGESTION = [
  "nombre",
  "apellido",
  "cedula",
  "nacionalidad",
  "fechaNacimiento",
  "idGenero",
  "idEstadoCivil",
  "idEtnia",
  "idTipoSangre",
];

const CATALOGOS_VACIOS = {
  areas: [],
  cargos: [],
  bancos: [],
  ciudades: [],
  etnias: [],
  estadosCiviles: [],
  generos: [],
  tiposSangre: [],
};

const OPCIONES_VACIAS = {
  tiposContrato: [],
  tiposContratoConFechaFin: [],
  jornadas: [],
  parentescosFamiliar: [],
  nacionalidades: [],
};

const UsuarioFormCard = ({
  usuarioOriginal = null,
  usuariosDisponibles = [],
  onGuardar,
  onCancelar,
  // true = vista de autogestión del empleado (activada por RRHH vía
  // puedeActualizarPerfil). Solo deja editar contacto, familiares y
  // contactos de emergencia; oculta laborales/bancarios/títulos y bloquea
  // los campos sensibles de Datos Personales.
  modoAutogestion = false,
}) => {
  const esEdicion = Boolean(usuarioOriginal?.idUsuario);
  const fetchPerfil = useAuthStore((state) => state.fetchPerfil);

  const {
    formData,
    setFormData,
    handleChange,
    handleFotoChange,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
  } = useUsuarioForm();

  // Catálogos y listas fijas: 1 sola petición (GET /catalogos/formulario-perfil),
  // en caché 1 hora con React Query.
  const { data: catalogosData } = useCatalogosFormulario();
  const catalogos = catalogosData ?? CATALOGOS_VACIOS;
  const opcionesFijas = catalogosData?.opcionesFijas ?? OPCIONES_VACIAS;

  const [loading, setLoading] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState("personales");

  // Cargar datos originales si es edición
  useEffect(() => {
    if (usuarioOriginal) {
      const initialData = {
        nombre: usuarioOriginal.nombre || "",
        apellido: usuarioOriginal.apellido || "",
        cedula: usuarioOriginal.cedula || "",
        correoPersonal: usuarioOriginal.correoPersonal || "",
        correoEmpresa: usuarioOriginal.correoEmpresa || "",
        celularPersonal: usuarioOriginal.celularPersonal || "",
        celularEmpresa: usuarioOriginal.celularEmpresa || "",
        direccion: usuarioOriginal.direccion || "",
        fechaNacimiento: usuarioOriginal.fechaNacimiento
          ? usuarioOriginal.fechaNacimiento.split("T")[0]
          : "",
        fechaIngreso: usuarioOriginal.fechaIngreso
          ? usuarioOriginal.fechaIngreso.split("T")[0]
          : "",
        idGenero: usuarioOriginal.idGenero || "",
        idEstadoCivil: usuarioOriginal.idEstadoCivil || "",
        idEtnia: usuarioOriginal.idEtnia || "",
        idTipoSangre: usuarioOriginal.idTipoSangre || "",
        idArea: usuarioOriginal.idArea || "",
        idCargo: usuarioOriginal.idCargo || "",
        idCiudad: usuarioOriginal.idCiudad || "",
        idJefeDirecto: usuarioOriginal.idJefeDirecto || "",
        esJefe: usuarioOriginal.esJefe ?? false,
        cargoIess: usuarioOriginal.cargoIess || "",
        sectorial: usuarioOriginal.sectorial || "",
        nacionalidad: usuarioOriginal.nacionalidad || "ECUATORIANA",
        jornada: usuarioOriginal.jornada || "",
        tipoContrato: usuarioOriginal.tipoContrato || "",
        fechaFinContrato: aFechaInput(usuarioOriginal.fechaFinContrato),
        recibeComisiones: usuarioOriginal.recibeComisiones ?? false,
        acumulaDecimos: usuarioOriginal.acumulaDecimos ?? false,
        foto: usuarioOriginal.urlImagenPerfil || "",
        tieneVacaciones: usuarioOriginal.tieneVacaciones ?? true,
        diasVacacionesAsignados: usuarioOriginal.diasVacacionesAsignados ?? 15,
        titulos: (usuarioOriginal.titulos || []).map((t) => ({
          ...t,
          fechaObtencion: aFechaInput(t.fechaObtencion),
        })),
        familiares: (usuarioOriginal.familiares || []).map((f) => ({
          ...f,
          fechaNacimiento: aFechaInput(f.fechaNacimiento),
          fechaUnion: aFechaInput(f.fechaUnion),
        })),
        contactosEmergencia: usuarioOriginal.contactosEmergencia || [],
        datosBancarios: usuarioOriginal.datosBancarios || [],
        periodosIess: (usuarioOriginal.periodosIess || []).map((per) => ({
          idPeriodoIess: per.idPeriodoIess,
          fechaIngreso: aFechaInput(per.fechaIngreso),
          fechaSalida: aFechaInput(per.fechaSalida),
          cargoIess: per.cargoIess || "",
        })),
        titulosAEliminar: [],
        familiaresAEliminar: [],
        contactosEmergenciaAEliminar: [],
        datosBancariosAEliminar: [],
        periodosIessAEliminar: [],
      };
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [usuarioOriginal, setFormData]);

  // Completa ids que el perfil no trajo (solo si vienen vacíos en el form).
  useEffect(() => {
    if (!usuarioOriginal) return;
    setFormData((prev) => {
      const cambios = {};

      // El área se deduce del cargo: cada Cargo del catálogo trae su IdArea,
      // y GET /usuarios/{id} sí devuelve idCargo (pero no idArea). Es más
      // fiable que comparar nombres. Si no aplica, abajo se intenta por nombre.
      if (!prev.idArea && prev.idCargo) {
        const cargo = (catalogos.cargos || []).find(
          (c) => String(c.idCargo) === String(prev.idCargo),
        );
        if (cargo?.idArea) cambios.idArea = cargo.idArea;
      }

      CAMPOS_ID_DESDE_NOMBRE.forEach(({ campo, texto, catalogo, nombres }) => {
        if (prev[campo] || cambios[campo]) return;
        const claves = Array.isArray(texto) ? texto : [texto];
        const nombre = normalizarTexto(
          claves.map((k) => usuarioOriginal[k]).find(Boolean),
        );
        if (!nombre) return;
        const lista = catalogos[catalogo] || [];
        // 1) por los nombres de campo conocidos; 2) si el catálogo usa otro
        //    nombre de campo, por cualquier propiedad de texto que coincida.
        const item =
          lista.find((c) =>
            nombres.some((k) => normalizarTexto(c[k]) === nombre),
          ) ||
          lista.find((c) =>
            Object.values(c).some(
              (v) => typeof v === "string" && normalizarTexto(v) === nombre,
            ),
          );
        if (item && item[campo] !== undefined) cambios[campo] = item[campo];
      });
      return Object.keys(cambios).length ? { ...prev, ...cambios } : prev;
    });
  }, [catalogos, usuarioOriginal, setFormData]);

  // VALIDACIONES EN TIEMPO REAL PARA ESTADO DE CADA SECCIÓN
  const esDatosPersonalesValido = Boolean(
    formData.nombre?.trim() &&
    formData.apellido?.trim() &&
    formData.cedula?.trim(),
  );

  const requiereFechaFin = (
    opcionesFijas.tiposContratoConFechaFin || []
  ).includes(formData.tipoContrato);

  const esDatosLaboralesValido = Boolean(
    formData.idArea &&
    formData.idCargo &&
    formData.fechaIngreso &&
    (!requiereFechaFin || formData.fechaFinContrato),
  );

  const esDatosBancariosValido = formData.datosBancarios.length > 0;
  const esTitulosValido = formData.titulos.length > 0;
  const esContactosValido = formData.contactosEmergencia.length > 0;
  const esFamiliaresValido = formData.familiares.length > 0;

  // Cambia a la pestaña donde está el error y sube al inicio del formulario,
  // para que el usuario vea de inmediato qué le falta.
  const mostrarSeccion = (idSeccion) => {
    if (!idSeccion) return;
    setSeccionActiva(idSeccion);
    setTimeout(() => {
      document
        .getElementById("tabsUsuario")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // Pestañas del formulario. `requerido` => muestra "Requerido" mientras falte.
  const pestanas = [
    {
      id: "personales",
      etiqueta: "Personales",
      icono: "bi-person-vcard",
      requerido: true,
      completo: esDatosPersonalesValido,
    },
    !modoAutogestion && {
      id: "laborales",
      etiqueta: "Laborales",
      icono: "bi-briefcase",
      requerido: true,
      completo: esDatosLaboralesValido,
    },
    !modoAutogestion && {
      id: "bancarios",
      etiqueta: "Bancaria",
      icono: "bi-credit-card-2-front",
      requerido: true,
      completo: esDatosBancariosValido,
      cantidad: formData.datosBancarios.length,
    },
    !modoAutogestion && {
      id: "titulos",
      etiqueta: "Títulos",
      icono: "bi-mortarboard",
      requerido: false,
      completo: esTitulosValido,
      cantidad: formData.titulos.length,
    },
    esEdicion &&
      !modoAutogestion && {
        id: "periodos",
        etiqueta: "Contratos",
        icono: "bi-clock-history",
        requerido: false,
        completo: formData.periodosIess.length > 0,
        cantidad: formData.periodosIess.length,
      },
    {
      id: "contactos",
      etiqueta: "Emergencia",
      icono: "bi-telephone-plus",
      requerido: true,
      completo: esContactosValido,
      cantidad: formData.contactosEmergencia.length,
    },
    {
      id: "familiares",
      etiqueta: "Familiares",
      icono: "bi-people",
      requerido: false,
      completo: esFamiliaresValido,
      cantidad: formData.familiares.length,
    },
  ].filter(Boolean);

  const indiceActivo = Math.max(
    0,
    pestanas.findIndex((p) => p.id === seccionActiva),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorValidacion = validarUsuario(formData, {
      modoAutogestion,
      esEdicion,
      requiereFechaFin,
    });
    if (errorValidacion) {
      toastError(errorValidacion.mensaje);
      mostrarSeccion(errorValidacion.seccion);
      return;
    }

    setLoading(true);

    try {
      // En modo autogestión SOLO viajan campos no sensibles: contacto
      // personal, familiares y contactos de emergencia. Nada de identidad
      // (nombre/apellido/cédula/fecha nacimiento/género/etc.), nada de
      // laborales, nada de bancarios ni títulos, aunque esos valores sigan
      // presentes (sin cambios) en formData.
      //
      // IMPORTANTE: esto es una restricción de FRONTEND. Si el endpoint que
      // recibe este payload es el mismo que usa RRHH para editar a otros
      // usuarios, confirmar con backend que:
      //   a) acepta un payload parcial sin romper los campos no enviados, y
      //   b) igual valida ahí que el propio usuario no pueda mandar cambios
      //      a campos sensibles (por si alguien arma el request a mano).
      const payloadBase = modoAutogestion
        ? {
            correoPersonal: formData.correoPersonal || null,
            celularPersonal: formData.celularPersonal || null,
            direccion: formData.direccion || null,
          }
        : {
            nombre: formData.nombre || null,
            apellido: formData.apellido || null,
            cedula: formData.cedula || null,
            correoEmpresa: formData.correoEmpresa || null,
            correoPersonal: formData.correoPersonal || null,
            celularEmpresa: formData.celularEmpresa || null,
            celularPersonal: formData.celularPersonal || null,
            direccion: formData.direccion || null,
            fechaNacimiento: formData.fechaNacimiento
              ? new Date(formData.fechaNacimiento).toISOString()
              : null,
            fechaIngreso: formData.fechaIngreso
              ? new Date(formData.fechaIngreso).toISOString()
              : null,
            idGenero: formData.idGenero ? Number(formData.idGenero) : null,
            idEstadoCivil: formData.idEstadoCivil
              ? Number(formData.idEstadoCivil)
              : null,
            idEtnia: formData.idEtnia ? Number(formData.idEtnia) : null,
            idTipoSangre: formData.idTipoSangre
              ? Number(formData.idTipoSangre)
              : null,
            idArea: formData.idArea ? Number(formData.idArea) : null,
            idCargo: formData.idCargo ? Number(formData.idCargo) : null,
            idCiudad: formData.idCiudad ? Number(formData.idCiudad) : null,
            idJefeDirecto: formData.idJefeDirecto
              ? Number(formData.idJefeDirecto)
              : null,
            tieneVacaciones: formData.tieneVacaciones,
            diasVacacionesAsignados: formData.tieneVacaciones
              ? Number(formData.diasVacacionesAsignados || 15)
              : null,
            // Condición laboral. La fecha de fin solo viaja para contratos
            // que la exigen (EMERGENTE / PRODUCTIVO); el backend rechaza
            // una fecha de fin en los demás tipos.
            esJefe: Boolean(formData.esJefe),
            cargoIess: formData.cargoIess?.trim() || null,
            // Sectorial: en edición, "" le dice al backend que lo borre
            // (null significaría "no tocar").
            sectorial: formData.sectorial?.trim() || (esEdicion ? "" : null),
            nacionalidad: formData.nacionalidad || "ECUATORIANA",
            jornada: formData.jornada || null,
            tipoContrato: formData.tipoContrato || null,
            fechaFinContrato:
              requiereFechaFin && formData.fechaFinContrato
                ? new Date(formData.fechaFinContrato).toISOString()
                : null,
            recibeComisiones: Boolean(formData.recibeComisiones),
            acumulaDecimos: Boolean(formData.acumulaDecimos),
          };

      const familiarPayload = (f) => {
        const esConyuge = normalizarTexto(f.parentesco) === "conyuge";
        return {
          nombre: f.nombre,
          apellido: f.apellido || null,
          parentesco: f.parentesco || null,
          cedula: f.cedula?.trim() || null,
          // Cónyuge usa fechaUnion; hijo usa fechaNacimiento (el backend
          // rechaza fechaUnion en un hijo).
          fechaNacimiento:
            !esConyuge && f.fechaNacimiento
              ? new Date(f.fechaNacimiento).toISOString()
              : null,
          fechaUnion:
            esConyuge && f.fechaUnion
              ? new Date(f.fechaUnion).toISOString()
              : null,
        };
      };

      const payload = esEdicion
        ? {
            ...payloadBase,
            familiares: formData.familiares.map((f) => ({
              idFamiliar: f.idFamiliar || null,
              ...familiarPayload(f),
            })),
            contactosEmergencia: formData.contactosEmergencia.map((c) => ({
              idContacto: c.idContacto || null,
              nombre: c.nombre,
              apellido: c.apellido || null,
              parentesco: c.parentesco || null,
              telefono: c.telefono || null,
              direccion: c.direccion || null,
            })),
            familiaresAEliminar: formData.familiaresAEliminar,
            contactosEmergenciaAEliminar: formData.contactosEmergenciaAEliminar,
            // Títulos y datos bancarios no se tocan en modo autogestión.
            ...(!modoAutogestion && {
              titulos: formData.titulos.map((t) => ({
                idTitulo: t.idTitulo || null,
                nombreTitulo: t.nombreTitulo,
                institucion: t.institucion || null,
                culminado: t.culminado !== false,
                fechaObtencion:
                  t.culminado !== false && t.fechaObtencion
                    ? new Date(t.fechaObtencion).toISOString()
                    : null,
              })),
              datosBancarios: formData.datosBancarios.map((b) => ({
                idDatoBancario: b.idDatoBancario || null,
                idBanco: Number(b.idBanco),
                tipoCuenta: b.tipoCuenta,
                numeroCuenta: b.numeroCuenta,
              })),
              titulosAEliminar: formData.titulosAEliminar,
              datosBancariosAEliminar: formData.datosBancariosAEliminar,
              periodosIess: formData.periodosIess.map((per) => ({
                idPeriodoIess: per.idPeriodoIess || null,
                fechaIngreso: new Date(per.fechaIngreso).toISOString(),
                fechaSalida: per.fechaSalida
                  ? new Date(per.fechaSalida).toISOString()
                  : null,
                cargoIess: per.cargoIess?.trim() || null,
              })),
              periodosIessAEliminar: formData.periodosIessAEliminar,
            }),
          }
        : {
            ...payloadBase,
            familiares: formData.familiares.map(familiarPayload),
            titulos: formData.titulos.map((t) => ({
              nombreTitulo: t.nombreTitulo,
              institucion: t.institucion || null,
              culminado: t.culminado !== false,
              fechaObtencion:
                t.culminado !== false && t.fechaObtencion
                  ? new Date(t.fechaObtencion).toISOString()
                  : null,
            })),
            contactosEmergencia: formData.contactosEmergencia.map((c) => ({
              nombre: c.nombre,
              apellido: c.apellido || null,
              parentesco: c.parentesco || null,
              telefono: c.telefono || null,
              direccion: c.direccion || null,
            })),
            datosBancarios: formData.datosBancarios.map((b) => ({
              idBanco: Number(b.idBanco),
              tipoCuenta: b.tipoCuenta,
              numeroCuenta: b.numeroCuenta,
            })),
          };

      await onGuardar(
        esEdicion ? usuarioOriginal.idUsuario : null,
        payload,
        formData.fotoArchivo || null,
      );

      // El backend debe apagar puedeActualizarPerfil al recibir este
      // guardado. Volvemos a pedir el perfil para reflejarlo de inmediato y
      // que AppLayout deje de bloquear la navegación.
      if (modoAutogestion) {
        await fetchPerfil();
      }
    } catch (err) {
      toastError(
        err.message ||
          (esEdicion
            ? "Error al actualizar la información del usuario"
            : "Error al crear el usuario"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-usuario-wrapper">
      <form onSubmit={handleSubmit} noValidate>
        {/* ENCABEZADO */}
        <div className="form-header-card mb-4">
          <h4 className="fw-bold m-0 d-flex align-items-center gap-2">
            <i
              className={`bi ${
                esEdicion
                  ? "bi-person-gear text-warning"
                  : "bi-person-plus-fill"
              }`}
            ></i>
            {esEdicion
              ? "Editar Registro de Usuario"
              : "Crear Nuevo Registro de Usuario"}
          </h4>
        </div>

        {/* PESTAÑAS (mismo estilo que el perfil del colaborador) */}
        <div className="card border-0 shadow-sm mb-5" id="tabsUsuario">
          <div className="card-header tabs-usuario-header bg-white border-bottom p-2">
            <ul className="nav nav-pills tabs-usuario" role="tablist">
              {pestanas.map((p) => {
                const seleccionada = p.id === pestanas[indiceActivo].id;
                const faltante = p.requerido && !p.completo;
                return (
                  <li
                    className="nav-item flex-shrink-0"
                    key={p.id}
                    role="presentation"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={seleccionada}
                      className={`nav-link d-flex align-items-center gap-2 ${
                        seleccionada
                          ? "active bg-brand"
                          : "text-dark bg-white border"
                      }`}
                      onClick={() => setSeccionActiva(p.id)}
                    >
                      <i className={`bi ${p.icono}`}></i>
                      {p.etiqueta}
                      {faltante ? (
                        <span className="badge rounded-pill d-flex align-items-center gap-1 bg-warning-subtle text-warning-emphasis border border-warning">
                          <i className="bi bi-exclamation-circle-fill"></i>
                          Requerido
                        </span>
                      ) : p.completo ? (
                        <span className="badge rounded-pill d-flex align-items-center gap-1 bg-success-subtle text-success border border-success">
                          <i className="bi bi-check-circle-fill"></i>
                          {p.cantidad !== undefined ? p.cantidad : "Completado"}
                        </span>
                      ) : (
                        <span className="badge rounded-pill bg-light text-secondary border">
                          Opcional
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card-body p-3" role="tabpanel">
            {/* Todos los paneles quedan montados; solo se oculta el inactivo */}
            <div className={seccionActiva === "personales" ? "" : "d-none"}>
              <DatosPersonales
                formData={formData}
                handleChange={handleChange}
                handleFotoChange={handleFotoChange}
                catalogos={catalogos}
                opcionesFijas={opcionesFijas}
                camposSoloLectura={
                  modoAutogestion ? CAMPOS_SENSIBLES_AUTOGESTION : []
                }
              />
            </div>

            {!modoAutogestion && (
              <div className={seccionActiva === "laborales" ? "" : "d-none"}>
                <DatosLaborales
                  formData={formData}
                  handleChange={handleChange}
                  catalogos={catalogos}
                  usuariosDisponibles={usuariosDisponibles}
                  opcionesFijas={opcionesFijas}
                  idUsuarioActual={usuarioOriginal?.idUsuario}
                />
              </div>
            )}

            {!modoAutogestion && (
              <div className={seccionActiva === "bancarios" ? "" : "d-none"}>
                <DatosBancarios
                  cuentas={formData.datosBancarios}
                  handleItemChange={handleItemChange}
                  handleAddItem={handleAddItem}
                  handleRemoveItem={handleRemoveItem}
                  catalogos={catalogos}
                />
              </div>
            )}

            {!modoAutogestion && (
              <div className={seccionActiva === "titulos" ? "" : "d-none"}>
                <Titulos
                  titulos={formData.titulos}
                  handleItemChange={handleItemChange}
                  handleAddItem={handleAddItem}
                  handleRemoveItem={handleRemoveItem}
                />
              </div>
            )}

            {esEdicion && !modoAutogestion && (
              <div className={seccionActiva === "periodos" ? "" : "d-none"}>
                <PeriodosContrato
                  periodos={formData.periodosIess}
                  handleItemChange={handleItemChange}
                  handleAddItem={handleAddItem}
                  handleRemoveItem={handleRemoveItem}
                />
              </div>
            )}

            <div className={seccionActiva === "contactos" ? "" : "d-none"}>
              <ContactosEmergencia
                contactos={formData.contactosEmergencia}
                handleItemChange={handleItemChange}
                handleAddItem={handleAddItem}
                handleRemoveItem={handleRemoveItem}
              />
            </div>

            <div className={seccionActiva === "familiares" ? "" : "d-none"}>
              <Familiares
                familiares={formData.familiares}
                parentescos={opcionesFijas.parentescosFamiliar}
                handleItemChange={handleItemChange}
                handleAddItem={handleAddItem}
                handleRemoveItem={handleRemoveItem}
              />
            </div>
          </div>
        </div>

        {/* ÚNICO BOTÓN DE GUARDAR FIJO ABAJO */}
        <div className="fixed-bottom-bar">
          <div className="fixed-bottom-bar-inner">
            {onCancelar && (
              <button
                type="button"
                className="btn btn-hp-secondary px-4"
                onClick={onCancelar}
                disabled={loading}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="btn btn-hp-primary px-4 shadow-sm d-flex align-items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {esEdicion ? "Guardando..." : "Creando..."}
                </>
              ) : (
                <>
                  <i className="bi bi-floppy-fill"></i>
                  {esEdicion ? "Guardar Cambios" : "Guardar Usuario Completo"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UsuarioFormCard;
