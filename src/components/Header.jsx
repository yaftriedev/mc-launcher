import React from "react";
import { loadName, saveName, getMSGInfo } from "../util";

export default function Header() {
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    const _loadName = async () => {
      const storedName = await loadName();
      if (storedName) setName(storedName);
    };
    _loadName();
  }, []);

  const _saveName = async (e) => {
    const newValue = e.target.value;
    setName(newValue);
    await saveName(newValue);
  };

  return (
    <header className="bg-dark text-white py-2 py-md-3">
      <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-center">

        <div className="d-flex flex-column flex-sm-row align-items-center gap-2 mt-2 mt-md-0">
          <h1 className="m-0 fs-4 fs-md-2 text-center text-md-start">
            MC yLauncher
          </h1>
        </div>

        <div className="d-flex flex-sm-row align-items-center gap-2 mt-2 mt-md-0">
          <button className="btn btn-sm btn-primary" onClick={async () => alert(await getMSGInfo())}>
            <i className="bi bi-info-circle-fill fs-6"></i>
          </button>
          <input
            type="text"
            className="form-control w-100 w-sm-auto"
            placeholder="Nombre"
            value={name}
            onChange={_saveName}
          />
        </div>

      </div>
    </header>
  );
}