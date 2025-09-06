import axios from "@/lib/api";
import { LoginInput } from "@/lib/validation";

export async function login(data: LoginInput): Promise<{ ok: boolean; role?: "Admin" | "Auditor" }> {
    try {
        const res = await axios.post("/auth/signin", data, { withCredentials: true });

        // Backend Anda (berdasarkan log) mengirim { user, role }
        const role =
            res?.data?.role ||
            res?.data?.user?.role ||
            null;

        if (role !== "Admin" && role !== "Auditor") {
            console.warn("Role tidak ditemukan di response. Isi res.data:", res?.data);
            return { ok: true }; // login ok tapi role tidak ada (fallback)
        }

        return { ok: true, role };
    } catch (error) {
        console.error("Login gagal:", error);
        return { ok: false };
    }
}
