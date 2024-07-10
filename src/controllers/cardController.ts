import { Request, Response } from 'express';
import pool from '../db.js';
import z from 'zod';

// Validar los datos de la tarjeta
const cardSchema = z.object({
  column_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});

//tipo para la respuesta a la promesa en las funciones
interface Card {
  id: number;
  column_id: number;
  user_id: number;
  title: string;
  description: string;
};


// Obtener las tarjetas por ID de la columna
export const getCardsByColumnId = async (req: Request, res: Response): Promise< Response | undefined> => {
    const { column_id } = req.params;
  
    try {
      const { rows} : {rows: Card[]} = await pool.query('SELECT * FROM cards WHERE column_id = $1', [column_id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Card not found' });
      }
      res.status(200).json( rows );
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
      // You can also add a return statement here to ensure all code paths return a response.
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

// Crear una nueva tarjeta
export const createCard = async (req: Request, res: Response): Promise<Response | undefined> => {
    const { title, column_id, description, user_id } = req.body;
  
    try {
      // Validar datos con Zod
      cardSchema.parse({ column_id, user_id, title, description });
  
      const { rows }: {rows: Card[]} = await pool.query(
        'INSERT INTO cards (title, column_id, description, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, column_id, description, user_id]
      );
  
      if (rows.length === 0) {
        return res.status(500).json({ error: 'Failed to create card' });
      }
  
      res.status(201).json(rows);
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
export const updateCard = async (req: Request, res: Response): Promise<Response | undefined> => {
    const { id } = req.params;
    // la descripcion es opcional
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!z.string().min(1).max(255).safeParse(title).success) {
        return res.status(400).json({ error: 'Invalid title' });
    }

    try {  
    const { rows }: {rows: Card[]} = description
    ? await pool.query(
        'UPDATE cards SET title = $1, description = $2 WHERE id = $3 RETURNING *',
        [title, description, id]
      )
    : await pool.query('UPDATE cards SET title = $1 WHERE id = $2 RETURNING *', [title, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        } else {
            console.error('Error updating card:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

// Eliminar una tarjeta por ID
export const deleteCard = async (req: Request, res: Response): Promise<Response | undefined> => {
    const { id } = req.params;
  
    try {
      const { rows }: {rows: Card[]} = await pool.query('DELETE FROM cards WHERE id = $1 RETURNING *', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Card not found' });
      }
      res.status(200).json({ message: 'Card deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
