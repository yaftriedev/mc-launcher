import React from "react";
import { getVersionsRelease, versionToText } from '../util.js';

export default function CreateInstanceForm({ onSubmit, onCancel }) {
  const [name, setName] = React.useState("");
  const [version, setVersion] = React.useState({id: "", type: ""});
  const [versiones, setVersiones] = React.useState([]);

  React.useEffect(() => {
    const cargarVersiones = async () => {
      const data = await getVersionsRelease();
      setVersiones(data);
    };

    cargarVersiones();
  }, [getVersionsRelease]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(name, version);
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Versión</label>
          <select
            className="form-select"
            value={JSON.stringify(version)}
            onChange={(e) => setVersion(JSON.parse(e.target.value))}
            required
          >
            <option value="">Selecciona una versión</option>
            {versiones.map(version => (
              <option 
                key={version.id}
                value={JSON.stringify({ id: version.id, type: version.type })}>
                  {versionToText(version)}
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