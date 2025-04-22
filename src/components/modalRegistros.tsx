import React, { useState } from "react"
import { UsuariosI } from "../interfaces/empleados"
import { Tab, Tabs } from "@mui/material"
import TablaRegistros from "./tabla"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"

export const ModalRegistro=({empleados,usuarioIdSeleccionado,setEsVerRegistros}:{empleados: UsuariosI[],usuarioIdSeleccionado:string,setEsVerRegistros: React.Dispatch<React.SetStateAction<string>>})=>{
    const registrosUsuario = useSelector((state:RootState)=>state.variablesReducer.registros.filter(registro=> registro.usuarioId === usuarioIdSeleccionado)) // Devuelve solo los registros que sean del usuario seleccionado

    const [tabRegistro,setTabRegistro]=  useState<number>(empleados.findIndex(empleado=>empleado.usuarioId===usuarioIdSeleccionado))
    const handleTabRegistro = (event: React.SyntheticEvent, newValue: number) => {
    setTabRegistro(newValue);
    };

    return (<>
    {empleados && <>
        <div id="registros">
          <Tabs
            value={tabRegistro}
            onChange={handleTabRegistro}
            variant="scrollable"
            scrollButtons="auto"
          >
            {empleados.map((empleado=><Tab onClick={()=>setEsVerRegistros(empleado.usuarioId)} label={empleado.nombre} key={empleado.usuarioId+"tab"}/>))}
          </Tabs>
          <div id="registros__filas">
            {registrosUsuario && <TablaRegistros rows={registrosUsuario} empleados={empleados} />}
          </div>
        </div>
      </>}
      </>)
}