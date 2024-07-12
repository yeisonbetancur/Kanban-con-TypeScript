import pool from '../db.js';
import z from 'zod';
import { columnSchema } from '../Schemas/columnsSchemas.js';
import jwt from 'jsonwebtoken';
// Obtener las columnas por ID de usuario
export const getColumnByUserId = async (req, res) => {
    const { user_id } = req.params;
    // Validar column id manualmente
    if (user_id === 'undefined' || parseInt(user_id) <= 0 || !Number.isInteger(parseInt(user_id))) {
        return res.status(400).json({ error: 'Invalid user id' });
    }
    try {
        const { rows } = await pool.query('SELECT * FROM columns WHERE user_id = $1', [user_id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Column not found' });
        }
        res.status(200).json(rows);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Crear una nueva columna
export const createColumn = async (req, res) => {
    const { title, position = 1 } = req.body;
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;
    console.log(user_id + " " + title
        + " " + position);
    try {
        columnSchema.parse({ title, user_id, position });
        const { rows } = await pool.query('INSERT INTO columns (title, user_id, position) VALUES ($1, $2, $3) RETURNING *', [title, user_id, position]);
        res.status(201).json(rows[0]);
    }
    catch (error) {
        return handleError(error, res);
    }
};
// Actualizar una columna por ID
export const updateColumn = async (req, res) => {
    const { user_id } = req.params;
    const { title } = req.body;
    if (!title || !user_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (user_id === 'undefined' || parseInt(user_id) <= 0 || !Number.isInteger(parseInt(user_id))) {
        return res.status(400).json({ error: 'Invalid user id' });
    }
    try {
        columnSchema.parse({ title, user_id });
        const result = await pool.query('UPDATE columns SET title = $1 WHERE user_id = $2 RETURNING *', [title, user_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Column not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        return handleError(error, res);
    }
};
// Eliminar una columna por id
export const deleteColumn = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('DELETE FROM columns WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Column not found' });
        }
        res.status(200).json({ message: 'Column deleted successfully' });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        return handleError(error, res);
    }
};
// Exporta la función getSectionsTasks que obtiene todas las secciones de un usuario específico con sus tareas
export const getSectionsTasks = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;
    if (user_id === 'undefined' || parseInt(user_id) <= 0 || !Number.isInteger(parseInt(user_id))) {
        return res.status(400).json({ error: 'Invalid user id' });
    }
    try {
        const { rows: columns } = await pool.query('SELECT * FROM columns WHERE user_id = $1', [user_id]);
        if (columns.length === 0) {
            return res.status(404).json({ error: 'Column not found' });
        }
        // Array de ojetos para almacenar las columnas y sus cartas
        const columnsWithTasks = [];
        // iterar sobre las columnas y obtener sus tareas
        for (const column of columns) {
            const { rows: tasks } = await pool.query('SELECT * FROM cards WHERE column_id = $1', [column.id]);
            columnsWithTasks.push({ column, tasks });
        }
        res.status(200).json(columnsWithTasks);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        return handleError(error, res);
    }
};
// Cambiar la posición de una columna
export const changeColumnPosition = async (req, res, next) => {
    const { column_id, position } = req.body;
    console.log(column_id, position);
    if (column_id === 'undefined' || parseInt(column_id) <= 0 || !Number.isInteger(parseInt(column_id))) {
        return res.status(400).json({ error: 'Invalid column id' });
    }
    if (position === 'undefined' || parseInt(position) <= 0 || !Number.isInteger(parseInt(position))) {
        return res.status(400).json({ error: 'Invalid position' });
    }
    try {
        const { rows } = await pool.query('UPDATE columns SET position = $1 WHERE id = $2 RETURNING *', [position, column_id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Column not found' });
        }
        res.status(200).json({ message: 'Column position updated successfully',
            column: rows[0]
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
    }
};
// manejador de errores
function handleError(error, res) {
    if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors[0].message });
    }
    // error del servidor cuando pide una columna que ya existe
    if (error.code === '23505') {
        return res.status(409).json({ error: error.errors[0].message });
    }
    // si el id de usuario es inválido
    if (error.code === '23503') {
        return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
}
//# sourceMappingURL=columnController.js.map