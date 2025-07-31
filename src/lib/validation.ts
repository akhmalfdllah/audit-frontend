// src/lib/validation.ts
import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email().refine(val => val.includes("@"), {message: "Email tidak valid",}),
    password: z.string().min(8, { message: "Password minimal 8 karakter" }),
})

export type LoginInput = z.infer<typeof loginSchema>

