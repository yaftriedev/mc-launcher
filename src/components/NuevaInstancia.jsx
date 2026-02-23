import React from "react";

export default function FormContainer({ getVersiones, onSubmit, onCancel }) {
  const [nombre, setNombre] = React.useState("");
  const [version, setVersion] = React.useState("");
  const [versiones, setVersiones] = React.useState([]);

  React.useEffect(() => {
    const cargarVersiones = async () => {
      const data = await getVersiones();
      setVersiones(data);
    };

    cargarVersiones();
  }, [getVersiones]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ nombre, version });
    }
  };

  return (
    <div className="container mt-4 col-md-6">
      <form
        className="p-4 border rounded bg-light"
        onSubmit={handleSubmit}
      >
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Versión</label>
          <select
            className="form-select"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            required
          >
            <option value="">Selecciona una versión</option>
            {versiones.map((v, index) => (
              <option key={index} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-primary">Crear</button>
          <button className="btn btn-danger ms-2" onClick={() => onCancel()}>Cancelar</button>
        </div>

      </form>
    </div>
  );
}