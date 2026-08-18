"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAuthUser } from "@/app/libs/authApi";

export default function Navbar() {
  const pathname = usePathname();
  const [authUser, setAuthUser] = useState<{ fullName: string; email: string; role: string } | null>(null);

  // Check login status on component mount
  useEffect(() => {
    const user = getAuthUser();
    setAuthUser(user);
  }, [pathname]); // pathname change hone par (login/logout ke baad) refresh ho

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Blog", href: "/blogs" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Wishlist", href: "/wishlist" },
  ];

  return (
    <section id="header">
      {/* LEFT: Logo */}
      <Link href="/">
        <img className="logo" src="/img/logo.png" alt="Logo" />
      </Link>

      {/* CENTER: Navigation Links */}
      <nav className="nav-center">
        <ul id="nav-bar">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === "/blogs" && pathname === "/blog");
            return (
              <li key={link.href}>
                <Link
                  className={isActive ? "active" : ""}
                  href={link.href}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
          <a href="#" id="close">
            <i className="far fa-times"></i>
          </a>
        </ul>
      </nav>

      {/* RIGHT: Cart + User Icons */}
      <div className="nav-icons">
        <Link
          className={pathname === "/cart" ? "active" : ""}
          href="/cart"
        >
          <i className="far fa-shopping-bag"></i>
        </Link>
        <Link
          className={
            authUser
              ? pathname === "/profile"
                ? "active"
                : ""
              : pathname === "/login" || pathname === "/register"
              ? "active"
              : ""
          }
          href={authUser ? "/profile" : "/login"}
          title={authUser ? `Logged in as ${authUser.fullName}` : "Login / Register"}
        >
          <i
            className="far fa-user"
            style={{ color: authUser ? "#088178" : "inherit" }}
          ></i>
        </Link>
      </div>

      <div className="mobile">
        <Link href="/cart">
          <i className="far fa-shopping-bag"></i>
        </Link>
        <Link href={authUser ? "/profile" : "/login"} style={{ marginLeft: "15px" }}>
          <i className="far fa-user" style={{ color: authUser ? "#088178" : "inherit" }}></i>
        </Link>
        <i id="bar" className="fas fa-outdent"></i>
      </div>
    </section>
  );
}
