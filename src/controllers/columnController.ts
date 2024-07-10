import { Request, Response } from 'express';
import pool from '../db.js';
import z from 'zod';

// Esquema de validación para columnas
const columnSchema = z.object({
  title: z.string(),
  user_id: z.string()
});

// Obtener las columnas por ID de usuario
export const getColumnByUserId = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM columns WHERE user_id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Column not found' });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Crear una nueva columna
export const createColumn = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { title, user_id } = req.body;

  try {
    columnSchema.parse({ title, user_id });

    const result = await pool.query(
      'INSERT INTO columns (title, user_id) VALUES ($1, $2) RETURNING *',
      [title, user_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Actualizar una columna por ID
export const updateColumn = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { user_id } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      'UPDATE columns SET title = $1 WHERE user_id = $2 RETURNING *',
      [title, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Column not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Eliminar una columna por user_id
export const deleteColumn = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { user_id } = req.params;

  if (!z.string().safeParse(user_id).success) {
    return res.status(400).json({ error: 'Invalid user_id' });
  }

  try {
    const result = await pool.query('DELETE FROM columns WHERE user_id = $1 RETURNING *', [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Column not found' });
    }

    res.status(200).json({ message: 'Column deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};