"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
// Ruta para crear un nuevo usuario (registro)
router.post('/user/register', userController_1.createUser);
// Ruta para el inicio de sesión
router.post('/user/login', userController_1.loginUser);
// Ruta para eliminar usuario
router.delete('/user/delete', auth_1.authenticate, userController_1.deleteUser);
// Ruta para actualizar email de usuario
router.put('/user/update/email', auth_1.authenticate, userController_1.updateUserEmail);
// Ruta para actualizar password de usuario
router.put('/user/update/password', auth_1.authenticate, userController_1.updateUserPassword);
exports.default = router;
