import React, { useState } from "react";
import { ipcRenderer } from "electron"

const agregarEmpleado=async (setTexto: React.Dispatch<React.SetStateAction<string>>)=>{
    const respuesta = await ipcRenderer.invoke('agregar-empleado', "diego");
    setTexto(respuesta)
}

const App: React.FC = () => {

  const [texto,setTexto] = useState("apretame")

  return (
    <div>
      <h1>¡Hola desde React y Electron!</h1>
      <button onClick={()=>agregarEmpleado(setTexto)}>{texto}</button>
    </div>
  );
};

export default App;
