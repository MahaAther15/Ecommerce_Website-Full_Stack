"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isNoHeaderFooterPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/profile" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isNoHeaderFooterPage) {
    return <main style={{ height: "100vh", overflow: "hidden" }}>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
