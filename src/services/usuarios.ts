import { ipcRenderer } from "electron";
import { UsuariosI } from "../interfaces/empleados";
import { SalidasI } from "../interfaces/salidas";
import { EntradasI } from "../interfaces/entradas";

export const solicitarAgregarUsuario=async ({usuarioNombre}:{usuarioNombre:string})=>{
    const respuesta = await ipcRenderer.invoke('agregar-empleado', usuarioNombre);
    return respuesta
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

export const obtenerEntradaHoy =async ({usuarioId}:{usuarioId:string})=>{
    const respuesta = await ipcRenderer.invoke('obtener-entradaHoy',usuarioId) as EntradasI;
    return respuesta
}

export const solicitarActualizarUsuario =async ({usuario}:{usuario:UsuariosI})=>{
    const respuesta = await ipcRenderer.invoke('modificar-empleado',usuario) as EntradasI;
    return respuesta
}

export const solicitarEliminarUsuario =async ({usuarioId}:{usuarioId:string})=>{
    const respuesta = await ipcRenderer.invoke('eliminar-empleado',usuarioId) as EntradasI;
    return respuesta
}