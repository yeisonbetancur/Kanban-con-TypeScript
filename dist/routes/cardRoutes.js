"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const columnController_1 = require("../controllers/columnController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.get('/columns/:user_id', auth_1.authenticate, columnController_1.getColumnByUserId); // obtener las columnas de un usuario
router.post('/columns', auth_1.authenticate, columnController_1.createColumn); // crear una nueva columna
router.put('/columns/:user_id', auth_1.authenticate, columnController_1.updateColumn); // actualizar una columna
router.delete('/columns/:user_id', auth_1.authenticate, columnController_1.deleteColumn); // eliminar una columna
exports.default = router;
