import { ipcMain } from 'electron';
import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';


export function entradasControllers() {

    ipcMain.handle('entrada-empleado', async (_event, usuarioId: string) => {
        return new Promise((resolve, reject) => {
            const id = uuidv4(); 
            const horaEntrada = new Date().getTime()

            db.run(
                `INSERT INTO entradas (id,usuarioId,horaEntrada) VALUES (?, ?, ?)`,
                [id,usuarioId,horaEntrada],
                function (err) {
                    if (err) reject('Error al insertar: ' + err.message);
                    resolve(`Entrada registrada con id: ${id}`);
                }
            );
        });
    });

    ipcMain.handle('obtener-entradas', async () => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM entradas`,
                function (err,rows) {
                    if (err) reject('Error al obtener la tabla de entradas: ' + err.message);
                    resolve(rows);
                }
            );
        });
    });

    ipcMain.handle('obtener-entradaHoy', async (_event, usuarioId: string) => {
        return new Promise((resolve, reject) => {

            const inicioDelDia = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
            const finalDelDia = new Date(new Date().setHours(23, 59, 59, 999)).getTime();
            db.get(`
                SELECT * FROM entradas 
                WHERE usuarioId = ? 
                AND horaEntrada > ? 
                AND horaEntrada < ?
                ORDER BY horaEntrada DESC
                `,[usuarioId,inicioDelDia,finalDelDia],
                function (err,row) {
                    if (err) reject('Error al obtener la entrada de hoy: ' + err.message);
                    resolve(row);
                }
            );
        });
    });


}