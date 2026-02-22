import React from 'react';
import Instancia from './components/Instancia.jsx';
import Header from './components/Header.jsx';
import NuevaInstanciaBoton from './components/NuevaInstanciaBoton.jsx';
import NuevaInstancia from './components/NuevaInstancia.jsx';

export default function App() {
  
  const [instancias, setInstancias] = React.useState([
    { nombre: "Instancia 1", version: "Versión 1.0" },
    { nombre: "Instancia 2", version: "Versión 1.1" },
    { nombre: "Instancia 3", version: "Versión 1.2" },
  ]);

  const [showNuevaInstancia, setShowNuevaInstancia] = React.useState(false);

  const onOpenFolder = (instancia) => {
    console.log("Instancia seleccionada:", instancia);
  }

  const onDelete = (instancia) => {
    const index = instancias.findIndex(i => i === instancia);
    if (index !== -1 && window.confirm(`¿Estás seguro de eliminar ${instancia.nombre}?`)) {
      setInstancias(instancias.filter((_, i) => i !== index));
    }
  }

  const onPlay = (instancia) => {
    console.log("Instancia seleccionada para jugar:", instancia);
  }

  const onAddInstancia = () => {
    const nuevaInstancia = { nombre: "Nueva Instancia", version: "Versión 1.0" };
    setInstancias([...instancias, nuevaInstancia]);
  }
  
  return (
    <div>
      <Header />
      <div className="container">
        {instancias.length === 0 ? (
          <div className="alert alert-info mt-4">No hay versiones disponibles.</div>
        ) : (
          <ul className="list-group mt-4 d-flex justify-content-center">
            {/* Instancias disponibles: */}
            {instancias.map((instancia, index) => (
              <Instancia
                instancia={instancia}
                onOpenFolder={() => onOpenFolder(instancia)}
                onDelete={() => onDelete(instancia)}
                onPlay={() => onPlay(instancia)}
              />
            ))}
          </ul>
        )}
        {/* Boton de agregar nueva instancia */}
        
        <NuevaInstanciaBoton onAddInstancia={() => setShowNuevaInstancia(true)} />
        <NuevaInstancia getVersiones={() => Promise.resolve(["1.0", "1.1", "1.2"])} 
          onSubmit={(instancia) => {
            setInstancias([...instancias, instancia]);
            setShowNuevaInstancia(false);
          }} />
      
      </div>
    </div>
  );
}