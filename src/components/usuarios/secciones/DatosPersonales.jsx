import React from "react";

const DatosPersonales = ({ formData, handleChange, catalogos = {} }) => {
  return (
    <div>
      <h5 className="mb-4 text-secondary">Datos Personales</h5>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Nombre *</label>
          <input
            type="text"
            className="form-control"
            name="nombre"
            value={formData.nombre || ""}
            onChange={handleChange}
            placeholder="Ej. Juan Carlos"
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Apellido *</label>
          <input
            type="text"
            className="form-control"
            name="apellido"
            value={formData.apellido || ""}
            onChange={handleChange}
            placeholder="Ej. Pérez Gómez"
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Cédula *</label>
          <input
            type="text"
            className="form-control"
            name="cedula"
            value={formData.cedula || ""}
            onChange={handleChange}
            maxLength={10}
            placeholder="10 dígitos"
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Fecha Nacimiento</label>
          <input
            type="date"
            className="form-control"
            name="fechaNacimiento"
            value={formData.fechaNacimiento || ""}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Género</label>
          <select
            className="form-select"
            name="idGenero"
            value={formData.idGenero || ""}
            onChange={handleChange}
          >
            <option value="">Seleccione...</option>
            {catalogos.generos?.map((g) => (
              <option key={g.idGenero || g.id} value={g.idGenero || g.id}>
                {g.nombre || g.descripcion}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Estado Civil</label>
          <select
            className="form-select"
            name="idEstadoCivil"
            value={formData.idEstadoCivil || ""}
            onChange={handleChange}
          >
            <option value="">Seleccione...</option>
            {catalogos.estadosCiviles?.map((e) => (
              <option
                key={e.idEstadoCivil || e.id}
                value={e.idEstadoCivil || e.id}
              >
                {e.nombre || e.descripcion}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Etnia</label>
          <select
            className="form-select"
            name="idEtnia"
            value={formData.idEtnia || ""}
            onChange={handleChange}
          >
            <option value="">Seleccione...</option>
            {catalogos.etnias?.map((et) => (
              <option key={et.idEtnia || et.id} value={et.idEtnia || et.id}>
                {et.nombre || et.descripcion}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Celular Personal</label>
          <input
            type="text"
            className="form-control"
            name="celularPersonal"
            value={formData.celularPersonal || ""}
            onChange={handleChange}
            placeholder="0991234567"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Correo Personal</label>
          <input
            type="email"
            className="form-control"
            name="correoPersonal"
            value={formData.correoPersonal || ""}
            onChange={handleChange}
            placeholder="correo@personal.com"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Dirección</label>
          <input
            type="text"
            className="form-control"
            name="direccion"
            value={formData.direccion || ""}
            onChange={handleChange}
            placeholder="Calle Principal y Secundaria"
          />
        </div>
      </div>
    </div>
  );
};

export default DatosPersonales;
