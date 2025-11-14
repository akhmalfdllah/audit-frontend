import axios from "@/lib/api";

export async function checkAuth() {
    try {
        const res = await axios.get("/auth/me", { withCredentials: true });
        return { authenticated: true, user: res.data };
    } catch (err: any) {
        if (err?.response?.status === 401) {
            return { authenticated: false };
        }
        return { authenticated: false };
    }
}
