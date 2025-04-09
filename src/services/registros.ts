import { ipcRenderer } from "electron";
import { RegistrosI } from "../interfaces/registros";

export const obtenerRegistros=async (usuarioId:string)=>{
    const respuesta:RegistrosI[] = await ipcRenderer.invoke('obtener-registros',usuarioId);
    return respuesta
}

