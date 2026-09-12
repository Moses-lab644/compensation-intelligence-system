import { z } from "zod";

export const createCompensationSchema = z.object({
  company: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name is too long"),

  role: z
    .string()
    .trim()
    .min(2, "Role must be at least 2 characters")
    .max(100, "Role is too long"),

  level: z
    .string()
    .trim()
    .min(1, "Level is required")
    .max(50, "Level is too long"),

  country: z
    .string()
    .trim()
    .min(2, "Country is required")
    .max(100, "Country name is too long"),

  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(100, "City name is too long"),

  baseSalary: z
    .number()
    .positive("Base salary must be greater than 0"),

  bonus: z
    .number()
    .nonnegative("Bonus cannot be negative")
    .optional()
    .default(0),

  stock: z
    .number()
    .nonnegative("Stock cannot be negative")
    .optional()
    .default(0),

  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter code")
    .transform((value) => value.toUpperCase()),

  source: z
    .string()
    .trim()
    .min(2, "Source is required")
    .max(50, "Source is too long"),
});

export type CreateCompensationInput =
  z.infer<typeof createCompensationSchema>;