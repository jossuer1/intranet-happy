// Validaciones del formulario de usuario (crear / editar / autogestión).
// Cada validador devuelve el PRIMER error como { mensaje, seccion } o null.
// `seccion` es el id del colapsable (accordion) donde está el problema, para
// poder abrirlo automáticamente.

import { hoyEC } from "./fechasEcuador.js";

const SECCION = {
  personales: "personales",
  laborales: "laborales",
  bancarios: "bancarios",
  titulos: "titulos",
  periodos: "periodos",
  contactos: "contactos",
  familiares: "familiares",
};

const RE_NOMBRE = /^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u;
const RE_CEDULA = /^\d{10}$/;
const RE_CELULAR = /^09\d{8}$/; // celular Ecuador: 10 dígitos que empiezan con 09
const RE_TELEFONO = /^\d{7,10}$/; // contacto de emergencia: fijo o celular
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RE_SOLO_DIGITOS = /^\d+$/;

const vacio = (v) => !String(v ?? "").trim();
const err = (mensaje, seccion) => ({ mensaje, seccion: SECCION[seccion] });
const fechaValida = valor => {
  const texto = String(valor ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto) || texto < "1900-01-01") return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
};

const validarNombre = (valor, etiqueta, seccion) => {
  const v = String(valor ?? "").trim();
  if (!v) return err(`${etiqueta} es obligatorio.`, seccion);
  if (v.length < 2)
    return err(`${etiqueta} debe tener al menos 2 letras.`, seccion);
  if (v.length > 50) return err(`${etiqueta} no puede superar los 50 caracteres.`, seccion);
  if (!RE_NOMBRE.test(v))
    return err(`${etiqueta} solo puede contener letras.`, seccion);
  return null;
};

