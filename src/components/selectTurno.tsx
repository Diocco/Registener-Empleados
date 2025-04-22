import { Box } from "@mui/material"
import React, { useEffect, useState } from "react"
import BasicSelect from "./select"
import SliderHora from "./sliderHora";
import { TurnosI } from "../interfaces/turnos";
import {produce} from "immer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const diasDeSemana = [
    { nombre: "Domingo", valor: 0 },
    { nombre: "Lunes", valor: 1 },
    { nombre: "Martes", valor: 2 },
    { nombre: "Miércoles", valor: 3 },
    { nombre: "Jueves", valor: 4 },
    { nombre: "Viernes", valor: 5 },
    { nombre: "Sábado", valor: 6 },
  ];

export const Turno =({turno,setTurnos}:{turno:TurnosI,setTurnos: React.Dispatch<React.SetStateAction<TurnosI[]>>})=>{

    const [diaSeleccionado,setDiaSeleccionado] = useState(turno.dia)
    const [minutosSeleccionados, setMinutosSeleccionados] = React.useState<number[]>([turno.minutosEntrada, turno.minutosSalida]);
    const [esTurnoBorrado, setEsTurnoBorrado] = useState(false)

    useEffect(()=>{
        setTurnos((prevState) => 
            produce(prevState, (draft) => {
                const turnoModificado = draft.find(turnoBorrador=> turnoBorrador.id===turno.id)!
                turnoModificado.id=esTurnoBorrado?"-1"+turno.id:turno.id // Si se tiene que eliminar el turno se le agrega el "-1" al inicio del id
                turnoModificado.dia=diaSeleccionado
                turnoModificado.minutosEntrada=minutosSeleccionados[0]
                turnoModificado.minutosSalida=minutosSeleccionados[1]
            })
            )
    },[diaSeleccionado,minutosSeleccionados,esTurnoBorrado])

    return (<>
    {!turno.id.startsWith("-1") && <div className="controlEmpleados__ventanaConfiguracion__turno">
        <BasicSelect  opciones={diasDeSemana} titulo={"Dia"} valorSelect={diaSeleccionado} setValorSelect={setDiaSeleccionado}/>
        <SliderHora minutosSeleccionados={minutosSeleccionados} setMinutosSeleccionados={setMinutosSeleccionados}/>
        <div className="controlEmpleados__ventanaConfiguracion__turno__borrar" onClick={()=>setEsTurnoBorrado(true)}><FontAwesomeIcon icon={faXmark} /></div>
    </div>}</>)
}