import { Box } from "@mui/material"
import React, { useEffect, useState } from "react"
import BasicSelect from "./select"
import {SliderHora }from "./sliderHora";
import { TurnosI } from "../interfaces/turnos";
import {produce} from "immer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";



export const Turno =({turno,setTurnos,usuarioId}:{turno:TurnosI,setTurnos: React.Dispatch<React.SetStateAction<TurnosI[]>>,usuarioId:string})=>{
    
    const minutosHandlerer=(minutos:number[])=>{
        setTurnos((prevState) => 
            produce(prevState, (draft) => {
                let turnoModificado = draft.find(turnoBorrador=> turnoBorrador.id===turno.id)! // Se busca el turno que fue modificado
                if(!turnoModificado) return console.error("Error al actualizar el turno")
                turnoModificado.minutosEntrada=minutos[0]
                turnoModificado.minutosSalida=minutos[1]
            })
        )
    }

    const borrarTurno=()=>{
        if(turno.id!==""){// Si el turno no tiene id es porque es el id de muestra
            setTurnos((prevState) => 
                produce(prevState, (draft) => {
                    let turnoModificado = draft.find(turnoBorrador=> turnoBorrador.id===turno.id)! // Se busca el turno que fue modificado
                    if(!turnoModificado) return console.error("Error al borrar el turno")
                    turnoModificado.id="-1"+turno.id // Se agrega un "-1" adelante del id para indicar que el turno fue eliminado
                })
            )
        }
    }

    const habilitarTurno=()=>{

        if(turno.id===""){ // Si el turno no tiene id entonces genera un nuevo turno
            const idProvisorio = "00000"+(Math.random()*Math.random()).toString() // El id siempre comiensza con "00000" para indicar que es un id provisorio
            const turnoModificado = {
            usuarioId,
            id: idProvisorio,
            dia: turno.dia,
            minutosEntrada: 480,
            minutosSalida: 960
            }
            setTurnos((prevState) => 
                produce(prevState, (draft) => {draft.push(turnoModificado)})
            )

        }else if(turno.id.startsWith("-1")){ // Si el turno empieza con "-1" indica que el turno previamente se borro, por lo que se lo modifica para que deje de estar borrado
            setTurnos((prevState) => 
                produce(prevState, (draft) => {
                    let turnoModificado = draft.find(turnoBorrador=> turnoBorrador.id===turno.id)! // Se busca el turno que fue modificado
                    if(!turnoModificado) return console.error("Error al actualizar el turno")
                    turnoModificado.id=turno.id.slice(2) // Se quita el "-1" del id indicando que el turno sirge vigente
                })
            )
        }else{
            console.error("No se pudo determinar el turno")
        }
    }

    
    return (
    <div className="ventanaConfiguracion__turnos-div">
        <SliderHora minutosSeleccionados={[turno.minutosEntrada,turno.minutosSalida]} setMinutosSeleccionados={minutosHandlerer} disabled={(turno.id===""||turno.id.startsWith("-1"))} />
        {(turno.id===""||turno.id.startsWith("-1"))
            ?<div onClick={()=>habilitarTurno()}><FontAwesomeIcon icon={faPlus} /></div>
            :<div onClick={()=>borrarTurno()}><FontAwesomeIcon icon={faXmark} /></div>
        }
    </div>)
}