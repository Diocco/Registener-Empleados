import { ipcRenderer } from "electron";
import { UsuariosI } from "../interfaces/empleados";
import { TurnosI } from "../interfaces/turnos";

export const solicitarAgregarTurno=async ({turno}:{turno:TurnosI})=>{
    const respuesta = await ipcRenderer.invoke('agregar-turnos', turno.usuarioId,turno.dia,turno.minutosEntrada,turno.minutosSalida) as TurnosI
    return respuesta
}

export const eliminarTurno=async ({turnoId}:{turnoId: string})=>{
    const respuesta:UsuariosI[] = await ipcRenderer.invoke('eliminar-turnos',turnoId);
    return respuesta
}

export const modificarTurno=async ({turno}:{turno: TurnosI})=>{
    const respuesta = await ipcRenderer.invoke('modificar-turnos',turno.id,turno.dia,turno.minutosEntrada,turno.minutosSalida);
    return respuesta
}

export const obtenerTurnos=async ()=>{
    const respuesta = await ipcRenderer.invoke('obtener-turnos') as TurnosI[]
    return respuesta
}

export const obtenerTurnosPorUsuario =async ({usuarioId}:{usuarioId:string})=>{
    const respuesta = await ipcRenderer.invoke('obtenerPorUsuario-turnos',usuarioId) as TurnosI[];
    return respuesta
}
