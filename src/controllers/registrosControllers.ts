import { ipcMain } from 'electron';
import db from '../db/database';


export function registrosControllers() {

    ipcMain.handle('obtener-registros', async (_event, usuarioId: string) => {

        const inicioDelMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0, 0);

        return new Promise((resolve, reject) => { // Busca los registros de entrada y salida de un usuario particular en este mes
            db.all( 
                `   SELECT 'entrada' AS tipo, horaEntrada AS hora, usuarioId
                    FROM entradas
                    WHERE usuarioId = ?
                    AND hora > ?
                    UNION
                    SELECT 'salida' AS tipo, horaSalida AS hora, usuarioId
                    FROM salidas
                    WHERE usuarioId = ?
                    AND hora > ?
                    ORDER BY hora DESC;`,
                    [usuarioId,inicioDelMes,usuarioId,inicioDelMes],
                function (err,rows) {
                    if (err) reject('Error al obtener la tabla de entradas: ' + err.message);
                    resolve(rows);
                }
            );
        });
    });

}