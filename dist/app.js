import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import columnRoutes from './routes/columnRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    Headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH,  DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    },
    allowedHeaders: ['Content-Type'],
};
const app = express();
app.options('*', cors());
const port = process.env.PORT || 3000;
// Configura Express para servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));
// Ruta para servir el archivo HTML en la raíz
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use('/api', userRoutes); // Ruta para los usuarios
app.use('/api', columnRoutes); // Ruta para las columnas
app.use('/api', cardRoutes); // Ruta para las tarjetas
// Middleware para manejar errores
app.use((err, _req, res, next) => {
    console.error(err.stack);
    if (err.name === 'ValidationError') {
        res.status(400).json({ error: err.message });
    }
    else {
        res.status(500).send('Internal Server Error');
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=app.js.map