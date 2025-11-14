import api from "./api";

export async function login(credentials: { email: string; password: string }) {
  try {
    const res = await api.post("/auth/signin", credentials, {
      withCredentials: true,
    });

    return {
      ok: true,
      role: res.data.role,
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err.response?.data?.message || "Login gagal",
    };
  }
}

export async function fetchMe() {
  try {
    const res = await api.get("/auth/me");
    return { ok: true, user: res.data };
  } catch {
    return { ok: false };
  }
}
