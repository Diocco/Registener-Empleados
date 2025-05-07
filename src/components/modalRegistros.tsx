import React, { useState } from "react"
import { UsuariosI } from "../interfaces/empleados"
import { Button, Modal, Tab, Tabs } from "@mui/material"
import {TablaRegistros} from "./tabla"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"
import BasicSelect from "./select"

export const ModalRegistro=({empleados,usuarioIdSeleccionado,setEsVerRegistros}:{empleados: UsuariosI[],usuarioIdSeleccionado:string,setEsVerRegistros: React.Dispatch<React.SetStateAction<string>>})=>{
    const registrosUsuario = useSelector((state:RootState)=>state.variablesReducer.registros.filter(registro=> registro.usuarioId === usuarioIdSeleccionado)) // Devuelve solo los registros que sean del usuario seleccionado

    const [tabRegistro,setTabRegistro]=  useState<number>(empleados.findIndex(empleado=>empleado.usuarioId===usuarioIdSeleccionado))
    const [esExportar,setEsExportar] = useState(false)
    const [exportarMes,setExportarMes] = useState(1)
    const handleTabRegistro = (event: React.SyntheticEvent, newValue: number) => {
    setTabRegistro(newValue);
    };

    return (<>
    {empleados && <>
        <div id="registros">
          <Button color="primary" variant={"contained"} id="registros__exportar" onClick={()=>{setEsExportar(true)}}>Exportar</Button>
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

      <Modal
            open={esExportar}
            onClose={()=>setEsExportar(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            className="controlEmpleados__modal"
          >
            <div id="registros__modalExportar">
              <BasicSelect titulo={"Registros"} opciones={[{nombre:"Este mes",valor:0},{nombre:"Mes anterior",valor:1}]} valorSelect={exportarMes} setValorSelect={setExportarMes } />
              <Button color="primary" variant={"contained"}  onClick={()=>{setEsExportar(true)}}>Exportar</Button>
            </div>
        </Modal>
      </>)
}