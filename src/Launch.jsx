import React, { useState, useEffect } from "react";

export default function Launch() {
  
  const [name, setName] = useState("Steve")
  const [version, setVersion] = useState({id: "", type: ""});
  const [versiones, setVersiones] = useState([]);
  const [versionesInstaladas, setVersionesInstaladas] = useState([])
  const [disabled, setDisabled] = useState(false);
  const [log, setLog] = useState([]);
  const [showLogs, setShowLogs] = useState(true);
  
  // Cargar el nombre mediante await window.api.loadName()
  useEffect(() => {
    const loadName = async () => {
      const storedName = await window.api.loadName();
      if (storedName) setName(storedName);
    };
    loadName();
  }, []);

  // cargar versiones mediante window.api.getVersions()
  useEffect(() => {
    const cargarVersiones = async () => {
      const data = await window.api.getVersions();
      setVersiones(data);
    };

    cargarVersiones();
  }, []);

  // Cargar versiones instaladas
  useEffect(() => {
    const cargarVersiones = async () => {
        const versionesInstaladas = await window.api.getVersionsInstalled();
        setVersionesInstaladas(versionesInstaladas);
        console.log(versionesInstaladas)
    };

    cargarVersiones();
  }, []);

  // window.api.onMCClosed((event, data) => setDisabled(false));
  useEffect(() => {
    const removeListener = window.api.onLog((msg) => {
      if (msg === "MC Closed") setDisabled(false);

      if (showLogs) setLog(prev => [msg, ...prev]);
    });

    return removeListener;
  }, [showLogs]);

  // Guardar el nombre mediante window.api.saveName(newValue)
  const _saveName = async (e) => {
    const newValue = e.target.value;
    setName(newValue);
    await window.api.saveName(newValue);
  };

  // Empezar el juego usando window.api.launchInstance y setDisabled(true) para desactivar el boton
  const startGame = async () => {  
    window.api.launchInstance({ 
      name: "",
      versionId: version.id,
      versionType: version.type,
      url: version.url,
      username: name
    });

    setDisabled(true);
  }
  
  return (
    <div>
      <div className=" d-flex align-items-center">
        
        <input
          type="text"
          className="form-control w-100 w-sm-auto m-2"
          placeholder="Nombre"
          value={name}
          onChange={_saveName}
        />
        
        <select
          className="form-select m-2"
          disabled={disabled}
          value={JSON.stringify(version)}
          onChange={(e) => setVersion(JSON.parse(e.target.value))}
          required
        >
          {versiones
            .map(version => (
            <option 
              key={version.id}
              value={JSON.stringify({ id: version.id, type: version.type, url: version.url })}>
                {version.type.charAt(0).toUpperCase() + version.type.slice(1) } {version.id} {versionesInstaladas.includes(version.id) ? "Instalada" : ""}
            </option>
          ))}
        </select>
        <button className="btn btn-sm btn-success m-2" onClick={startGame} disabled={disabled}>
          <i className="bi bi-play-circle-fill fs-6"></i>
        </button>
        <button className="btn btn-sm btn-warning" onClick={() => setLog([])}>
          <i className="bi bi-trash3-fill fs-6"></i>
        </button>
        <button className="btn btn-sm btn-primary m-2" onClick={() => setShowLogs(false)} hidden={!showLogs}>
          <i className="bi bi-text-left fs-6"></i>
        </button>
        <button className="btn btn-sm btn-primary m-2 opacity-50" onClick={() => setShowLogs(true)} hidden={showLogs}>
          <i className="bi bi-text-left fs-6"></i>
        </button>
      </div>
      <div className="m-2">
        {log.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>

    </div>
  );
}