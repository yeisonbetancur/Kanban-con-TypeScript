import pool from '../db.js';
import z from 'zod';
import { cardSchema } from '../Schemas/cardsSchemas.js';
// Obtener las tarjetas por ID de la columna
export const getCardsByColumnId = async (req, res) => {
    const { column_id } = req.params;
    // Validar column id manualmente
    if (column_id === 'undefined' || parseInt(column_id) <= 0 || !Number.isInteger(parseInt(column_id))) {
        return res.status(400).json({ error: 'Invalid column id' });
    }
    try {
        const { rows } = await pool.query('SELECT * FROM cards WHERE column_id = $1', [column_id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.status(200).json(rows);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error);
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Crear una nueva tarjeta
export const createCard = async (req, res) => {
    const { title, column_id, description, user_id, position = 1, position_column = 1 } = req.body;
    try {
        // Validar datos con Zod
        cardSchema.parse({ column_id, user_id, title, description, position, position_column });
        const { rows } = await pool.query('INSERT INTO cards (title, column_id, description, user_id, position, position_column) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [title, column_id, description, user_id, position, position_column]);
        if (rows.length === 0) {
            return res.status(500).json({ error: 'Failed to create card' });
        }
        res.status(201).json(rows);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        else {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.errors[0].message });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
// Actualizar una tarjeta por ID
export const updateCard = async (req, res) => {
    const { id } = req.params;
    // la descripcion es opcional
    const { title, description } = req.body;
    // Validar los datos manualmente
    if (id === 'undefined' || parseInt(id) <= 0 || !Number.isInteger(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid card id' });
    }
    if (!title) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!z.string().min(1).max(255).safeParse(title).success) {
        return res.status(400).json({ error: 'Invalid title' });
    }
    try {
        // Validar datos con Zod
        cardSchema.parse({ title, description });
        const { rows } = description
            ? await pool.query('UPDATE cards SET title = $1, description = $2 WHERE id = $3 RETURNING *', [title, description, id])
            : await pool.query('UPDATE cards SET title = $1 WHERE id = $2 RETURNING *', [title, id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.status(200).json(rows[0]);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        else {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
// Cambiar posicion de una tarjeta por ID
export const updateCardPosition = async (req, res) => {
    const { position, id } = req.body;
    // Validar los datos manualmente
    if (id === 'undefined' || parseInt(id) <= 0 || !Number.isInteger(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid card id' });
    }
    if (position === 'undefined' || parseInt(position) <= 0 || !Number.isInteger(parseInt(position))) {
        return res.status(400).json({ error: 'Invalid position' });
    }
    try {
        const { rows } = await pool.query('UPDATE cards SET position = $1 WHERE id = $2 RETURNING *', [position, id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.status(200).json(rows[0]);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};
// cambiar la posicion de la targeta con position_column
export const updateCardPosition_column = async (req, res) => {
    const { position_column, id } = req.body;
    // Validar los datos manualmente
    if (id === 'undefined' || parseInt(id) <= 0 || !Number.isInteger(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid card id' });
    }
    if (position_column === 'undefined' || parseInt(position_column) <= 0 || !Number.isInteger(parseInt(position_column))) {
        return res.status(400).json({ error: 'Invalid position' });
    }
    try {
        const { rows } = await pool.query('UPDATE cards SET position_column = $1 WHERE id = $2 RETURNING *', [position_column, id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.status(200).json(rows[0]);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};
// Eliminar una tarjeta por ID
export const deleteCard = async (req, res) => {
    const { id } = req.params;
    // Validar los datos manualmente
    if (id === 'undefined' || parseInt(id) <= 0 || !Number.isInteger(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid card id' });
    }
    try {
        const { rows } = await pool.query('DELETE FROM cards WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.status(200).json({ message: 'Card deleted successfully' });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=cardController.js.map