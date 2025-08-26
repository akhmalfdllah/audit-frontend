"use client";

import { ReactNode } from "react";
import Sidebar from "./sidebar";

interface SidebarWrapperProps {
  children?: ReactNode;
  role: string;
  activeHome: boolean;
}

export default function SidebarWrapper({
  children,
  role,
  activeHome,
}: SidebarWrapperProps) {
  return (
    <div className="flex">
      <Sidebar role={role} activeHome={activeHome} />
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}
