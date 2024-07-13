import bcrypt from 'bcrypt';
import pool from '../db.js';
import jwt from 'jsonwebtoken';
import { loginSchema, registerSchema } from '../Schemas/userSchemas.js';
import z from 'zod';
export const createUser = async (req, res) => {
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
        const { rows } = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);
        // crear colimna por defecto
        await pool.query('INSERT INTO columns (title, user_id, position) VALUES ($1, $2, $3) RETURNING *', ['column', rows[0].id, 1]);
        res.status(201).json({
            id: rows[0].id,
            username: rows[0].username,
            email: rows[0].email
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        loginSchema.parse({ email, password });
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'user not found' });
        }
        const user = rows[0];
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
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Solo se envía a través de HTTPS en producción
            sameSite: 'strict',
        });
        res.status(200).json({ message: 'Login successful', user: userWithoutPassword, token: token });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Cerrar sesión y borrar el token, si existe
export const logoutUser = (res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
};
// Check the token 
export const checkToken = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        res.status(200).json({ message: 'Authorized' });
    }
    catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
export const deleteUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        loginSchema.parse({ email, password });
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        await pool.query('DELETE FROM users WHERE email = $1', [email]);
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Chage all dates from user 
export const updateUser = async (req, res) => {
    const { newEmail, newPassword, newUsername } = req.body;
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    // obtener id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;
    if (!newEmail || !newPassword || !newUsername) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = rows[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET email = $1, username = $2, password = $3 WHERE id = $4', [newEmail, newUsername, hashedPassword, user_id]);
        res.status(200).json({ message: 'User updated successfully' });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Obtener un usuarios Por id
export const getUserById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
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
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=userController.js.map