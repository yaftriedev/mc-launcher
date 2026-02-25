import React from "react";
import { versionToText, LaunchInstance } from '../util.js';

export default function Instance({ instancia, onDelete }) {
  return (
    <li className="list-group-item w-auto col-10 mt-4 p-3 rounded-3 shadow-sm bg-light">
      <div className="row align-items-center">
        {/* Columna 1: Nombre y subtítulo */}
        <div className="col">
          <div className="fw-bold">{instancia.name}</div>
          <div className="text-muted small">{versionToText(instancia.version)}</div>
        </div>

        {/* Columna 2: Botones */}
        <div className="col-auto">
          <button className="btn btn-sm btn-primary" onClick={() => window.api.openFolder(instancia.name)}>
            <i className="bi bi-folder-fill fs-6"></i>
          </button>
          <button className="btn btn-sm btn-danger ms-2" onClick={onDelete}>
            <i className="bi bi-trash-fill fs-6"></i>
          </button>
          <button className="btn btn-sm btn-success ms-2" onClick={() => LaunchInstance(instancia)}>
            <i className="bi bi-play-circle-fill fs-6"></i>
          </button>
        </div>
      </div>
    </li>
  );
}