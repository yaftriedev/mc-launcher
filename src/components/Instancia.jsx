import React from "react";
import { versionToText } from '../logic/util.js';

export default function Instancia({ instancia, onOpenFolder, onDelete, onPlay }) {
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
          <button className="btn btn-sm btn-primary" onClick={onOpenFolder}>
            <i className="bi bi-folder-fill fs-6"></i>
          </button>
          <button className="btn btn-sm btn-danger ms-2" onClick={onDelete}>
            <i className="bi bi-trash-fill fs-6"></i>
          </button>
          <button className="btn btn-sm btn-success ms-2" onClick={onPlay}>
            <i className="bi bi-play-circle-fill fs-6"></i>
          </button>
        </div>
      </div>
    </li>
  );
}