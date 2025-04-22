import { ipcRenderer } from "electron";
import { RegistrosI } from "../interfaces/registros";

export const obtenerRegistros=async ()=>{
    const respuesta:RegistrosI[] = await ipcRenderer.invoke('obtener-registros2');
    return respuesta
}

