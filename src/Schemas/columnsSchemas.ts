import z from 'zod';

// Esquema de validación para columnas
export const columnSchema = z.object({
    title: z.string(),
    user_id: z.number().int().positive(),
})