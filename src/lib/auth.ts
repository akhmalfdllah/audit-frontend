// src/lib/auth.ts
import axios from "@/lib/api"
import { LoginInput } from "@/lib/validation"

export async function login(data: LoginInput): Promise<boolean> {
    try {
        const res = await axios.post("/auth/signin", data)
        console.log("Login berhasil:", res.data)
        return true
    } catch (error) {
        console.error("Login gagal:", error)
        return false
    }
}
