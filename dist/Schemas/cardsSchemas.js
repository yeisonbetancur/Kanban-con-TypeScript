import z from 'zod';
// Validar los datos de la tarjeta
export const cardSchema = z.object({
    column_id: z.number().int().positive(),
    user_id: z.number().int().positive(),
    title: z.string().min(1),
    description: z.string().optional(),
    position: z.number().int().positive(),
    position_column: z.number().int().positive()
});
//# sourceMappingURL=cardsSchemas.js.map