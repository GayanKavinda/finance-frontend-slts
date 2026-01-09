"use client";

import { usePathname } from "next/navigation";

export default function MainContent({ children }) {
  const pathname = usePathname();

  // Don't add top padding on auth pages where navbar is hidden
  const isAuthPage = ["/signup", "/signin", "/forgot-password", "/reset-password"].includes(pathname);
  const mainClassName = `flex-1 ${isAuthPage ? "" : "pt-16"}`;

  return <main className={mainClassName}>{children}</main>;
}