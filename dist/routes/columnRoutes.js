import express from 'express';
import { getColumnByUserId, createColumn, updateColumn, deleteColumn, getSectionsTasks, } from '../controllers/columnController.js';
import { authenticate } from '../middlewares/auth.js';
const router = express.Router();
router.get('/columns/:user_id', authenticate, getColumnByUserId); // obtener las columnas de un usuario
router.post('/columns', authenticate, createColumn); // crear una nueva columna
router.put('/columns/:user_id', authenticate, updateColumn); // actualizar una columna
router.delete('/columns/:user_id', authenticate, deleteColumn); // eliminar una columna
router.get('/sections/:user_id', authenticate, getSectionsTasks);
export default router;
//# sourceMappingURL=columnRoutes.js.map