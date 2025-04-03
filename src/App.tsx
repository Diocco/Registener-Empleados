import React, { useEffect, useState } from "react";
import { ipcRenderer } from "electron"
import { UsuariosI } from "./interfaces/empleados";
import "./css/index.css"
import { obtenerFechaActual } from "./helpers/formatearFecha";
import { marcarEntrada, marcarSalida, obtenerEmpleados } from "./services/usuarios";



const Empleado=({empleado}:{empleado:UsuariosI})=>{
  return(<>
    <div>{empleado.usuarioId}</div>
    <div>{empleado.nombre}</div>
  </>)
}

const ControlEmpleados=({empleado}:{empleado:UsuariosI})=>{
  const [horaSalida,setHoraSalida] = useState<string>("00:00:00")
  const [horaEntrada,setHoraEntrada] = useState<string>("00:00:00")

  const salida =(usuarioId: string)=>{
    marcarSalida({usuarioId})
    setHoraSalida(obtenerFechaActual())
  }

  const entrada =(usuarioId: string)=>{
    marcarEntrada({usuarioId})
    setHoraEntrada(obtenerFechaActual())
  }

  return(
  <div className="controlEmpleados" id={empleado.usuarioId}>
    <div className="controlEmpleados__nombre">{empleado.nombre}</div>
    <div className="controlEmpleados__boton"><button className="controlEmpleados__boton" onClick={()=>entrada(empleado.usuarioId)}>Entrada</button></div>
    <div className="controlEmpleados__boton"><button className="controlEmpleados__boton" onClick={()=>salida(empleado.usuarioId)}>Salida</button></div>
    <div className="controlEmpleados__hora"><div>{horaEntrada}</div></div>
    <div className="controlEmpleados__hora"><div>{horaSalida}</div></div>
  </div>)
}

const App: React.FC = () => {

  const [texto,setTexto] = useState("apretame")
  const [empleados,setEmpleados] =useState<UsuariosI[]|undefined>(undefined)

  useEffect(()=>{
    obtenerEmpleados()
    .then((respuesta)=>{
      setEmpleados(respuesta)
    })
  },[])


  return (<>
  <div>
    <h2>Control</h2>
    {empleados && empleados.map((empleado=><ControlEmpleados empleado={empleado}/>))}
  </div>
  <div>
    <h2>Registros</h2>
    <div id="registro">
      {empleados && empleados.map((empleado=><Empleado empleado={empleado}/>))}
    </div>
  </div>
  </>
  );
};

export default App;
