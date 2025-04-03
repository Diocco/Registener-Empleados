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