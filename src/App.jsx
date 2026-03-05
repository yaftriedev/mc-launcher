import React from 'react';

import Instance from './components/Instance.jsx';
import Header from './components/Header.jsx';
import CreateInstance from './components/CreateInstance.jsx';
import ProgressBar from './components/ProgresiveBar.jsx';

import { loadInstances, createInstance, saveInstances } from './util.js';

export default function App() {
  
  // Estado para las instancias y el formulario de nueva instancia
  const [instancias, setInstancias] = React.useState([]);

  // Cargar instancias al iniciar la aplicación
  React.useEffect(() => {
    const _loadInstances = async () => {
      const storedInstances = await loadInstances();
      console.log("storedInstances:", storedInstances);
      if (storedInstances) setInstancias(storedInstances);
    };
    _loadInstances();
  }, []);

  // Guardar instancias cada vez que cambian
  const addInstancia = async (name, version) => {
    const newInstance = await createInstance(name, version);
    if (newInstance === null) return;

    const newInstancias = [...instancias, newInstance];
    setInstancias(newInstancias);
    await saveInstances(newInstancias);
    
  }

  const removeInstancia = async (index) => {
    const name = instancias[index].name;
    let accept = window.confirm(`¿Estás seguro de eliminar ${name}?`);

    if (index == -1 || !accept) return;

    const newInstancias = instancias.filter((_, i) => i !== index);
    setInstancias(newInstancias);
    await saveInstances(newInstancias);
  }
  
  return (
    <div>
      <Header />
      <div className="container">
        <ProgressBar />
        
        {instancias.length === 0 ? (
          <div className="alert alert-info mt-4">No hay versiones disponibles.</div>
        ) : (
          <ul className="list-group mt-4 d-flex justify-content-center">
            {/* Instancias disponibles: */}
            {instancias.map((instancia, index) => (
              <Instance
                key={index}
                instancia={instancia}
                onDelete={() => removeInstancia(index)}
              />
            ))}
          </ul>
        )}
        {/* Boton de agregar nueva instancia */}
        
        <CreateInstance onSubmit={(name) => addInstancia(name)} />

      </div>
    </div>
  );
}