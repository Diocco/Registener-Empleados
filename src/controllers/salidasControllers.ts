import { ipcMain } from 'electron';
import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';


export function salidasControllers() {

    ipcMain.handle('salida-empleado', async (_event, usuarioId: string) => {
        return new Promise((resolve, reject) => {
            const id = uuidv4(); 
            const horaSalida = new Date().getTime()

            db.run(
                `INSERT INTO salidas (id,usuarioId,horaSalida) VALUES (?, ?, ?)`,
                [id,usuarioId,horaSalida],
                function (err) {
                    if (err) reject('Error al insertar: ' + err.message);
                    resolve(`Salida registrada con id: ${id}`);
                }
            );
        });
    });

    ipcMain.handle('obtener-salidas', async () => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM salidas`,
                function (err,rows) {
                    if (err) reject('Error al obtener la tabla de salidas: ' + err.message);
                    resolve(rows);
                }
            );
        });
    });

    ipcMain.handle('obtener-salidaHoy', async (_event, usuarioId: string) => {
        return new Promise((resolve, reject) => {

            const inicioDelDia = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
            const finalDelDia = new Date(new Date().setHours(23, 59, 59, 999)).getTime();
            db.get(`
                SELECT * FROM salidas 
                WHERE usuarioId = ? 
                AND horaSalida > ? 
                AND horaSalida < ?
                ORDER BY horaSalida DESC
                `,[usuarioId,inicioDelDia,finalDelDia],
                function (err,row) {
                    if (err) reject('Error al obtener la salida de hoy: ' + err.message);
                    resolve(row);
                }
            );
        });
    });


}