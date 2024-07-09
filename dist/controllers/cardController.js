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
exports.deleteCard = exports.updateCard = exports.createCard = exports.getCardsByColumnId = void 0;
const db_ts_1 = __importDefault(require("../db.ts"));
const zod_1 = __importDefault(require("zod"));
// Validar los datos de la tarjeta
const cardSchema = zod_1.default.object({
    column_id: zod_1.default.number().int().positive(),
    user_id: zod_1.default.number().int().positive(),
    title: zod_1.default.string().min(1).max(255),
    description: zod_1.default.string().optional(),
});
// Obtener las tarjetas por ID de la columna
const getCardsByColumnId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { column_id } = req.params;
    try {
        const result = yield db_ts_1.default.query('SELECT * FROM cards WHERE column_id = $1', [column_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.status(200).json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getCardsByColumnId = getCardsByColumnId;
// Crear una nueva tarjeta
const createCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, column_id, description, user_id } = req.body;
    try {
        // Validar datos con Zod
        cardSchema.parse({ column_id, user_id, title, description });
        const result = yield db_ts_1.default.query('INSERT INTO cards (title, column_id, description, user_id) VALUES ($1, $2, $3, $4) RETURNING *', [title, column_id, description, user_id]);
        if (result.rows.length === 0) {
            return res.status(500).json({ error: 'Failed to create card' });
        }
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        if (error instanceof zod_1.default.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        else {
            console.error('Error creating card:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
});
exports.createCard = createCard;
// Actualizar una tarjeta por ID
const updateCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!zod_1.default.string().min(1).max(255).safeParse(title).success) {
        return res.status(400).json({ error: 'Invalid title' });
    }
    try {
        const result = description
            ? yield db_ts_1.default.query('UPDATE cards SET title = $1, description = $2 WHERE id = $3 RETURNING *', [title, description, id])
            : yield db_ts_1.default.query('UPDATE cards SET title = $1 WHERE id = $2 RETURNING *', [title, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating card:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.updateCard = updateCard;
// Eliminar una tarjeta por ID
const deleteCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield db_ts_1.default.query('DELETE FROM cards WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.status(200).json({ message: 'Card deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteCard = deleteCard;
