import sqlite3 from 'sqlite3';

// Ruta donde se almacenará la base de datos
const DB_PATH = './src/db/empleados.db';

// Abre o crea la base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
        return;
    }
    console.log('Conectado a la base de datos SQLite.');
});

// Exporta la conexión para usarla en otros archivos
export default db;
