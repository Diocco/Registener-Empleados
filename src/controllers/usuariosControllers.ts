import { ipcMain } from 'electron';
import sqlite3 from 'sqlite3';
import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';


export function usuariosControllers() {
    ipcMain.handle('agregar-empleado', async (_event, nombre: string) => {
        return new Promise((resolve, reject) => {
            const usuarioId = uuidv4(); 
            db.run(
                `INSERT INTO usuarios (nombre,usuarioId) VALUES (?, ?)`,
                [nombre,usuarioId],
                function (err) {
                    if (err) reject('Error al insertar: ' + err.message);
                    resolve(`Empleado agregado con ID: ${usuarioId}`);
                }
            );
        });
    });

    ipcMain.handle('obtener-empleados', async () => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM usuarios`,
                function (err,rows) {
                    if (err) reject('Error al insertar: ' + err.message);
                    resolve(rows);
                }
            );
        });
    });
}