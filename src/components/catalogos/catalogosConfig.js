import * as api from "../../services/catalogosService";

// Cada entrada describe un catálogo para <CatalogoCrud config={...} />.
// Ver la documentación del objeto `config` en CatalogoCrud.jsx.

const aOpciones = (lista, valor, etiqueta) =>
  lista.map((item) => ({ value: String(item[valor]), label: item[etiqueta] }));

// ---------------------------------------------------------------------------
// Catálogos simples: solo Nombre (+ Estado)
// ---------------------------------------------------------------------------
const catalogoSimple = ({
  key,
  titulo,
  descripcion,
  singular,
  nuevoTexto,
  vacioTexto,
  campoId,
  listar,
  crear,
  actualizar,
  maxLength = 100,
  placeholder = "Escribe el nombre",
  ayuda,
}) => ({
  key,
  titulo,
  descripcion,
  nuevoTexto,
  editarTexto: `Editar ${singular}`,
  vacioTexto,
  listar,
  columnas: () => [
    { name: "Nombre", selector: (f) => f.nombre, sortable: true, grow: 2 },
  ],
  textoBusqueda: (f) => [f.nombre],
  campos: () => [
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      maxLength,
      placeholder,
      ayuda,
    },
  ],
  valoresIniciales: (fila) => ({ nombre: fila?.nombre ?? "" }),
  guardar: (v, fila) =>
    fila
      ? actualizar(fila[campoId], v.nombre.trim(), fila.estado)
      : crear(v.nombre.trim()),
  alternar: (fila) => actualizar(fila[campoId], fila.nombre, !fila.estado),
});

const areas = catalogoSimple({
  key: "areas",
  titulo: "Áreas",
  descripcion: "Departamentos de la empresa. Cada cargo pertenece a un área.",
  singular: "área",
  nuevoTexto: "Nueva área",
  vacioTexto: "Todavía no hay áreas registradas.",
  campoId: "idArea",
  listar: api.getAreasAdmin,
  crear: api.crearArea,
  actualizar: api.actualizarArea,
});

const bancos = catalogoSimple({
  key: "bancos",
  titulo: "Bancos",
  descripcion: "Bancos y cooperativas disponibles para los datos bancarios.",
  singular: "banco",
  nuevoTexto: "Nuevo banco",
  vacioTexto: "Todavía no hay bancos registrados.",
  campoId: "idBanco",
  listar: api.getBancosAdmin,
  crear: api.crearBanco,
  actualizar: api.actualizarBanco,
});

const etnias = catalogoSimple({
  key: "etnias",
  titulo: "Etnias",
  descripcion: "Opciones de autoidentificación étnica del perfil.",
  singular: "etnia",
  nuevoTexto: "Nueva etnia",
  vacioTexto: "Todavía no hay etnias registradas.",
  campoId: "idEtnia",
  listar: api.getEtniasAdmin,
  crear: api.crearEtnia,
  actualizar: api.actualizarEtnia,
  maxLength: 50,
});

const estadosCiviles = catalogoSimple({
  key: "estados-civiles",
  titulo: "Estados civiles",
  descripcion: "Opciones de estado civil del perfil.",
  singular: "estado civil",
  nuevoTexto: "Nuevo estado civil",
  vacioTexto: "Todavía no hay estados civiles registrados.",
  campoId: "idEstadoCivil",
  listar: api.getEstadosCivilesAdmin,
  crear: api.crearEstadoCivil,
  actualizar: api.actualizarEstadoCivil,
  maxLength: 30,
});

const generos = catalogoSimple({
  key: "generos",
  titulo: "Géneros",
  descripcion: "Opciones de género del perfil.",
  singular: "género",
  nuevoTexto: "Nuevo género",
  vacioTexto: "Todavía no hay géneros registrados.",
  campoId: "idGenero",
  listar: api.getGenerosAdmin,
  crear: api.crearGenero,
  actualizar: api.actualizarGenero,
  maxLength: 30,
});

const tiposSangre = catalogoSimple({
  key: "tipos-sangre",
  titulo: "Tipos de sangre",
  descripcion: "Grupos sanguíneos disponibles en el perfil.",
  singular: "tipo de sangre",
  nuevoTexto: "Nuevo tipo de sangre",
  vacioTexto: "Todavía no hay tipos de sangre registrados.",
  campoId: "idTipoSangre",
  listar: api.getTiposSangreAdmin,
  crear: api.crearTipoSangre,
  actualizar: api.actualizarTipoSangre,
  maxLength: 5,
  placeholder: "Ej. O+",
  ayuda: "Solo A+, A-, B+, B-, AB+, AB-, O+ u O-.",
});

