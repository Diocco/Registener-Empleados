import React, { useEffect, useState } from "react";
import { ipcRenderer } from "electron"
import { UsuariosI } from "./interfaces/empleados";
import "./css/index.css"
import { obtenerFechaActual } from "./helpers/formatearFecha";
import { marcarEntrada, marcarSalida, obtenerEmpleados, obtenerEntradaHoy, obtenerSalidaHoy, obtenerSalidas } from "./services/usuarios";
import { SalidasI } from "./interfaces/salidas";
import { RegistrosI } from "./interfaces/registros";
import { obtenerRegistros } from "./services/registros";
import { Button, Modal, Tab, Tabs, TextField } from "@mui/material";
import TablaRegistros from "./components/tabla";
import { useDispatch, useSelector } from "react-redux";
import { actualizarRegistros, actualizarRegistrosUsuario, actualizarUsuario, agregarUsuario, definirRegistrosUsuario, definirSalidas, definirUsuarios, eliminarUsuario } from "./redux/variablesSlice";
import { AppDispatch, RootState } from "./redux/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Turno } from "./components/selectTurno";
import { TurnosI } from "./interfaces/turnos";
import { eliminarTurno, modificarTurno, obtenerTurnosPorUsuario, solicitarAgregarTurno } from "./services/turnos";
import { calcularHorasEsteMes } from "./helpers/calcularHorasDeTrabajoMes";
import { calcularHorasTrabajadas } from "./helpers/calcularHorasTrabajadas";

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

const generarTurno=(usuarioId:string)=>{
  const idProvisorio = "00000"+(Math.random()*Math.random()).toString() // El id siempre comiensza con "00000" para indicar que es un id provisorio
  const turnoDefault:TurnosI = {
    usuarioId,
    id: idProvisorio,
    dia: 1,
    minutosEntrada: 480,
    minutosSalida: 960
  }
  return turnoDefault

}

const VentanaConfiguracion=({esAbrirConfiguracion,setEsAbrirConfiguracion}:{esAbrirConfiguracion:UsuariosI,setEsAbrirConfiguracion: React.Dispatch<React.SetStateAction<UsuariosI|undefined>>})=>{

  const [turnos, setTurnos] = useState<TurnosI[]>([])
  const [nombre,setNombre] = useState(esAbrirConfiguracion.nombre)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(()=>{
    
    obtenerTurnosPorUsuario({usuarioId:esAbrirConfiguracion.usuarioId}) // Obtiene los turnos del empleado desde la base de datos
    .then((respuesta)=>{
      setTurnos(respuesta)
    })
  },[])

  const confirmarCambios=()=>{
    const empleadoModificado:UsuariosI = {
      ...esAbrirConfiguracion,
      nombre: nombre
    }

    if(empleadoModificado.usuarioId==="-1"){ // Si el empleado no tiene id es porque se esta creando uno nuevo, por lo que al confirmar los cambios lo agrega a la base de datos
      dispatch(agregarUsuario({usuario:empleadoModificado}))
      .then(()=>setEsAbrirConfiguracion(undefined))
    }else{ // Modifica el empleado
      dispatch(actualizarUsuario({usuario:empleadoModificado}))
      .then(()=>setEsAbrirConfiguracion(undefined))
    }
    
    turnos.forEach((turno)=>{
      if(turno.id.startsWith("00000")){ // Si el turno es nuevo entonces lo agrega a la base de datos
        solicitarAgregarTurno({turno})
      }else if(turno.id.startsWith("-1")){ // Si el turno fue eliminado entonces lo elimina de la bade de datos
        eliminarTurno({turnoId:turno.id.substring(2)}) // Envia el id sin el "-1"
      }else{
        modificarTurno({turno}) // Si el turno ya existia entonces lo actualiza
      }
    })
  }

  const confimarEliminar=()=>{
    dispatch(eliminarUsuario({usuarioId:esAbrirConfiguracion.usuarioId}))
    .then(()=>setEsAbrirConfiguracion(undefined))
  }
  
  const agregarTurno=()=>{
    const turnoDefault = generarTurno(esAbrirConfiguracion.usuarioId) // Crea un turno por default
    const turnosModificados:TurnosI[] = [
      ...turnos,
      turnoDefault
    ]
    setTurnos(turnosModificados) // Lo agrega al final de los turnos existentes
  }

  return(
        <div id="controlEmpleados__ventanaConfiguracion">
          {esAbrirConfiguracion.usuarioId!=="-1" && <div id="controlEmpleados__ventanaConfiguracion__eliminar" onClick={()=>confimarEliminar()}><FontAwesomeIcon icon={faTrash} /></div>}
          <TextField id="filled-basic" label="Nombre" variant="filled" defaultValue={nombre} onChange={(s)=>setNombre(s.target.value)}/>
          <div id="controlEmpleados__ventanaConfiguracion__turnos">
            {turnos.map(turno=><Turno key={turno.id} turno={turno} setTurnos={setTurnos}/> )}
            <div id="controlEmpleados__ventanaConfiguracion__agregarTurno" onClick={()=>agregarTurno()}><FontAwesomeIcon icon={faPlus} /></div>
          </div>
          <Button color="primary" variant={"contained"} className="controlEmpleados__boton" onClick={()=>confirmarCambios()}>Guardar</Button>
          <Button color="primary" variant={"outlined"} className="controlEmpleados__boton" onClick={()=>setEsAbrirConfiguracion(undefined)}>Cancelar</Button>
        </div>
)
}

