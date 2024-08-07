import express from 'express';
import { getColumnByUserId, createColumn, updateColumn, deleteColumn, getSectionsTasks, changeColumnPosition, } from '../controllers/columnController.js';
import { authenticate } from '../middlewares/auth.js';
const router = express.Router();
router.put('/columns_position', authenticate, changeColumnPosition); // cambiar la posicion de una columna
router.get('/sections', authenticate, getSectionsTasks); // obtener las las columnas de un usuario
router.get('/columns/:user_id', authenticate, getColumnByUserId); // obtener las columnas de un usuario
router.post('/columns/create', authenticate, createColumn); // crear una nueva columna
router.put('/columns/:id', authenticate, updateColumn); // actualizar una columna
router.delete('/columns/:id', authenticate, deleteColumn); // eliminar una columna
export default router;
//# sourceMappingURL=columnRoutes.js.map