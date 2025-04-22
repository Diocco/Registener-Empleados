import React, { useEffect, useState } from "react";
import { ipcRenderer } from "electron"
import { UsuariosI } from "./interfaces/empleados";
import "./css/index.css"
import { obtenerFechaActual } from "./helpers/formatearFecha";
import { marcarEntrada, marcarSalida, obtenerEmpleados, obtenerEntradaHoy, obtenerSalidaHoy, obtenerSalidas } from "./services/usuarios";
import { SalidasI } from "./interfaces/salidas";
import { RegistrosI } from "./interfaces/registros";
import { obtenerRegistros } from "./services/registros";
import { Button, Fab, Modal, Tab, Tabs, TextField } from "@mui/material";
import TablaRegistros from "./components/tabla";
import { useDispatch, useSelector } from "react-redux";
import { actualizarRegistros, actualizarTurnos, actualizarUsuario, agregarUsuario, definirRegistros, definirSalidas, definirTurnos, definirUsuarios, eliminarUsuario } from "./redux/variablesSlice";
import { AppDispatch, RootState } from './redux/store';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faPencil, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Turno } from "./components/selectTurno";
import { TurnosI } from "./interfaces/turnos";
import { eliminarTurno, modificarTurno, obtenerTurnos, obtenerTurnosPorUsuario, solicitarAgregarTurno } from "./services/turnos";
import { calcularHorasEsteMes } from "./helpers/calcularHorasDeTrabajoMes";
import { calcularHorasTrabajadas } from "./helpers/calcularHorasTrabajadas";
import { ModalRegistro } from "./components/modalRegistros";

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

  const turnosRedux = useSelector((state:RootState)=>state.variablesReducer.turnos.filter(turno=> turno.usuarioId === esAbrirConfiguracion.usuarioId)) // Devuelve solo los turnos que sean del usuario seleccionado
  const [turnos,setTurnos] = useState<TurnosI[]>(turnosRedux)
  const [nombre,setNombre] = useState(esAbrirConfiguracion.nombre)
  const dispatch = useDispatch<AppDispatch>()


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
    
    dispatch(actualizarTurnos(turnos))
    
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

const ControlEmpleados=({empleado,setEsAbrirConfiguracion,setEsVerRegistros}:{empleado:UsuariosI,setEsAbrirConfiguracion: React.Dispatch<React.SetStateAction<UsuariosI | undefined>>,setEsVerRegistros: React.Dispatch<React.SetStateAction<string>>})=>{

  const registrosRedux = useSelector((state:RootState)=>state.variablesReducer.registros.filter(registro=> registro.usuarioId === empleado.usuarioId)) // Devuelve solo los registros que sean del usuario seleccionado
  const turnosRedux = useSelector((state:RootState)=>state.variablesReducer.turnos.filter(turno=> turno.usuarioId === empleado.usuarioId)) // Devuelve solo los turnos que sean del usuario seleccionado
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

  const horasTrabajadas = calcularHorasTrabajadas(registrosRedux); // Cantidad de horas que el empleado trabajo hasta la hora actual
  const horasEsperadasTrabajadas = calcularHorasEsteMes(turnosRedux); // La cantidad de horas que se espera que el empleado haya trabajado hasta la hora actual

  return(<>
  <div className="controlEmpleados" id={empleado.usuarioId}>
    <div className="controlEmpleados__opciones"> 
      <button className="controlEmpleados__opciones__boton" onClick={()=>setEsAbrirConfiguracion(empleado)}><FontAwesomeIcon className="controlEmpleados__icon" icon={faPencil} /></button>
      <button className="controlEmpleados__opciones__boton" onClick={()=>setEsVerRegistros(empleado.usuarioId)}><FontAwesomeIcon className="controlEmpleados__icon" icon={faList} /></button>
    </div>
    <div className="controlEmpleados__nombre">{empleado.nombre}</div>
    <div className="controlEmpleados__boton"><Button color="primary" variant={horaEntrada?"outlined":"contained"} className="controlEmpleados__boton" onClick={()=>entrada(empleado.usuarioId)}>Entrada</Button></div>
    <div className="controlEmpleados__boton"><Button variant={horaSalida?"outlined":"contained"} className="controlEmpleados__boton" onClick={()=>salida(empleado.usuarioId)}>Salida</Button></div>
    <div className="controlEmpleados__hora"><div>{horaEntrada?horaEntrada:"-"}</div></div>
    <div className="controlEmpleados__hora"><div>{horaSalida?horaSalida:"-"}</div></div>
    <div className="controlEmpleados__horas">
      <div>Balance de horas:</div>
      <div>{`${Math.round((horasTrabajadas-horasEsperadasTrabajadas)*10)/10}hs `}</div>
    </div>


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

  const [esVerRegistros, setEsVerRegistros ] = useState<string>("")
  const [esAbrirConfiguracion, setEsAbrirConfiguracion ] = useState<UsuariosI|undefined>(undefined)

  const dispatch = useDispatch<AppDispatch>();
  const empleados = useSelector((state:RootState)=> state.variablesReducer.usuarios);

  useEffect(()=>{
    obtenerEmpleados()
    .then((respuesta)=>{
      dispatch(definirUsuarios(respuesta))
    })

    obtenerSalidas()
    .then((respuesta)=>{
      dispatch(definirSalidas(respuesta))
    })

    obtenerTurnos()
    .then((respuesta)=>{
      dispatch(definirTurnos(respuesta))
    })

    obtenerRegistros()
    .then((respuesta)=>{
      dispatch(definirRegistros(respuesta))
    })
  },[])

  useEffect(()=>{ // Cada vez que se actualizar los usuarios (modificacion o creacion de los mismos) los tabs del registro se reinician
    if(empleados.length>0) dispatch(actualizarRegistros(empleados[0].usuarioId))
  },[empleados])

  const empleadoNuevo: UsuariosI={
    usuarioId: "-1",
    nombre: ""
  }

  return (<>
  <div id="control">
    {empleados && empleados.map((empleado=><ControlEmpleados empleado={empleado} setEsAbrirConfiguracion={setEsAbrirConfiguracion} setEsVerRegistros={setEsVerRegistros}/>))}
    <div id="control__agregarEmpleado" onClick={()=>setEsAbrirConfiguracion(empleadoNuevo)} ><FontAwesomeIcon icon={faPlus} /></div>

  </div>


  <Modal
      open={esVerRegistros?true:false}
      onClose={()=>setEsVerRegistros("")}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="controlEmpleados__modal"
    >
      <ModalRegistro empleados={empleados} usuarioIdSeleccionado={esVerRegistros} setEsVerRegistros={setEsVerRegistros}/>
  </Modal>

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


