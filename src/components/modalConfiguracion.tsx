import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../redux/store"
import { TurnosI } from "../interfaces/turnos"
import { useEffect, useState } from "react"
import { UsuariosI } from "../interfaces/empleados"
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { TextField, FormControlLabel, Switch, Button, Tabs, Tab, Typography } from "@mui/material"
import React from "react"
import { agregarUsuario, actualizarUsuario, actualizarTurnos, eliminarUsuario } from "../redux/variablesSlice"
import { Turno } from "./selectTurno"
import "../css/ventanaConfiguracion.css"
import ModalConfirmacion from "./modalConfirmacion"

const diasDeSemana = [
    { nombre: "Domingo", valor: 0 },
    { nombre: "Lunes", valor: 1 },
    { nombre: "Martes", valor: 2 },
    { nombre: "Miércoles", valor: 3 },
    { nombre: "Jueves", valor: 4 },
    { nombre: "Viernes", valor: 5 },
    { nombre: "Sábado", valor: 6 },
  ];




const turnosPorDia=(turnosRedux:TurnosI[],tabTurnos:number)=>{
  let turnos = turnosRedux.filter(turno=> turno.dia === tabTurnos) // Filtra los turnos del usuario a los que son del dia seleccionado
  const turnoDefault = {
    usuarioId: "",
    id: "",
    dia:tabTurnos,
    minutosEntrada: 480,
    minutosSalida: 960
  }

  // Agrega turnos por default si no hay turnos creados
  if(turnos.length===0){
    turnos.push(turnoDefault)
    turnos.push(turnoDefault)
  }else if(turnos.length===1){
    turnos.push(turnoDefault)
  }

  return turnos
}

export const VentanaConfiguracion=({esAbrirConfiguracion,setEsAbrirConfiguracion}:{esAbrirConfiguracion:UsuariosI,setEsAbrirConfiguracion: React.Dispatch<React.SetStateAction<UsuariosI|undefined>>})=>{

    const [abrirConfirmacion,setAbrirConfirmacion] = useState(false)
    const [tabTurnos, setTabTurnos] = useState(0)
    const turnosRedux = useSelector((state:RootState)=>state.variablesReducer.turnos.filter(turno=> turno.usuarioId === esAbrirConfiguracion.usuarioId)) // Devuelve solo los turnos que sean del usuario seleccionado
    const [turnos,setTurnos] = useState<TurnosI[]>(turnosRedux)
    const [turnosVisibles, setTurnosVisibles] = useState<TurnosI[]>(()=>turnosPorDia(turnos,tabTurnos))
    const [nombre,setNombre] = useState(esAbrirConfiguracion.nombre)
    const [esControlPuntualidad, setEsControlPuntualidad] = useState(esAbrirConfiguracion.esControlPuntualidad===1)
    const [esControlHoras, setEsControlHoras] = useState(esAbrirConfiguracion.esControlHoras===1)
    const handleTabTurnos = (event: React.SyntheticEvent, newValue: number) => {
        setTabTurnos(newValue);
    };
    const dispatch = useDispatch<AppDispatch>()
    

  
  
    useEffect(()=>{ // Cada vez que se cambia el tab, se vuelven a cargar los turnos visibles
        setTurnosVisibles(turnosPorDia(turnos,tabTurnos))
    },[tabTurnos,turnos])

    const confirmarCambios=()=>{
      const empleadoModificado:UsuariosI = {
        ...esAbrirConfiguracion,
        esControlPuntualidad:esControlPuntualidad?1:0,
        esControlHoras:esControlHoras?1:0,
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
    
  
    return(
          <div id="ventanaConfiguracion">
            <TextField id="filled-basic" label="Nombre" variant="filled" defaultValue={nombre} onChange={(s)=>setNombre(s.target.value)}/>
            <FormControlLabel control={<Switch checked={esControlPuntualidad} onChange={(e)=>setEsControlPuntualidad(e.target.checked)} />} className="ventanaConfiguracion__switch" label="Control de puntualidad" />
            <FormControlLabel control={<Switch checked={esControlHoras} onChange={(e)=>setEsControlHoras(e.target.checked)} />} className="ventanaConfiguracion__switch" label="Control de horas" />
            
            <div id="ventanaConfiguracion__tablaTurnos">
              <Typography variant="h5" className="ventanaConfiguracion__h5">
                  Turnos
              </Typography>
              <Tabs
              value={tabTurnos}
              onChange={handleTabTurnos}
              variant="scrollable"
              scrollButtons="auto"
              >
                  {diasDeSemana.map((dia=><Tab onClick={()=>setTabTurnos(dia.valor)} label={dia.nombre} key={dia.nombre+"tab"}/>))}
              </Tabs>
              <div id="ventanaConfiguracion__turnos">
                  <Turno turno={turnosVisibles[0]} usuarioId={esAbrirConfiguracion.usuarioId} setTurnos={setTurnos}/>
                  <Turno turno={turnosVisibles[1]} usuarioId={esAbrirConfiguracion.usuarioId} setTurnos={setTurnos}/>
              </div>
            </div>
            
            {esAbrirConfiguracion.usuarioId!=="-1" &&<Button color="error" variant={"outlined"} id="ventanaConfiguracion__eliminar" onClick={()=>setAbrirConfirmacion(true)}>Eliminar</Button>}

            <div id="ventanaConfiguracion__guardarCancelar">
              <Button color="primary" variant={"contained"} className="ventanaConfiguracion__boton" onClick={()=>confirmarCambios()}>Guardar</Button>
              <Button color="primary" variant={"outlined"} className="ventanaConfiguracion__boton" onClick={()=>setEsAbrirConfiguracion(undefined)}>Cancelar</Button>
            </div>

            <ModalConfirmacion open={abrirConfirmacion} setOpen={setAbrirConfirmacion} titulo={"¿Estas seguro que deseas eliminar el usuario?"} funcionAceptar={confimarEliminar}/>
          </div>
  )
  }
  