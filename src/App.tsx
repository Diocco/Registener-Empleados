import React, { useEffect, useState } from "react";
import { ipcRenderer } from "electron"
import { UsuariosI } from "./interfaces/empleados";
import "./css/index.css"
import { obtenerFechaActual } from "./helpers/formatearFecha";
import { marcarEntrada, marcarSalida, obtenerEmpleados, obtenerEntradaHoy, obtenerSalidaHoy, obtenerSalidas } from "./services/usuarios";
import { SalidasI } from "./interfaces/salidas";
import { RegistrosI } from "./interfaces/registros";
import { obtenerRegistros } from "./services/registros";
import { Button, Fab, FormControlLabel, Modal, Switch, Tab, Tabs, TextField, Typography } from "@mui/material";
import { TablaRegistros } from "./components/tabla";
import { useDispatch, useSelector } from "react-redux";
import { actualizarRegistros, actualizarTurnos, actualizarUsuario, agregarUsuario, definirRegistros, definirSalidas, definirTurnos, definirUsuarios, eliminarUsuario } from "./redux/variablesSlice";
import { AppDispatch, RootState } from './redux/store';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faPencil, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Turno } from "./components/selectTurno";
import { TurnosI } from "./interfaces/turnos";
import { eliminarTurno, obtenerTurnos } from "./services/turnos";
import { calcularHorasEsteMes } from "./helpers/calcularHorasDeTrabajoMes";
import { calcularHorasTrabajadas } from "./helpers/calcularHorasTrabajadas";
import { ModalRegistro } from "./components/modalRegistros";
import { VentanaConfiguracion } from "./components/modalConfiguracion";



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

  const entrada =(usuarioOriginal: UsuariosI)=>{

    // Copia el usuario para poder modificarlo
    const usuario:UsuariosI = {
      ...usuarioOriginal
    }

    // Marca la entrada del usuario
    marcarEntrada({usuarioId:usuario.usuarioId})
    setHoraEntrada(obtenerFechaActual({soloHora:true}))

    // Calcula el cambio en la puntualidad
    const ahora = new Date();
    const minutosEntrada = ahora.getHours() * 60 + ahora.getMinutes();
    const diaSemanaHoy = ahora.getDay() // Obtiene el dia de la semana actual
    const turnosUsuario = turnosRedux.filter(turno=>(turno.usuarioId===usuario.usuarioId)&&(turno.dia===diaSemanaHoy)) // Filtra los turnos por usuario y por el dia del turno
    
    let diferencia = 0 // Almacena la diferencia en minutos entre la hora esperada y la hora observada

    if(turnosUsuario.length>0){ // Si el usuario no tiene turnos no hace nada
      if(turnosUsuario.length===1){ // Si el usuario tiene un turno
        const turno = turnosUsuario[0]
        diferencia = turno.minutosEntrada-minutosEntrada
      }else if(turnosUsuario.length>1){ // Si el usuario tiene mas de un turno ese mismo dia
        const diferencias = turnosUsuario.map(turno=> turno.minutosEntrada-minutosEntrada) // Calcula todas las diferencias de todos los turnos
        diferencia = diferencias.reduce((min, actual) => { // Se queda con la diferencia la cual el modulo es la mas reducida
          return Math.abs(actual) < Math.abs(min) ? actual : min;
        });
      }
      
      if(Math.abs(diferencia)>60){ // Si el modulo de la diferencia es mayor a una hora entonces se lo contempla como un caso extraordinario y no se calcula la puntualidad

      }else if(diferencia>=0){ // Si la diferencia es positiva, es decir, que el empleado llego mas temprano entonces aplica una formula
        if(diferencia>10) diferencia=10 // Si la diferencia es mayor a 10 entonces la limita a 10
        if(diferencia>5) diferencia=(diferencia-5)/2+5 // Si la diferencia es mayor a 5 entonces el valor restante luego del 5 se divide a la mitad, EJ: Si la diferencia es 9 el resultado es ((9-5)/2)+5 = 7
        usuario.puntosPuntualidad+=diferencia/29
        usuario.diasRacha+=1
      }else{ // Si la diferencia no es positiva, entonces quiere decir que el empleado llego tarde
        if(diferencia<-30) diferencia=-30 // Si el retraso es mayor que 30 minutos entonces para el calculo lo limita a -30
        if(diferencia<-15) diferencia=(diferencia+15)/2-15 // Si el retraso es mayor que 15 minutos entonces el valor restante luego del 15 se lo divide a la mitad
        usuario.puntosPuntualidad+=2*diferencia/29
        usuario.diasRacha=0
      }
    }

    // Actualiza el usuario y los registros
    dispatch(actualizarUsuario({usuario}))

  }

  const horasTrabajadas = calcularHorasTrabajadas(registrosRedux); // Cantidad de horas que el empleado trabajo hasta la hora actual
  const horasEsperadasTrabajadas = calcularHorasEsteMes(turnosRedux); // La cantidad de horas que se espera que el empleado haya trabajado hasta la hora actual

  return(<>
  <div className="controlEmpleados" id={empleado.usuarioId}>
    <div className="controlEmpleados__opciones"> 
      <button className="controlEmpleados__opciones__boton" onClick={()=>setEsAbrirConfiguracion(empleado)}><FontAwesomeIcon className="controlEmpleados__icon" icon={faPencil} /></button>
      <button className="controlEmpleados__opciones__boton" onClick={()=>setEsVerRegistros(empleado.usuarioId)}><FontAwesomeIcon className="controlEmpleados__icon" icon={faList} /></button>
    </div>
    <Typography variant="h5" gutterBottom className="controlEmpleados__nombre">{empleado.nombre}</Typography>
    <div className="controlEmpleados__boton"><Button color="primary" disabled={registrosRedux[0]?.tipo==="entrada"?true:false} variant={horaEntrada?"outlined":"contained"} className="controlEmpleados__boton" onClick={()=>entrada(empleado)}>Entrada</Button></div>
    <div className="controlEmpleados__boton"><Button variant={horaSalida?"outlined":"contained"} disabled={registrosRedux[0]?.tipo==="salida"?true:false} className="controlEmpleados__boton" onClick={()=>salida(empleado.usuarioId)}>Salida</Button></div>
    <div className="controlEmpleados__hora"><div>{horaEntrada?horaEntrada:"-"}</div></div>
    <div className="controlEmpleados__hora"><div>{horaSalida?horaSalida:"-"}</div></div>
    <div className="controlEmpleados__estadisticas">
      <div>Balance de horas:</div>
      <div>{`${Math.round((horasTrabajadas-horasEsperadasTrabajadas)*10)/10}hs `}</div>
    </div>
    <div className="controlEmpleados__estadisticas">
      <div>Puntualidad:</div>
      <div className="controlEmpleados__estadisticas__puntosPuntualidad">
        <div>{`${Math.round((empleado.puntosPuntualidad)*100)/100}`}</div>
        <div>/10</div>
      </div>

    </div>


  </div></>)
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
    nombre: "",
    diasRacha: 0,
    puntosPuntualidad: 5
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


