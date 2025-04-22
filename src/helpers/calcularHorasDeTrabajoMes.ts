import { TurnosI } from "../interfaces/turnos";

  
  /**
   * Calcula las horas previstas de trabajo en el mes en curso hasta la fecha.
   * @param turnos Array de turnos semanales
   * @param now   Fecha “hoy” (por defecto, new Date())
   * @returns     Total de horas (decimal) que debería haber trabajado
   */
  export const calcularHorasEsteMes=(
    turnos: TurnosI[],
    now = new Date()
  ): number =>{
    const year  = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
    let totalMinutos = 0;
  
    // Recorro cada día desde 1 hasta hoy inclusive
    for (let d = 1; d <= today; d++) {
      const fecha = new Date(year, month, d);
      const dow   = fecha.getDay(); // 0–6
  
      // Por cada turno cuyo dia coincida con dow
      turnos
        .filter((t) => t.dia === dow)
        .forEach((t) => {
          // Para días pasados: siempre sumo turno completo
          // Para hoy (d === today): sumo hasta ahora (o turno completo si ya pasó)
          if (d < today) {
            totalMinutos += Math.max(0, t.minutosSalida - t.minutosEntrada);
          } else {
            // día = hoy
            const fin = Math.min(currentMinutes, t.minutosSalida);
            const inicio = t.minutosEntrada;
            if (fin > inicio) {
              totalMinutos += fin - inicio;
            }
          }
        });
    }
  
    // devuelvo en horas (decimal)
    return totalMinutos / 60;
  }
  