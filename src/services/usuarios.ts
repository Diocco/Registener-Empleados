import { ipcRenderer } from "electron";
import { UsuariosI } from "../interfaces/empleados";
import { SalidasI } from "../interfaces/salidas";

export const agregarEmpleado=async (setTexto: React.Dispatch<React.SetStateAction<string>>)=>{
    const respuesta = await ipcRenderer.invoke('agregar-empleado', "diego");
    setTexto(respuesta)
}

export const obtenerEmpleados=async ()=>{
    const respuesta:UsuariosI[] = await ipcRenderer.invoke('obtener-empleados');
    return respuesta
}

export const obtenerSalidas=async ()=>{
    const respuesta = await ipcRenderer.invoke('obtener-salidas');
    return respuesta
}

export const marcarSalida=async ({usuarioId}:{usuarioId:string})=>{
    const respuesta = await ipcRenderer.invoke('salida-empleado',usuarioId);
    return respuesta
}

export const marcarEntrada=async ({usuarioId}:{usuarioId:string})=>{
    const respuesta = await ipcRenderer.invoke('entrada-empleado',usuarioId);
    return respuesta
}

export const obtenerSalidaHoy =async ({usuarioId}:{usuarioId:string})=>{
    const respuesta = await ipcRenderer.invoke('obtener-salidaHoy',usuarioId) as SalidasI;
    return respuesta
}