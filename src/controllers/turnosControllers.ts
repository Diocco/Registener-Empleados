import { ipcMain } from 'electron';
import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';


export function turnosControllers() {
    ipcMain.handle('agregar-turnos', async (_event, usuarioId: string,dia:number,minutosEntrada:number,minutosSalida:number) => {
        return new Promise((resolve, reject) => {
            const id = uuidv4(); 

            db.run(
                `INSERT INTO turnos (id,usuarioId,dia,minutosEntrada,minutosSalida) VALUES (?, ?,?, ?, ?)`,
                [id,usuarioId,dia,minutosEntrada,minutosSalida],
                function (err) {
                    if (err) reject('Error al insertar: ' + err.message);
                    resolve(`Turno registrada con id: ${id}`);
                }
            );
        });
    });

    ipcMain.handle('eliminar-turnos', async (_event, turnoId: string) => {
        return new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM turnos   WHERE id = ?;`,
                [turnoId],
                (err) => { if (err) return reject(err); }
            );
        });
    });

    ipcMain.handle('modificar-turnos', async (_event, turnoId: string,dia:number,minutosEntrada:number,minutosSalida:number) => {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE turnos
                SET dia = ?, minutosEntrada = ?, minutosSalida = ?
                WHERE id = ?`,
                [dia,minutosEntrada,minutosSalida,turnoId],
                function (err) {
                    if (err) reject('Error al modificar el usuario: ' + err.message);
                    resolve(`Turno modificado con ID: ${turnoId}`);
                }
            );
        });
    });

    ipcMain.handle('obtener-turnos', async () => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM turnos`,
                function (err,rows) {
                    if (err) reject('Error al obtener la tabla de turnos: ' + err.message);
                    resolve(rows);
                }
            );
        });
    });

    ipcMain.handle('obtenerPorUsuario-turnos', async (_event, usuarioId: string) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM turnos
                WHERE usuarioId = ? 
                ORDER BY dia ASC`,
                [usuarioId],
                function (err,rows) {
                    if (err) reject('Error al obtener la tabla de entradas: ' + err.message);
                    resolve(rows);
                }
            );
        });
    });

}