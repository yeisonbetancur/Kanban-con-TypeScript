import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.ts';
import jwt from 'jsonwebtoken';
import { loginSchema, registerSchema, userSchema } from '../Schemas/userSchemas.ts';

interface User {
  id: number;
  username: string;
  email: string;
  password: string;
}

export const createUser = async (req: Request, res: Response): Promise<Response> => {
  const { username, email, password } = req.body;

  try {
    registerSchema.parse({ username, email, password });

    // Verificar si el usuario ya existe
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

    // Agregar un retorno al final para cubrir todos los casos
    return res.status(200).json({ message: 'User creation handled' });  
};

export const loginUser = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  try {
    loginSchema.parse({ email, password });

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user: User = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo se envía a través de HTTPS en producción
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }

    // Agregar un retorno al final para cubrir todos los casos
    return res.status(200).json({ message: 'Login handled' });
};

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    loginSchema.parse({ email, password });

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user: User = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    await pool.query('DELETE FROM users WHERE email = $1', [email]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

    // Agregar un retorno al final para cubrir todos los casos
    return res.status(200).json({ message: 'User deletion handled' });
};

export const updateUserEmail = async (req: Request, res: Response): Promise<Response> => {
  const { email, newEmail, password } = req.body;

  if (!email || !newEmail || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    userSchema.pick({ email: true, password: true }).parse({ email, password });

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user: User = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (user.email === newEmail) {
      return res.status(400).json({ error: 'New email must be different from old email' });
    }

    await pool.query('UPDATE users SET email = $1 WHERE email = $2', [newEmail, email]);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }

    // Agregar un retorno al final para cubrir todos los casos
    return res.status(200).json({ message: 'User email update handled' });
};

export const updateUserPassword = async (req: Request, res: Response): Promise<Response> => {
  const { email, password, newPassword } = req.body;

  if (!email || !password || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    userSchema.pick({ email: true, password: true, username: true }).parse({ email, password, username: 'dummy' });

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user: User = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }

  // Agregar un retorno al final para cubrir todos los casos
  return res.status(200).json({ message: 'User password update handled' });
};