import React from 'react';

import Instance from './components/Instance.jsx';
import Header from './components/Header.jsx';
import CreateInstanceBtn from './components/CreateInstanceBtn.jsx';
import CreateInstanceForm from './components/CreateInstanceForm.jsx';

import { loadInstances, saveInstances } from './util.js';

export default function App() {
  
  // Estado para las instancias y el formulario de nueva instancia
  const [instancias, setInstancias] = React.useState([]);
  const [showNuevaInstancia, setShowNuevaInstancia] = React.useState(false);

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
  const _saveInstances = async (instances) => {
    await saveInstances(instances);
  };

  const addInstancia = (name, version) => {
    const instancia = { name: name, version: version };
    const newInstancias = [...instancias, instancia];
    setInstancias(newInstancias);
    _saveInstances(newInstancias);
    setShowNuevaInstancia(false);
  }

  const removeInstancia = (index) => {

    const name = instancias[index].nombre;
    let accept = window.confirm(`¿Estás seguro de eliminar ${name}?`);

    if (index == -1 || !accept) return;

    const newInstancias = instancias.filter((_, i) => i !== index);
    setInstancias(newInstancias);
    _saveInstances(newInstancias);
  }


  const onOpenFolder = (instancia) => {
    console.log("Instancia seleccionada:", instancia);
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
              <Instance
                key={index}
                instancia={instancia}
                onDelete={() => removeInstancia(index)}
              />
            ))}
          </ul>
        )}
        {/* Boton de agregar nueva instancia */}
        
        {showNuevaInstancia ? (
            <CreateInstanceForm
              onSubmit={(name, version) => addInstancia(name, version)} 
              onCancel={() => setShowNuevaInstancia(false)}
            />  
          ) :  
            <CreateInstanceBtn onClick={() => setShowNuevaInstancia(true)} />
          }

      </div>
    </div>
  );
}