import React from "react";
import { versionToText, LaunchInstance, getVersionsRelease } from '../util.js';
import { loadInstances, saveInstances } from "../util";

export default function Instance({ instancia, onDelete }) {
  
  const liRef = React.useRef(null);
  
  const [version, setVersion] = React.useState({id: "", type: ""});
  const [versiones, setVersiones] = React.useState([]);
  const [disabled, setDisabled] = React.useState(false);
  
  React.useEffect(() => {
    const cargarVersiones = async () => {
      const data = await getVersionsRelease();
      setVersiones(data);
    };

    cargarVersiones();

    if (instancia.version) setVersion({id: instancia.version.id, type: instancia.version.type});

  }, [getVersionsRelease]);

  const startGame = async () => {
    console.log(`Iniciando instancia ${instancia.name} con versión ${version.id} (${version.type})`);
    LaunchInstance({
      name: instancia.name,
      version: version
    });
    setDisabled(true);
    
    const instances = await loadInstances();

    if (version.id === instancia.version?.id) return;

    const updatedInstances = instances.map(instance => {
      if (instance.name === instancia.name) {
        return { ...instance, version: version };
      }
      return instance;
    });

    await saveInstances(updatedInstances);

  }

  window.api.onMCClosed((event, data) => setDisabled(false));
  
  return (
    <li ref={liRef} className="list-group-item w-auto col-10 mt-4 p-3 rounded-3 shadow-sm bg-light">
      <div className="row align-items-center">
        {/* Columna 1: Nombre y subtítulo */}
        <div className="col">
          <div className="fs-5">{instancia.name}</div>
        </div>

        {/* Columna 2: Botones */}
        <div className="col-auto d-flex align-items-center">
          <select
            className="form-select"
            disabled={disabled}
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
          <button className="btn btn-sm btn-primary ms-2" onClick={() => window.api.openFolder(instancia.name)}>
            <i className="bi bi-folder-fill fs-6"></i>
          </button>
          <button className="btn btn-sm btn-danger ms-2" onClick={onDelete} disabled={disabled}>
            <i className="bi bi-trash-fill fs-6"></i>
          </button>
          <button className="btn btn-sm btn-success ms-2" onClick={startGame} disabled={disabled}>
            <i className="bi bi-play-circle-fill fs-6"></i>
          </button>
        </div>
      </div>
    </li>
  );
}