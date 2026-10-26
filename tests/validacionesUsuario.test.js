import test from "node:test";
import assert from "node:assert/strict";
import { validarUsuario } from "../src/utils/validacionesUsuario.js";

const expediente = () => ({
  nombre: "Ana", apellido: "Pérez", cedula: "0123456789", correoPersonal: "ana@example.com",
  correoEmpresa: "ana@empresa.test", idArea: 1, idCargo: 1, fechaIngreso: "2020-01-01", fechaNacimiento: "2000-01-01",
  tieneVacaciones: true, diasVacacionesAsignados: 15, periodosIess: [], titulos: [], familiares: [],
  contactosEmergencia: [{ nombre: "Luis", parentesco: "HERMANO", telefono: "0991234567" }],
  datosBancarios: [{ idBanco: 1, tipoCuenta: "Ahorros", numeroCuenta: "123456" }],
});
test("expediente completo válido", () => assert.equal(validarUsuario(expediente()), null));
test("nacimiento futuro o fecha inválida", () => {
  for (const fecha of ["2099-01-01", "2020-02-31", "0001-01-01"])
    assert.equal(validarUsuario({ ...expediente(), fechaNacimiento: fecha }).seccion, "personales");
});
test("ingreso posterior al nacimiento", () => assert.equal(validarUsuario({ ...expediente(), fechaIngreso: "1999-01-01" }).seccion, "laborales"));
test("saldo asignado entero y dentro de rango", () => {
  for (const dias of [-1, 366, 1.5]) assert.equal(validarUsuario({ ...expediente(), diasVacacionesAsignados: dias }).seccion, "laborales");
});
test("conservar cuenta y contacto", () => {
  assert.equal(validarUsuario({ ...expediente(), datosBancarios: [] }).seccion, "bancarios");
  assert.equal(validarUsuario({ ...expediente(), contactosEmergencia: [] }).seccion, "contactos");
});
test("cuentas con longitud y tipo válidos", () => {
  for (const cuenta of [{ idBanco: 1, tipoCuenta: "Ahorros", numeroCuenta: "12" }, { idBanco: 1, tipoCuenta: "Otro", numeroCuenta: "123456" }])
    assert.equal(validarUsuario({ ...expediente(), datosBancarios: [cuenta] }).seccion, "bancarios");
});
test("fechas de familiares y títulos", () => {
  assert.equal(validarUsuario({ ...expediente(), familiares: [{ nombre: "Luis", apellido: "Pérez", parentesco: "HIJO", fechaNacimiento: "2099-01-01" }] }).seccion, "familiares");
  assert.equal(validarUsuario({ ...expediente(), titulos: [{ nombreTitulo: "Ingeniería", fechaObtencion: "2099-01-01" }] }).seccion, "titulos");
});
