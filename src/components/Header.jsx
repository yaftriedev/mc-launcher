import React from "react";

export default function Header() {
  return (
    <header className="bg-dark text-white py-2 py-md-3">
      <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-center">

        <div className="d-flex flex-column flex-sm-row align-items-center gap-2 mt-2 mt-md-0">
          <h1 className="m-0 fs-4 fs-md-2 text-center text-md-start">
            MC yLauncher
          </h1>
        </div>

        <div className="d-flex flex-sm-row align-items-center gap-2 mt-2 mt-md-0">
          <button className="btn btn-sd btn-secondary">
            <i className="bi bi-gear-fill fs-6"></i>
          </button>
          <input
            type="text"
            className="form-control w-100 w-sm-auto"
            placeholder="Nombre"
          />
        </div>

      </div>
    </header>
  );
}