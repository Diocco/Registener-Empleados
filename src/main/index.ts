import { app, BrowserWindow ,ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import os from'os';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dialog } from 'electron';
import db from '../db/database';
import { usuariosControllers } from '../controllers/usuariosControllers';

// Crear la ventana de Electron
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, // Resolución de lanzamiento (ancho)
    height: 720, // Resolución de lanzamiento (alto)
    minWidth: 1024,
    minHeight: 768,
    // icon: path.join(__dirname, '../images/icon.ico'), // Ruta del icono
    webPreferences: {
      nodeIntegration: true, // No habilitar la integración de Node.js en el frontend
      contextIsolation: false,  // Mantener el contexto aislado
    },
  });

  // mainWindow.setMenu(null); // Ocultar la barra de menú
  mainWindow.webContents.openDevTools(); // Muestra el devtools

  mainWindow.loadFile(path.join(__dirname, '../index.html')) // Carga el html con todo el programa

  // Crear las tablas si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      usuarioId TEXT PRIMARY KEY,
      nombre TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS salidas (
      hora INTEGER NOT NULL,
      usuarioId TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS entradas (
      hora INTEGER NOT NULL,
      usuarioId TEXT NOT NULL
    );
  `);


  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}


// Cuando Electron esté listo, crear la ventana
app.whenReady().then(async () => {

  // Crear la ventana de la aplicación Electron
  usuariosControllers();
  createWindow();

  // Si hay otras ventanas abiertas, salir de la aplicación cuando todas se cierren
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});


// En macOS, es común volver a crear la ventana cuando se vuelve a abrir la aplicación
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
    // Verificar conexión a la base de datos
    db.serialize(() => {
      db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
          if (err) {
              console.error('Error al verificar la base de datos:', err.message);
          } else {
              console.log('Base de datos conectada correctamente.');
          }
      });
  });
  }
});