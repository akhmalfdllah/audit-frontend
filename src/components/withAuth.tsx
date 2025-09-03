"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { ComponentType } from "react";

interface DecodedToken {
    id: string;
    role: "Admin" | "Auditor";
    exp: number;
    iat: number;
}

export default function withAuth<P extends object>(
    WrappedComponent: ComponentType<P>,
    allowedRoles: ("Admin" | "Auditor")[]
) {
    const ProtectedRoute = (props: P) => {
        const router = useRouter();
        const [loading, setLoading] = useState(true);
        const [isAuthorized, setIsAuthorized] = useState(false);

        useEffect(() => {
            const token = Cookies.get("access_token");
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const decoded: DecodedToken = jwtDecode(token);

                if (allowedRoles.includes(decoded.role)) {
                    setIsAuthorized(true);
                } else {
                    router.push("/dashboard");
                }
            } catch (err) {
                console.error("Token invalid:", err);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        }, [router]);

        if (loading) {
            return <p className="text-center mt-10">Loading...</p>;
        }

        return isAuthorized ? <WrappedComponent {...(props as P)} /> : null;
    };

    return ProtectedRoute;
}
