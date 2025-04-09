import React, { useEffect, useState } from "react";
import { ipcRenderer } from "electron"
import { UsuariosI } from "./interfaces/empleados";
import "./css/index.css"
import { obtenerFechaActual } from "./helpers/formatearFecha";
import { marcarEntrada, marcarSalida, obtenerEmpleados, obtenerEntradaHoy, obtenerSalidaHoy, obtenerSalidas } from "./services/usuarios";
import { SalidasI } from "./interfaces/salidas";
import { RegistrosI } from "./interfaces/registros";
import { obtenerRegistros } from "./services/registros";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTableCells } from "@fortawesome/free-solid-svg-icons";

const calcularHorasTrabajadas=(registros: RegistrosI[])=>{
  let horasTrabajadas:number = 0;
  let ultimaEntrada:number|undefined = undefined;
  let ultimaSalida:number|undefined = undefined;
  registros.slice().reverse().forEach(registro=>{
    if(registro.tipo==="entrada") {
      ultimaEntrada=registro.hora
      return
    }else if(ultimaEntrada){
      horasTrabajadas += registro.hora-ultimaEntrada
      ultimaEntrada=undefined
      ultimaSalida=registro.hora
    }else if(ultimaSalida){
      horasTrabajadas += registro.hora - ultimaSalida
      ultimaSalida = registro.hora
    }
  })
  return Number((horasTrabajadas/(1000*60*60)).toPrecision(2)) // Devuelve el resultado en horas
}

const Empleado=({empleado}:{empleado:UsuariosI})=>{

  const [horasTrabajadas , setHorasTrabajadas] = useState<number>(0)

  obtenerRegistros(empleado.usuarioId)
  .then(respuesta=>{
    setHorasTrabajadas(calcularHorasTrabajadas(respuesta))
  })

  return(<>
    <div>{empleado.usuarioId}</div>
    <div>{empleado.nombre}</div>
    <div>{`${horasTrabajadas} hs`}</div>
  </>)
}

const ControlEmpleados=({empleado,setEsVerRegistros}:{empleado:UsuariosI,setEsVerRegistros: React.Dispatch<React.SetStateAction<string | undefined>>})=>{
  const [horaSalida,setHoraSalida] = useState<string>("00:00:00")
  const [horaEntrada,setHoraEntrada] = useState<string>("00:00:00")

  useEffect(()=>{
    obtenerSalidaHoy({usuarioId:empleado.usuarioId})
    .then(respuesta=>{
      setHoraSalida(obtenerFechaActual(new Date(respuesta.horaSalida)))
    })

    obtenerEntradaHoy({usuarioId:empleado.usuarioId})
    .then(respuesta=>{
      setHoraEntrada(obtenerFechaActual(new Date(respuesta.horaEntrada)))
    })

  },[])

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
    <button className="controlEMpleados__verRegistros" onClick={()=>setEsVerRegistros(empleado.usuarioId)}><FontAwesomeIcon icon={faTableCells} /></button>
    <div className="controlEmpleados__nombre">{empleado.nombre}</div>
    <div className="controlEmpleados__boton"><button className="controlEmpleados__boton" onClick={()=>entrada(empleado.usuarioId)}>Entrada</button></div>
    <div className="controlEmpleados__boton"><button className="controlEmpleados__boton" onClick={()=>salida(empleado.usuarioId)}>Salida</button></div>
    <div className="controlEmpleados__hora"><div>{horaEntrada}</div></div>
    <div className="controlEmpleados__hora"><div>{horaSalida}</div></div>
  </div>)
}

const Salida=({salida,empleados}:{salida:SalidasI,empleados:UsuariosI[]})=>{
  
  const empleado = empleados.find(empleado => empleado.usuarioId === salida.usuarioId)

  return(
    <div className="salida">
      <div>{empleado ? empleado.nombre : "Desconocido"}</div>
      <div>{obtenerFechaActual(new Date(salida.horaSalida))}</div>
    </div>
  )
}

const Registro=({registro,empleados}:{registro:RegistrosI,empleados:UsuariosI[]})=>{
  
  const empleado = empleados.find(empleado => empleado.usuarioId === registro.usuarioId)

  return(
    <div className="registro">
      <div className="registro__nombre">{empleado ? empleado.nombre : "Desconocido"}</div>
      <div className="registro__tipo">{registro.tipo}</div>
      <div className="registro__fecha">{obtenerFechaActual(new Date(registro.hora))}</div>
    </div>
  )
}

const App: React.FC = () => {

  const [esVerRegistros,setEsVerRegistros ] = useState<string|undefined>(undefined)
  const [registros,setRegistros] = useState<RegistrosI[]|undefined>(undefined)
  const [empleados,setEmpleados] =useState<UsuariosI[]|undefined>(undefined)
  const [salidas,setSalidas] =useState<SalidasI[]|undefined>(undefined)

  useEffect(()=>{
    obtenerEmpleados()
    .then((respuesta)=>{
      setEmpleados(respuesta)
    });

    obtenerSalidas()
    .then((respuesta)=>{
      setSalidas(respuesta)
    })
  },[])

  useEffect(()=>{
    if(esVerRegistros){
      obtenerRegistros(esVerRegistros)
      .then((respuesta)=>{
        setRegistros(respuesta)
      })
    }
  },[esVerRegistros])


  return (<>
  <div>
    <h2>Control</h2>
    {empleados && empleados.map((empleado=><ControlEmpleados empleado={empleado} setEsVerRegistros={setEsVerRegistros} />))}
  </div>
  <div>
    <h2>Usuarios</h2>
    <div id="registro">
      {empleados && empleados.map((empleado=><Empleado empleado={empleado}/>))}
    </div>
    {esVerRegistros && <>
      <h2>Registro</h2>
      <div>
        {(registros && empleados) && registros.map((registro=><Registro registro={registro} empleados={empleados}/>))}
      </div>
    </>}
    
  </div>
  </>
  );
};

export default App;
