import React, { useEffect, useState } from "react";
import { ipcRenderer } from "electron"
import { UsuariosI } from "./interfaces/empleados";
import "./css/index.css"
import { obtenerFechaActual } from "./helpers/formatearFecha";
import { marcarEntrada, marcarSalida, obtenerEmpleados, obtenerEntradaHoy, obtenerSalidaHoy, obtenerSalidas } from "./services/usuarios";
import { SalidasI } from "./interfaces/salidas";
import { RegistrosI } from "./interfaces/registros";
import { obtenerRegistros } from "./services/registros";
import { Button, Tab, Tabs } from "@mui/material";
import TablaRegistros from "./components/tabla";
import CustomPaginationActionsTable from "./components/tabla copy";

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
  const [horaSalida,setHoraSalida] = useState<string>("")
  const [horaEntrada,setHoraEntrada] = useState<string>("")

  useEffect(()=>{
    obtenerSalidaHoy({usuarioId:empleado.usuarioId})
    .then(respuesta=>{
      if(respuesta) setHoraSalida(obtenerFechaActual({soloHora:true,fecha:new Date(respuesta.horaSalida)}))
    })

    obtenerEntradaHoy({usuarioId:empleado.usuarioId})
    .then(respuesta=>{
      if(respuesta) setHoraEntrada(obtenerFechaActual({soloHora:true,fecha:new Date(respuesta.horaEntrada)}))
    })

  },[])

  const salida =(usuarioId: string)=>{
    marcarSalida({usuarioId})
    setHoraSalida(obtenerFechaActual({soloHora:true}))
  }

  const entrada =(usuarioId: string)=>{
    marcarEntrada({usuarioId})
    setHoraEntrada(obtenerFechaActual({soloHora:true}))
  }

  return(
  <div className="controlEmpleados" id={empleado.usuarioId}>
    <div className="controlEmpleados__nombre">{empleado.nombre}</div>
    <div className="controlEmpleados__boton"><Button color="primary" variant={horaEntrada?"outlined":"contained"} className="controlEmpleados__boton" onClick={()=>entrada(empleado.usuarioId)}>Entrada</Button></div>
    <div className="controlEmpleados__boton"><Button variant={horaSalida?"outlined":"contained"} className="controlEmpleados__boton" onClick={()=>salida(empleado.usuarioId)}>Salida</Button></div>
    <div className="controlEmpleados__hora"><div>{horaEntrada?horaEntrada:"-"}</div></div>
    <div className="controlEmpleados__hora"><div>{horaSalida?horaSalida:"-"}</div></div>
  </div>)
}

const Salida=({salida,empleados}:{salida:SalidasI,empleados:UsuariosI[]})=>{
  
  const empleado = empleados.find(empleado => empleado.usuarioId === salida.usuarioId)

  return(
    <div className="salida">
      <div>{empleado ? empleado.nombre : "Desconocido"}</div>
      <div>{obtenerFechaActual({fecha:new Date(salida.horaSalida)})}</div>
    </div>
  )
}

const Registro=({registro,empleados}:{registro:RegistrosI,empleados:UsuariosI[]})=>{
  
  const empleado = empleados.find(empleado => empleado.usuarioId === registro.usuarioId)

  return(
    <div className="registro">
      <div className="registro__nombre">{empleado ? empleado.nombre : "Desconocido"}</div>
      <div className="registro__tipo">{registro.tipo}</div>
      <div className="registro__fecha">{obtenerFechaActual({fecha:new Date(registro.hora)})}</div>
    </div>
  )
}

const App: React.FC = () => {

  const [esVerRegistros,setEsVerRegistros ] = useState<string|undefined>(undefined)
  const [registros,setRegistros] = useState<RegistrosI[]|undefined>(undefined)
  const [empleados,setEmpleados] =useState<UsuariosI[]|undefined>(undefined)
  const [salidas,setSalidas] =useState<SalidasI[]|undefined>(undefined)
  const [esVerUsuarios, setEsVerUsuarios ] = useState(false)

  const [tabRegistro,setTabRegistro]=  useState<number>(1000)
  const handleTabRegistro = (event: React.SyntheticEvent, newValue: number) => {
    setTabRegistro(newValue);
  };

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
  <div id="control">
    {empleados && empleados.map((empleado=><ControlEmpleados empleado={empleado} setEsVerRegistros={setEsVerRegistros} />))}
  </div>
  {empleados && <>
    <div id="registros">
    <Tabs
      value={tabRegistro}
      onChange={handleTabRegistro}
      variant="scrollable"
      scrollButtons="auto"
      aria-label="scrollable auto tabs example"
    >
      {empleados.map((empleado=><Tab onClick={()=>setEsVerRegistros(empleado.usuarioId)} label={empleado.nombre} key={empleado.usuarioId+"tab"}/>))}
    </Tabs>
    <div id="registros__filas">
      {registros && <TablaRegistros rows={registros} empleados={empleados} />}
      {!esVerRegistros && <div id="registros__mensaje1">Seleccione un usuario para ver sus registros</div>}
    </div>
  </div>
  </>}

  
  <div>
    {esVerUsuarios && <>
      <h2>Usuarios</h2>
      <div id="usuarios">
        {empleados && empleados.map((empleado=><Empleado empleado={empleado}/>))}
      </div>
    </>}
  </div>
  </>
  );
};

export default App;
