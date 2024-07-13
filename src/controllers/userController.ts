import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import jwt from 'jsonwebtoken';
import { loginSchema, registerSchema, userSchema } from '../Schemas/userSchemas.js';
import { User } from '../types';
import z from 'zod';

export const createUser = async (req: Request, res: Response): Promise<Response | undefined> => {
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
    const { rows}: { rows: User[] } = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );

    // crear colimna por defecto
    await pool.query('INSERT INTO columns (title, user_id, position) VALUES ($1, $2, $3) RETURNING *', ['column', rows[0].id, 1]);

    res.status(201).json({
      id: rows[0].id,
      username: rows[0].username,
      email: rows[0].email
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  } 
};

export const loginUser = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { email, password } = req.body;

  try {
    loginSchema.parse({ email, password });

    const { rows}: { rows: User[] } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'user not found' });
    }

    const user: User = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Crear objeto sin la contraseña
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email
    };


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

    res.status(200).json({ message: 'Login successful', user: userWithoutPassword, token: token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cerrar sesión y borrar el token, si existe
export const logoutUser = ( res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
};

// Check the token 
export const checkToken =(req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  try{
    const decode = jwt.verify(token as string, process.env.JWT_SECRET as string);
    if (!decode) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.status(200).json({ message: 'Authorized' });
  }
  catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    loginSchema.parse({ email, password });

    const { rows }: { rows: User[] } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user: User = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    await pool.query('DELETE FROM users WHERE email = $1', [email]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserEmail = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { email, newEmail } = req.body;

  if (!email || !newEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    userSchema.pick({ email: true}).parse({ email});

    const { rows }: { rows: User[] } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user: User = rows[0];
    if (user.email === newEmail) {
      return res.status(400).json({ error: 'New email must be different from old email' });
    }

    await pool.query('UPDATE users SET email = $1 WHERE email = $2', [newEmail, email]);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserPassword = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { email,  newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    userSchema.pick({ email: true, username: true }).parse({ email, username: 'dummy' });

    const { rows }: { rows: User[] } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user: User = rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cambiar el username
export const updateUserUsername = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { email, newUsername } = req.body;

  if (!email || !newUsername) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    userSchema.pick({ email: true}).parse({ email});

    const { rows }: { rows: User[] } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    await pool.query('UPDATE users SET username = $1 WHERE email = $2', [newUsername, email]);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Obtener un usuarios Por id
export const getUserById = async (req: Request, res: Response): Promise<Response | undefined> => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { rows }: { rows: User[] } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    // sin la contraseña
    const user = {
      id: rows[0].id,
      username: rows[0].username,
      email: rows[0].email
    };
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
