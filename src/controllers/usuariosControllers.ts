import { ipcMain } from 'electron';
import sqlite3 from 'sqlite3';
import db from '../db/database';

export function usuariosControllers() {
    ipcMain.handle('agregar-empleado', async (_event, nombre: string) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO usuarios (nombre) VALUES (?)`,
                [nombre],
                function (err) {
                    if (err) reject('Error al insertar: ' + err.message);
                    resolve(`Empleado agregado con ID: ${this.lastID}`);
                }
            );
        });
    });
}