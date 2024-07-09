"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteColumn = exports.updateColumn = exports.createColumn = exports.getColumnByUserId = void 0;
const db_1 = __importDefault(require("../db"));
const zod_1 = __importDefault(require("zod"));
// Esquema de validación para columnas
const columnSchema = zod_1.default.object({
    title: zod_1.default.string(),
    user_id: zod_1.default.string()
});
// Obtener las columnas por ID de usuario
const getColumnByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    try {
        const result = yield db_1.default.query('SELECT * FROM columns WHERE user_id = $1', [user_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Column not found' });
        }
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getColumnByUserId = getColumnByUserId;
// Crear una nueva columna
const createColumn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, user_id } = req.body;
    try {
        columnSchema.parse({ title, user_id });
        const result = yield db_1.default.query('INSERT INTO columns (title, user_id) VALUES ($1, $2) RETURNING *', [title, user_id]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        if (error instanceof zod_1.default.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createColumn = createColumn;
// Actualizar una columna por ID
const updateColumn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const result = yield db_1.default.query('UPDATE columns SET title = $1 WHERE user_id = $2 RETURNING *', [title, user_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Column not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.updateColumn = updateColumn;
// Eliminar una columna por user_id
const deleteColumn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    if (!zod_1.default.string().safeParse(user_id).success) {
        return res.status(400).json({ error: 'Invalid user_id' });
    }
    try {
        const result = yield db_1.default.query('DELETE FROM columns WHERE user_id = $1 RETURNING *', [user_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Column not found' });
        }
        res.status(200).json({ message: 'Column deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteColumn = deleteColumn;
