"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const columnRoutes_1 = __importDefault(require("./routes/columnRoutes"));
const cardRoutes_1 = __importDefault(require("./routes/cardRoutes"));
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const corsOptions = {
    origin: '*', // Reemplaza con la URL de tu dominio o dominios permitidos
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
};
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Configura Express para servir archivos estáticos desde el directorio 'public'
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Ruta para servir el archivo HTML en la raíz
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use('/api', userRoutes_1.default); // Ruta para los usuarios
app.use('/api', columnRoutes_1.default); // Ruta para las columnas
app.use('/api', cardRoutes_1.default); // Ruta para las tarjetas
app.use((err, _req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});
app.use((err, _req, res, next) => {
    if (err.name === 'ValidationError') {
        res.status(400).json({ error: err.message });
    }
    else {
        next(err);
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