// ---------------------------------------------------------------------------
// Cargos: pertenecen a un Área
// ---------------------------------------------------------------------------
const nombreDe = (lista, campoId, id) =>
  lista.find((x) => String(x[campoId]) === String(id))?.nombre ?? "—";

const cargos = {
  key: "cargos",
  titulo: "Cargos",
  descripcion: "Puestos de trabajo. Cada cargo pertenece a un área.",
  nuevoTexto: "Nuevo cargo",
  editarTexto: "Editar cargo",
  vacioTexto: "Todavía no hay cargos registrados.",
  listar: api.getCargosAdmin,
  dependencias: { areas: api.getAreasAdmin },
  columnas: (deps) => [
    { name: "Cargo", selector: (f) => f.nombre, sortable: true, grow: 2 },
    {
      name: "Área",
      selector: (f) => nombreDe(deps.areas, "idArea", f.idArea),
      sortable: true,
    },
  ],
  filtros: [
    {
      key: "idArea",
      placeholder: "Todas las áreas",
      opciones: (deps) => aOpciones(deps.areas, "idArea", "nombre"),
      predicado: (f, valor) => String(f.idArea) === valor,
    },
  ],
  textoBusqueda: (f, deps) => [f.nombre, nombreDe(deps.areas, "idArea", f.idArea)],
  campos: (deps, v) => [
    {
      name: "idArea",
      label: "Área",
      type: "select",
      placeholder: "Selecciona un área",
      // Solo áreas activas (más la actual del cargo, aunque esté inactiva)
      opciones: aOpciones(
        deps.areas.filter(
          (a) => a.estado || String(a.idArea) === String(v.idArea),
        ),
        "idArea",
        "nombre",
      ),
    },
    {
      name: "nombre",
      label: "Nombre del cargo",
      type: "text",
      maxLength: 100,
      placeholder: "Escribe el nombre del cargo",
    },
  ],
  valoresIniciales: (fila) => ({
    idArea: fila ? String(fila.idArea) : "",
    nombre: fila?.nombre ?? "",
  }),
  guardar: (v, fila) =>
    fila
      ? api.actualizarCargo(fila.idCargo, v.nombre.trim(), Number(v.idArea), fila.estado)
      : api.crearCargo(v.nombre.trim(), Number(v.idArea)),
  alternar: (fila) =>
    api.actualizarCargo(fila.idCargo, fila.nombre, fila.idArea, !fila.estado),
};

// ---------------------------------------------------------------------------
// Provincias: pertenecen a una Región
// ---------------------------------------------------------------------------
const provincias = {
  key: "provincias",
  titulo: "Provincias",
  descripcion: "Cada provincia pertenece a una región del país.",
  nuevoTexto: "Nueva provincia",
  editarTexto: "Editar provincia",
  vacioTexto: "Todavía no hay provincias registradas.",
  listar: api.getProvinciasAdmin,
  dependencias: { regiones: api.getRegiones },
  columnas: (deps) => [
    { name: "Provincia", selector: (f) => f.nombre, sortable: true, grow: 2 },
    {
      name: "Región",
      selector: (f) =>
        f.nombreRegion ?? nombreDe(deps.regiones, "idRegion", f.idRegion),
      sortable: true,
    },
  ],
  filtros: [
    {
      key: "idRegion",
      placeholder: "Todas las regiones",
      opciones: (deps) => aOpciones(deps.regiones, "idRegion", "nombre"),
      predicado: (f, valor) => String(f.idRegion) === valor,
    },
  ],
  textoBusqueda: (f, deps) => [
    f.nombre,
    f.nombreRegion ?? nombreDe(deps.regiones, "idRegion", f.idRegion),
  ],
  campos: (deps) => [
    {
      name: "idRegion",
      label: "Región",
      type: "select",
      placeholder: "Selecciona una región",
      opciones: aOpciones(deps.regiones, "idRegion", "nombre"),
    },
    {
      name: "nombre",
      label: "Nombre de la provincia",
      type: "text",
      maxLength: 100,
      placeholder: "Escribe el nombre de la provincia",
    },
  ],
  valoresIniciales: (fila) => ({
    idRegion: fila ? String(fila.idRegion) : "",
    nombre: fila?.nombre ?? "",
  }),
  guardar: (v, fila) =>
    fila
      ? api.actualizarProvincia(fila.idProvincia, v.nombre.trim(), Number(v.idRegion), fila.estado)
      : api.crearProvincia(v.nombre.trim(), Number(v.idRegion)),
  alternar: (fila) =>
    api.actualizarProvincia(fila.idProvincia, fila.nombre, fila.idRegion, !fila.estado),
};

