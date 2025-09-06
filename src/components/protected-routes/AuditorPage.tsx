"use client";

import { ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute";

export default function AuditorPage({ children }: { children: ReactNode }) {
    return <ProtectedRoute allowedRoles={["auditor"]}>{children}</ProtectedRoute>;
}
