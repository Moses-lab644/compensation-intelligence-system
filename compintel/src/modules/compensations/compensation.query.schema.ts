import { z } from "zod";

export const getCompensationsQuerySchema = z.object({
company: z.string().trim().min(1).optional(),

companies: z
.string()
.trim()
.min(1)
.optional(),

role: z.string().trim().min(1).optional(),

level: z.string().trim().min(1).optional(),

country: z.string().trim().min(1).optional(),

city: z.string().trim().min(1).optional(),

currency: z
.string()
.trim()
.length(3)
.transform((value) => value.toUpperCase())
.optional(),

page: z.coerce.number().int().positive().default(1),

limit: z.coerce.number().int().positive().max(50).default(10),
});

export type GetCompensationsQuery =
z.infer<typeof getCompensationsQuerySchema>;
