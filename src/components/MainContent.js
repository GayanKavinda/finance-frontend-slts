"use client";

import { usePathname } from "next/navigation";

export default function MainContent({ children }) {
  const pathname = usePathname();

  // Don't add top padding on auth pages where navbar is hidden, or home page for full-screen carousel
  const isAuthPage = ["/signup", "/signin", "/forgot-password", "/reset-password"].includes(pathname);
  const isHomePage = pathname === "/";
  const shouldAddTopPadding = !isAuthPage && !isHomePage;
  const mainClassName = `flex-1 ${shouldAddTopPadding ? "pt-16" : ""}`;

  return <main className={mainClassName}>{children}</main>;
}