// ---------------------------------------------------------------------------
// Ciudades: Región → Provincia → Ciudad (filtros y formulario en cascada)
// ---------------------------------------------------------------------------
const ciudades = {
  key: "ciudades",
  titulo: "Ciudades",
  descripcion: "Cada ciudad pertenece a una provincia, y cada provincia a una región.",
  nuevoTexto: "Nueva ciudad",
  editarTexto: "Editar ciudad",
  vacioTexto: "Todavía no hay ciudades registradas.",
  listar: api.getCiudadesAdmin,
  dependencias: {
    regiones: api.getRegiones,
    provincias: api.getProvinciasAdmin,
  },
  columnas: () => [
    { name: "Ciudad", selector: (f) => f.nombre, sortable: true, grow: 2 },
    {
      name: "Provincia",
      selector: (f) => f.provincia?.nombre ?? "—",
      sortable: true,
    },
    {
      name: "Región",
      selector: (f) => f.provincia?.nombreRegion ?? "—",
      sortable: true,
    },
  ],
  filtros: [
    {
      key: "idRegion",
      placeholder: "Todas las regiones",
      resetea: ["idProvincia"],
      opciones: (deps) => aOpciones(deps.regiones, "idRegion", "nombre"),
      predicado: (f, valor) => String(f.provincia?.idRegion) === valor,
    },
    {
      key: "idProvincia",
      placeholder: "Todas las provincias",
      // Si hay una región elegida, solo se ofrecen las provincias de esa región
      opciones: (deps, filtros) =>
        aOpciones(
          deps.provincias.filter(
            (p) => !filtros.idRegion || String(p.idRegion) === filtros.idRegion,
          ),
          "idProvincia",
          "nombre",
        ),
      predicado: (f, valor) => String(f.idProvincia) === valor,
    },
  ],
  textoBusqueda: (f) => [
    f.nombre,
    f.provincia?.nombre,
    f.provincia?.nombreRegion,
  ],
  campos: (deps, v) => [
    {
      name: "idRegion",
      label: "Región",
      type: "select",
      placeholder: "Selecciona una región",
      resetea: ["idProvincia"],
      opciones: aOpciones(deps.regiones, "idRegion", "nombre"),
    },
    {
      name: "idProvincia",
      label: "Provincia",
      type: "select",
      placeholder: v.idRegion
        ? "Selecciona una provincia"
        : "Primero elige la región",
      deshabilitado: !v.idRegion,
      // Solo provincias de la región elegida; activas (más la actual si está inactiva)
      opciones: aOpciones(
        deps.provincias.filter(
          (p) =>
            String(p.idRegion) === String(v.idRegion) &&
            (p.estado || String(p.idProvincia) === String(v.idProvincia)),
        ),
        "idProvincia",
        "nombre",
      ),
    },
    {
      name: "nombre",
      label: "Nombre de la ciudad",
      type: "text",
      maxLength: 100,
      placeholder: "Escribe el nombre de la ciudad",
    },
  ],
  valoresIniciales: (fila) => ({
    idRegion: fila ? String(fila.provincia?.idRegion ?? "") : "",
    idProvincia: fila ? String(fila.idProvincia) : "",
    nombre: fila?.nombre ?? "",
  }),
  guardar: (v, fila) =>
    fila
      ? api.actualizarCiudad(fila.idCiudad, v.nombre.trim(), Number(v.idProvincia), fila.estado)
      : api.crearCiudad(v.nombre.trim(), Number(v.idProvincia)),
  alternar: (fila) =>
    api.actualizarCiudad(fila.idCiudad, fila.nombre, fila.idProvincia, !fila.estado),
};

export const CATALOGOS = {
  areas,
  cargos,
  bancos,
  provincias,
  ciudades,
  etnias,
  "estados-civiles": estadosCiviles,
  generos,
  "tipos-sangre": tiposSangre,
};
