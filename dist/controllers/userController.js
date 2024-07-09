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
exports.updateUserPassword = exports.updateUserEmail = exports.deleteUser = exports.loginUser = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userSchemas_1 = require("../Schemas/userSchemas");
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        userSchemas_1.registerSchema.parse({ username, email, password });
        // Verificar si el usuario ya existe
        const userExists = yield db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Hashear la contraseña
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Crear el nuevo usuario
        const result = yield db_1.default.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createUser = createUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        userSchemas_1.loginSchema.parse({ email, password });
        const userResult = yield db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const user = userResult.rows[0];
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Solo se envía a través de HTTPS en producción
            sameSite: 'strict',
        });
        res.status(200).json({ message: 'Login successful' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.loginUser = loginUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        userSchemas_1.loginSchema.parse({ email, password });
        const userResult = yield db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const user = userResult.rows[0];
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        yield db_1.default.query('DELETE FROM users WHERE email = $1', [email]);
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteUser = deleteUser;
const updateUserEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newEmail, password } = req.body;
    if (!email || !newEmail || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        userSchemas_1.userSchema.pick({ email: true, password: true }).parse({ email, password });
        const userResult = yield db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const user = userResult.rows[0];
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        if (user.email === newEmail) {
            return res.status(400).json({ error: 'New email must be different from old email' });
        }
        yield db_1.default.query('UPDATE users SET email = $1 WHERE email = $2', [newEmail, email]);
        res.status(200).json({ message: 'User updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.updateUserEmail = updateUserEmail;
const updateUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, newPassword } = req.body;
    if (!email || !password || !newPassword) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        userSchemas_1.userSchema.pick({ email: true, password: true, username: true }).parse({ email, password, username: 'dummy' });
        const userResult = yield db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const user = userResult.rows[0];
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield db_1.default.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
        res.status(200).json({ message: 'User updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        return; // Add this line to handle the error case
    }
});
exports.updateUserPassword = updateUserPassword;
