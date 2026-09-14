import React from "react";

export default function Header() {
  return (
    <header className="bg-dark text-white py-3">
      <div className="container-fluid d-flex flex-wrap justify-content-between align-items-center">

        <div className="d-flex flex-column align-items-center">
          <h1 className="m-0 fs-4 text-center text-md-start">
            MC yLauncher
          </h1>
        </div>

        <div className="d-flex align-items-center">
          <button className="btn btn-sm btn-primary me-2" onClick={() => window.api.openFolder()}>
            <i className="bi bi-folder-fill fs-6"></i>
          </button>
          <button className="btn btn-sm btn-primary" onClick={() => window.api.openRepoGithub()}>
            <i className="bi bi-info-circle-fill fs-6"></i>
          </button>
        </div>

      </div>
    </header>
  );
}