const ControlEmpleados=({empleado,setEsAbrirConfiguracion}:{empleado:UsuariosI,setEsAbrirConfiguracion: React.Dispatch<React.SetStateAction<UsuariosI | undefined>>})=>{

  const [horaSalida,setHoraSalida] = useState<string>("")
  const [horaEntrada,setHoraEntrada] = useState<string>("")
  const dispatch = useDispatch<AppDispatch>();


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
    dispatch(actualizarRegistros(usuarioId))
  }

  const entrada =(usuarioId: string)=>{
    marcarEntrada({usuarioId})
    setHoraEntrada(obtenerFechaActual({soloHora:true}))
    dispatch(actualizarRegistros(usuarioId))
  }


  return(<>
  <div className="controlEmpleados" id={empleado.usuarioId}>
    <button className="controlEmpleados__modificar" onClick={()=>setEsAbrirConfiguracion(empleado)}><FontAwesomeIcon className="controlEmpleados__icon" icon={faPencil} /></button>
    <div className="controlEmpleados__nombre">{empleado.nombre}</div>
    <div className="controlEmpleados__boton"><Button color="primary" variant={horaEntrada?"outlined":"contained"} className="controlEmpleados__boton" onClick={()=>entrada(empleado.usuarioId)}>Entrada</Button></div>
    <div className="controlEmpleados__boton"><Button variant={horaSalida?"outlined":"contained"} className="controlEmpleados__boton" onClick={()=>salida(empleado.usuarioId)}>Salida</Button></div>
    <div className="controlEmpleados__hora"><div>{horaEntrada?horaEntrada:"-"}</div></div>
    <div className="controlEmpleados__hora"><div>{horaSalida?horaSalida:"-"}</div></div>
  </div></>)
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

  const [esAbrirConfiguracion, setEsAbrirConfiguracion ] = useState<UsuariosI|undefined>(undefined)
  const [esVerUsuarios, setEsVerUsuarios ] = useState(false)
  const [tabRegistro,setTabRegistro]=  useState<number>(0)
  const handleTabRegistro = (event: React.SyntheticEvent, newValue: number) => {
    setTabRegistro(newValue);
  };

  const dispatch = useDispatch<AppDispatch>();
  const empleados = useSelector((state:RootState)=> state.variablesReducer.usuarios);
  const registrosUsuario = useSelector((state:RootState)=> state.variablesReducer.registrosUsuario.registros);

  useEffect(()=>{
    obtenerEmpleados()
    .then((respuesta)=>{
      dispatch(definirUsuarios(respuesta))
      dispatch(actualizarRegistrosUsuario(respuesta[0].usuarioId))
    })

    obtenerSalidas()
    .then((respuesta)=>{
      dispatch(definirSalidas(respuesta))
    })
  },[])

  useEffect(()=>{ // Cada vez que se actualizar los usuarios (modificacion o creacion de los mismos) los tabs del registro se reinician
    setTabRegistro(0)
    if(empleados.length>0) dispatch(actualizarRegistrosUsuario(empleados[0].usuarioId))
  },[empleados])

  const empleadoNuevo: UsuariosI={
    usuarioId: "-1",
    nombre: ""
  }

  return (<>
  <div id="control">
    {empleados && empleados.map((empleado=><ControlEmpleados empleado={empleado} setEsAbrirConfiguracion={setEsAbrirConfiguracion}/>))}
    <div id="control__agregarEmpleado" onClick={()=>setEsAbrirConfiguracion(empleadoNuevo)} ><FontAwesomeIcon icon={faPlus} /></div>

  </div>
  {empleados && <>
    <div id="registros">
    <Tabs
      value={tabRegistro}
      onChange={handleTabRegistro}
      variant="scrollable"
      scrollButtons="auto"
    >
      {empleados.map((empleado=><Tab onClick={()=>dispatch(actualizarRegistrosUsuario(empleado.usuarioId))} label={empleado.nombre} key={empleado.usuarioId+"tab"}/>))}
    </Tabs>
    <div id="registros__filas">
      {registrosUsuario && <TablaRegistros rows={registrosUsuario} empleados={empleados} />}
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

  <Modal
      open={esAbrirConfiguracion?true:false}
      onClose={()=>setEsAbrirConfiguracion(undefined)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="controlEmpleados__modal"
    >
      <VentanaConfiguracion esAbrirConfiguracion={esAbrirConfiguracion!} setEsAbrirConfiguracion={setEsAbrirConfiguracion}/>
  </Modal>
  </>
  );
};

export default App;


