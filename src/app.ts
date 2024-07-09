import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes';
import columnRoutes from './routes/columnRoutes';
import cardRoutes from './routes/cardRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
  origin: '*', // Reemplaza con la URL de tu dominio o dominios permitidos
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configura Express para servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo HTML en la raíz
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use('/api', userRoutes); // Ruta para los usuarios
app.use('/api', columnRoutes); // Ruta para las columnas
app.use('/api', cardRoutes); // Ruta para las tarjetas

app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
  } else {
    next(err);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