export const validarUsuario = (
  formData,
  { modoAutogestion = false, esEdicion = false, requiereFechaFin = false } = {},
) => {
  // ── DATOS PERSONALES ──────────────────────────────────────────────
  if (!modoAutogestion) {
    const e =
      validarNombre(formData.nombre, "El nombre", "personales") ||
      validarNombre(formData.apellido, "El apellido", "personales");
    if (e) return e;

    const cedula = String(formData.cedula ?? "").trim();
    if (!cedula) return err("La cédula es obligatoria.", "personales");
    if (!RE_CEDULA.test(cedula))
      return err(
        "La cédula debe tener exactamente 10 dígitos numéricos.",
        "personales",
      );

    if (formData.fechaNacimiento) {
      if (!fechaValida(formData.fechaNacimiento) || formData.fechaNacimiento.slice(0, 10) > hoyEC())
        return err("La fecha de nacimiento no puede ser futura.", "personales");
    }
  }

  const correoPersonal = String(formData.correoPersonal ?? "").trim();
  if (!correoPersonal) return err("El correo personal es obligatorio.", "personales");
  if (correoPersonal.length > 100) return err("El correo personal no puede superar los 100 caracteres.", "personales");
  if (correoPersonal && !RE_CORREO.test(correoPersonal))
    return err("El correo personal no tiene un formato válido.", "personales");

  const celularPersonal = String(formData.celularPersonal ?? "").trim();
  if (celularPersonal && !RE_CELULAR.test(celularPersonal))
    return err(
      "El celular personal debe tener 10 dígitos y empezar con 09 (solo números).",
      "personales",
    );

  // ── DATOS LABORALES ───────────────────────────────────────────────
  if (!modoAutogestion) {
    if (!formData.idArea) return err("Seleccione un área.", "laborales");
    if (!formData.idCargo) return err("Seleccione un cargo.", "laborales");
    if (!formData.fechaIngreso)
      return err("La fecha de ingreso es obligatoria.", "laborales");
    if (!fechaValida(formData.fechaIngreso)) return err("Indica una fecha de ingreso válida a partir de 1900.", "laborales");
    if (formData.fechaNacimiento && formData.fechaIngreso.slice(0, 10) <= formData.fechaNacimiento.slice(0, 10))
      return err("La fecha de ingreso debe ser posterior al nacimiento.", "laborales");
    if (requiereFechaFin && !formData.fechaFinContrato)
      return err("Este tipo de contrato requiere fecha de fin.", "laborales");
    if (requiereFechaFin && (!fechaValida(formData.fechaFinContrato) || formData.fechaFinContrato.slice(0, 10) <= formData.fechaIngreso.slice(0, 10)))
      return err("La fecha de fin de contrato debe ser válida y posterior al ingreso.", "laborales");

    const correoEmpresa = String(formData.correoEmpresa ?? "").trim();
    if (!correoEmpresa) return err("El correo empresarial es obligatorio.", "laborales");
    if (correoEmpresa.length > 100) return err("El correo empresarial no puede superar los 100 caracteres.", "laborales");
    if (correoEmpresa && !RE_CORREO.test(correoEmpresa))
      return err(
        "El correo de la empresa no tiene un formato válido.",
        "laborales",
      );

    const celularEmpresa = String(formData.celularEmpresa ?? "").trim();
    if (celularEmpresa && !RE_CELULAR.test(celularEmpresa))
      return err(
        "El celular de la empresa debe tener 10 dígitos y empezar con 09 (solo números).",
        "laborales",
      );

    if (
      formData.tieneVacaciones &&
      (!Number.isInteger(Number(formData.diasVacacionesAsignados)) || Number(formData.diasVacacionesAsignados) > 365 || Number(formData.diasVacacionesAsignados) < 0 ||
        Number.isNaN(Number(formData.diasVacacionesAsignados)))
    )
      return err("Los días de vacaciones no son válidos.", "laborales");
  }

  // ── DATOS BANCARIOS (obligatorio: al menos una cuenta) ────────────
  if (!modoAutogestion) {
    if (formData.datosBancarios.length === 0)
      return err("Agregue al menos una cuenta bancaria.", "bancarios");
    for (const [i, b] of formData.datosBancarios.entries()) {
      const n = i + 1;
      if (!b.idBanco)
        return err(`Cuenta bancaria ${n}: seleccione el banco.`, "bancarios");
      if (!b.tipoCuenta)
        return err(
          `Cuenta bancaria ${n}: seleccione el tipo de cuenta.`,
          "bancarios",
        );
      if (!["AHORROS", "CORRIENTE"].includes(String(b.tipoCuenta).trim().toUpperCase()))
        return err(`Cuenta bancaria ${n}: el tipo debe ser Ahorros o Corriente.`, "bancarios");
      const num = String(b.numeroCuenta ?? "").trim();
      if (!num)
        return err(
          `Cuenta bancaria ${n}: ingrese el número de cuenta.`,
          "bancarios",
        );
      if (!RE_SOLO_DIGITOS.test(num))
        return err(
          `Cuenta bancaria ${n}: el número de cuenta solo puede contener dígitos.`,
          "bancarios",
        );
      if (num.length < 3 || num.length > 30) return err(`Cuenta bancaria ${n}: ingrese entre 3 y 30 dígitos.`, "bancarios");
    }

    // ── TÍTULOS ─────────────────────────────────────────────────────
    const cuentasUnicas = formData.datosBancarios.map(b => `${b.idBanco}:${String(b.numeroCuenta).trim()}`);
    if (new Set(cuentasUnicas).size !== cuentasUnicas.length)
      return err("No puedes registrar dos veces la misma cuenta del mismo banco.", "bancarios");

    for (const [i, t] of formData.titulos.entries()) {
      if (vacio(t.nombreTitulo))
        return err(`Título ${i + 1}: ingrese el nombre del título.`, "titulos");
    }
  }

  // ── PERÍODOS DE CONTRATO (solo edición por RRHH) ──────────────────
  // Mismas reglas que el backend: inicio obligatorio, fin >= inicio,
  // sin traslapes y solo el último puede quedar abierto.
  if ((esEdicion || formData.periodosIess?.length) && !modoAutogestion) {
    const periodos = formData.periodosIess;
    if (periodos.some(per => !fechaValida(per.fechaIngreso) || per.fechaSalida && !fechaValida(per.fechaSalida) ||
      formData.fechaNacimiento && per.fechaIngreso.slice(0, 10) <= formData.fechaNacimiento.slice(0, 10)))
      return err("Las fechas de los períodos deben ser válidas y posteriores al nacimiento.", "periodos");
    if (periodos.some((per) => !per.fechaIngreso))
      return err(
        "Cada período de contrato necesita su fecha de inicio.",
        "periodos",
      );

    const ordenados = [...periodos].sort((a, b) =>
      a.fechaIngreso.localeCompare(b.fechaIngreso),
    );
    for (let i = 0; i < ordenados.length; i++) {
      const { fechaIngreso, fechaSalida } = ordenados[i];
      if (fechaSalida && fechaSalida < fechaIngreso)
        return err(
          "En un período de contrato, la fecha de fin no puede ser anterior a la de inicio.",
          "periodos",
        );
      if (i < ordenados.length - 1) {
        if (!fechaSalida)
          return err(
            "Solo el último período de contrato puede quedar sin fecha de fin.",
            "periodos",
          );
        if (fechaSalida >= ordenados[i + 1].fechaIngreso)
          return err(
            "Los períodos de contrato no pueden traslaparse: cada uno debe terminar antes del inicio del siguiente.",
            "periodos",
          );
      }
    }
  }

  // ── CONTACTOS DE EMERGENCIA (obligatorio: al menos uno) ───────────
  if (formData.contactosEmergencia.length === 0)
    return err("Agregue al menos un contacto de emergencia.", "contactos");
  for (const [i, c] of formData.contactosEmergencia.entries()) {
    const n = i + 1;
    const eNombre = validarNombre(
      c.nombre,
      `Contacto ${n}: el nombre`,
      "contactos",
    );
    if (eNombre) return eNombre;
    if (!vacio(c.apellido)) {
      const eApe = validarNombre(
        c.apellido,
        `Contacto ${n}: el apellido`,
        "contactos",
      );
      if (eApe) return eApe;
    }
    if (vacio(c.parentesco))
      return err(`Contacto ${n}: ingrese el parentesco.`, "contactos");
    const tel = String(c.telefono ?? "").trim();
    if (!tel) return err(`Contacto ${n}: ingrese el teléfono.`, "contactos");
    if (!RE_TELEFONO.test(tel))
      return err(
        `Contacto ${n}: el teléfono debe tener entre 7 y 10 dígitos (solo números).`,
        "contactos",
      );
  }

  // ── FAMILIARES ────────────────────────────────────────────────────
  for (const [i, f] of formData.familiares.entries()) {
    const n = i + 1;
    const eNombre = validarNombre(
      f.nombre,
      `Familiar ${n}: el nombre`,
      "familiares",
    );
    if (eNombre) return eNombre;
    const eApe = validarNombre(
      f.apellido,
      `Familiar ${n}: el apellido`,
      "familiares",
    );
    if (eApe) return eApe;
    if (vacio(f.parentesco))
      return err(`Familiar ${n}: seleccione el parentesco.`, "familiares");

    const ced = String(f.cedula ?? "").trim();
    if (ced && !RE_CEDULA.test(ced))
      return err(
        `Familiar ${n}: la cédula debe tener exactamente 10 dígitos.`,
        "familiares",
      );

    const esConyuge =
      String(f.parentesco ?? "")
        .trim()
        .toLowerCase() === "conyuge" ||
      String(f.parentesco ?? "")
        .trim()
        .toLowerCase() === "cónyuge";
    if (esConyuge && !f.fechaUnion)
      return err(`Familiar ${n}: ingrese la fecha de unión.`, "familiares");
    if (!esConyuge && !f.fechaNacimiento)
      return err(
        `Familiar ${n}: ingrese la fecha de nacimiento.`,
        "familiares",
      );
  }

  // Cédulas de familiares: sin repetirse entre sí ni con la del empleado
  for (const [i, f] of formData.familiares.entries()) {
    const conyuge = ["CONYUGE", "CÓNYUGE"].includes(String(f.parentesco).trim().toUpperCase());
    const fecha = conyuge ? f.fechaUnion : f.fechaNacimiento;
    if (!fechaValida(fecha) || fecha.slice(0, 10) > hoyEC())
      return err(`Familiar ${i + 1}: indique una fecha válida que no sea futura.`, "familiares");
    if (conyuge && formData.fechaNacimiento && fecha.slice(0, 10) <= formData.fechaNacimiento.slice(0, 10))
      return err(`Familiar ${i + 1}: la fecha de unión debe ser posterior al nacimiento del colaborador.`, "familiares");
  }
  for (const [i, t] of formData.titulos.entries()) {
    if (t.culminado !== false && t.fechaObtencion && (!fechaValida(t.fechaObtencion) || t.fechaObtencion.slice(0, 10) > hoyEC() ||
      formData.fechaNacimiento && t.fechaObtencion.slice(0, 10) <= formData.fechaNacimiento.slice(0, 10)))
      return err(`Título ${i + 1}: la fecha debe ser válida, posterior al nacimiento y no futura.`, "titulos");
  }

  // (el backend también lo valida; aquí se avisa antes de enviar).
  const cedulasFam = formData.familiares
    .map((f) => f.cedula?.trim())
    .filter(Boolean);
  if (new Set(cedulasFam).size !== cedulasFam.length)
    return err("Hay familiares con la misma cédula.", "familiares");
  if (cedulasFam.includes(formData.cedula?.trim()))
    return err(
      "La cédula de un familiar no puede ser la del empleado.",
      "familiares",
    );

  return null;
};
