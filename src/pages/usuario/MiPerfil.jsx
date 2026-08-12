import AppLayout from "../../components/layout/AppLayout";
import SectionHeader from "../../components/layout/SectionHeader";
import { usuarioActualMock } from "../../mocks/usuarioActualMock";

function Campo({ label, valor }) {
  return (
    <div className="col-12 col-md-6 col-lg-4 mb-3">
      <p className="text-uppercase text-muted fw-bold small mb-1">{label}</p>
      <p className="mb-0 text-dark fw-medium">{valor || "N/A"}</p>
    </div>
  );
}

function MiPerfil() {
  // TODO: cuando exista backend, reemplazar por el usuario autenticado
  const usuario = usuarioActualMock;

  // Render para iniciales si no tiene foto
  const iniciales = (usuario.nombres || "??")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <AppLayout>
      <SectionHeader titulo="Mi Perfil" volverA="/dashboard" />

      <div className="container my-4 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                {/* ENCABEZADO DE PERFIL CON FOTO / AVATAR */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  {usuario.fotoPreview || usuario.fotoUrl ? (
                    <img
                      src={usuario.fotoPreview || usuario.fotoUrl}
                      alt="Foto de perfil"
                      className="rounded-circle object-fit-cover border border-2 border-primary shadow-sm"
                      style={{ width: "64px", height: "64px" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-brand-soft text-brand d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: "64px",
                        height: "64px",
                        fontSize: "1.35rem",
                      }}
                    >
                      {iniciales}
                    </div>
                  )}
                  <div>
                    <h5 className="fw-bold mb-0">{usuario.nombres}</h5>
                    <p className="text-muted mb-0 small">
                      {usuario.cargo || usuario.nombreCargo}{" "}
                      {usuario.departamento ? `· ${usuario.departamento}` : ""}
                    </p>
                  </div>
                </div>

                <hr className="my-4 text-muted opacity-25" />

                {/* 1. INFORMACIÓN PERSONAL */}
                <h6 className="fw-bold text-primary mb-3">
                  1. Información Personal
                </h6>
                <div className="row">
                  <Campo label="Nombres completos" valor={usuario.nombres} />
                  <Campo label="Cédula" valor={usuario.cedula} />
                  <Campo
                    label="Fecha de nacimiento"
                    valor={usuario.fechaNacimiento}
                  />
                  <Campo
                    label="Correo personal"
                    valor={usuario.correoPersonal}
                  />
                  <Campo
                    label="Género"
                    valor={usuario.genero || usuario.idGenero}
                  />
                  <Campo
                    label="Estado civil"
                    valor={usuario.estadoCivil || usuario.idEstadoCivil}
                  />
                  <Campo
                    label="Etnia"
                    valor={usuario.etnia || usuario.idEtnia}
                  />
                </div>

                <hr className="my-4 text-muted opacity-25" />

                {/* 2. DATOS LABORALES Y UBICACIÓN */}
                <h6 className="fw-bold text-primary mb-3">
                  2. Datos Laborales y Ubicación
                </h6>
                <div className="row">
                  <Campo label="Correo empresa" valor={usuario.correoEmpresa} />
                  <Campo
                    label="Cargo"
                    valor={usuario.cargo || usuario.nombreCargo}
                  />
                  <Campo label="Departamento" valor={usuario.departamento} />
                  <Campo
                    label="Fecha de ingreso"
                    valor={usuario.fechaIngreso}
                  />
                  <Campo
                    label="Dirección de domicilio"
                    valor={usuario.direccion}
                  />
                  <Campo
                    label="Ciudad"
                    valor={usuario.ciudad || usuario.idCiudad}
                  />
                  <Campo
                    label="Celular personal"
                    valor={usuario.celularPersonal}
                  />
                  <Campo
                    label="Celular empresa"
                    valor={usuario.celularEmpresa}
                  />
                </div>

                <hr className="my-4 text-muted opacity-25" />

                {/* 3. INFORMACIÓN FAMILIAR Y CONTACTOS */}
                <h6 className="fw-bold text-primary mb-3">
                  3. Información Familiar y Contactos
                </h6>

                {/* Hijos */}
                <div className="mb-3">
                  <p className="text-uppercase text-muted fw-bold small mb-2">
                    Hijos Registrados
                  </p>
                  {usuario.familiares && usuario.familiares.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm table-borderless bg-light rounded align-middle">
                        <thead>
                          <tr className="text-muted small border-bottom">
                            <th>Nombre del hijo/a</th>
                            <th>Fecha de nacimiento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usuario.familiares.map((fam, idx) => (
                            <tr key={idx}>
                              <td className="fw-medium">{fam.nombreHijo}</td>
                              <td>{fam.fechaNacimiento}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="small text-muted mb-0">No registra hijos.</p>
                  )}
                </div>

                {/* Contactos de emergencia */}
                <div className="mb-2">
                  <p className="text-uppercase text-muted fw-bold small mb-2">
                    Contactos de Emergencia
                  </p>
                  {usuario.contactosEmergencia &&
                  usuario.contactosEmergencia.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm table-borderless bg-light rounded align-middle">
                        <thead>
                          <tr className="text-muted small border-bottom">
                            <th>Nombre</th>
                            <th>Parentesco / Relación</th>
                            <th>Teléfono</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usuario.contactosEmergencia.map((c, idx) => (
                            <tr key={idx}>
                              <td className="fw-medium">{c.nombre}</td>
                              <td>{c.parentesco || c.relacion}</td>
                              <td>{c.numeroCelular || c.telefono}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="small text-muted mb-0">
                      No registra contactos de emergencia.
                    </p>
                  )}
                </div>

                <hr className="my-4 text-muted opacity-25" />

                {/* 4. DATOS BANCARIOS Y DÉCIMOS */}
                <h6 className="fw-bold text-primary mb-3">
                  4. Datos Bancarios y Décimos
                </h6>
                <div className="row mb-3">
                  <Campo
                    label="¿Acumula décimos?"
                    valor={
                      String(usuario.acumulaDecimos) === "1" ||
                      usuario.acumulaDecimos === 1
                        ? "Sí"
                        : "No"
                    }
                  />
                </div>

                <p className="text-uppercase text-muted fw-bold small mb-2">
                  Cuentas Bancarias
                </p>
                {usuario.datosBancarios && usuario.datosBancarios.length > 0 ? (
                  <div className="table-responsive mb-2">
                    <table className="table table-sm table-borderless bg-light rounded align-middle">
                      <thead>
                        <tr className="text-muted small border-bottom">
                          <th>Banco</th>
                          <th>N° de Cuenta</th>
                          <th>Tipo de Cuenta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuario.datosBancarios.map((b, idx) => (
                          <tr key={idx}>
                            <td className="fw-medium">
                              {b.banco || b.idBanco}
                            </td>
                            <td>{b.numeroCuenta}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {b.tipoCuenta}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="small text-muted mb-0">
                    No registra cuentas bancarias.
                  </p>
                )}

                <hr className="my-4 text-muted opacity-25" />

                {/* 5. FORMACIÓN ACADÉMICA */}
                <h6 className="fw-bold text-primary mb-3">
                  5. Formación Académica
                </h6>
                {usuario.titulos && usuario.titulos.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm table-borderless bg-light rounded align-middle">
                      <thead>
                        <tr className="text-muted small border-bottom">
                          <th>Título Obtenido</th>
                          <th>Institución Educativa Superior</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuario.titulos.map((t, idx) => (
                          <tr key={idx}>
                            <td className="fw-medium">{t.titulo}</td>
                            <td>{t.institucionEducativaSuperior || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="small text-muted mb-0">
                    No registra títulos académicos.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default MiPerfil;
