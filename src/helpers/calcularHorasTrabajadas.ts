import { RegistrosI } from '../interfaces/registros';

export const calcularHorasTrabajadas=(registros: RegistrosI[])=>{
  let horasTrabajadas:number = 0;
  let ultimaEntrada:number|undefined = undefined;
  let ultimaSalida:number|undefined = undefined;
  registros.slice().reverse().forEach(registro=>{
    if(registro.tipo==="entrada") {
      ultimaEntrada=registro.hora
      return
    }else if(ultimaEntrada){
      horasTrabajadas += registro.hora-ultimaEntrada
      ultimaEntrada=undefined
      ultimaSalida=registro.hora
    }else if(ultimaSalida){
      horasTrabajadas += registro.hora - ultimaSalida
      ultimaSalida = registro.hora
    }
  })
  return Number((horasTrabajadas/(1000*60*60)).toPrecision(2)) // Devuelve el resultado en horas
}