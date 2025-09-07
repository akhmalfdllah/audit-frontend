import axios from "@/lib/api";
import { LoginInput } from "@/lib/validation";

export async function login(
  data: LoginInput
): Promise<{ ok: boolean; role?: "Admin" | "Auditor"; error?: string }> {
  try {
    const res = await axios.post("/auth/signin", data, { withCredentials: true });

    const role = res?.data?.role || res?.data?.user?.role || null;

    if (role !== "Admin" && role !== "Auditor") {
      console.warn("Role tidak ditemukan di response. Isi res.data:", res?.data);
      return { ok: true }; // login tetap dianggap berhasil, role fallback
    }

    return { ok: true, role };
  } catch (error: any) {
    let msg = "Terjadi kesalahan, coba lagi";

    const raw = error?.response?.data?.message;
    if (typeof raw === "string") {
      // biarkan backend yang menentukan pesan error
      msg = raw;
    }

    return { ok: false, error: msg };
  }
}
