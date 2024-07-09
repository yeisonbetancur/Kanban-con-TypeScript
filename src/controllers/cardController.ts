import { Request, Response } from 'express';
import pool from '../db.ts';
import z from 'zod';

// Validar los datos de la tarjeta
const cardSchema = z.object({
  column_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});

// Obtener las tarjetas por ID de la columna
export const getCardsByColumnId = async (req: Request, res: Response): Promise<Response> => {
    const { column_id } = req.params;
  
    try {
      const result = await pool.query('SELECT * FROM cards WHERE column_id = $1', [column_id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Card not found' });
      }
      res.status(200).json(result.rows);
      // If the code reaches this point, it means the query was successful,
      // but the function does not explicitly return a response.
      // You can add a return statement here to ensure all code paths return a response.
      return res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
      // You can also add a return statement here to ensure all code paths return a response.
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

// Crear una nueva tarjeta
export const createCard = async (req: Request, res: Response): Promise<Response> => {
    const { title, column_id, description, user_id } = req.body;
  
    try {
      // Validar datos con Zod
      cardSchema.parse({ column_id, user_id, title, description });
  
      const result = await pool.query(
        'INSERT INTO cards (title, column_id, description, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, column_id, description, user_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(500).json({ error: 'Failed to create card' });
      }
  
      res.status(201).json(result.rows[0]);
      // If the code reaches this point, it means the query was successful,
      // but the function does not explicitly return a response.
      // You can add a return statement here to ensure all code paths return a response.
      return res.status(201).json(result.rows[0]);
  
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      } else {
        console.error('Error creating card:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

// Actualizar una tarjeta por ID
export const updateCard = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!z.string().min(1).max(255).safeParse(title).success) {
        return res.status(400).json({ error: 'Invalid title' });
    }

    try {  
    const result = description
    ? await pool.query(
        'UPDATE cards SET title = $1, description = $2 WHERE id = $3 RETURNING *',
        [title, description, id]
      )
    : await pool.query('UPDATE cards SET title = $1 WHERE id = $2 RETURNING *', [title, id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Card not found' });
  }

  res.status(200).json(result.rows[0]);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        } else {
            console.error('Error updating card:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // If the code reaches this point, it means the query was successful,
    // but the function does not explicitly return a response.
    // You can add a return statement here to ensure all code paths return a response.
    return res.status(200).json({ message: 'Card updated successfully' });
};

// Eliminar una tarjeta por ID
export const deleteCard = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
  
    try {
      const result = await pool.query('DELETE FROM cards WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Card not found' });
      }
      res.status(200).json({ message: 'Card deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  
    // Agregar un retorno al final para cubrir todos los casos
    return res.status(200).json({ message: 'Card deletion handled' });
  };
