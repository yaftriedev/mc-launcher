import React from 'react';

export default function CreateInstanceBtn({onClick}) {
  return (
    <div className="container d-flex justify-content-end mt-4">
      <button className="btn btn-primary" onClick={onClick}>
        <i className="bi bi-plus-lg"></i> Nueva Instancia
      </button>
    </div>
  )
}