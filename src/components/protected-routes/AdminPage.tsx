"use client";

import { ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute";

export default function AdminPage({ children }: { children: ReactNode }) {
    return <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>;
}
