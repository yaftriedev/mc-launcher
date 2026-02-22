import React from 'react';

export default function NuevaInstanciaBoton({onAddInstancia}) {
  return (
    <div className="container d-flex justify-content-end mt-4">
      <button className="btn btn-primary" onClick={onAddInstancia}>
        <i className="bi bi-plus-lg"></i> Nueva Instancia
      </button>
    </div>
  )
}