"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

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
      <Link href="/">
        <img className="logo" src="/img/logo.png" alt="Logo" />
      </Link>
      <div className="nav-info">
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
          <li id="bag">
            <Link
              className={pathname === "/cart" ? "active" : ""}
              href="/cart"
            >
              <i className="far fa-shopping-bag"></i>
            </Link>
          </li>
          <li id="user">
            <Link
              className={
                pathname === "/login" || pathname === "/register" ? "active" : ""
              }
              href="/login"
              title="Login / Register"
            >
              <i className="far fa-user"></i>
            </Link>
          </li>
          <a href="#" id="close">
            <i className="far fa-times"></i>
          </a>
        </ul>
      </div>
      <div className="mobile">
        <Link href="/cart">
          <i className="far fa-shopping-bag"></i>
        </Link>
        <Link href="/login" style={{ marginLeft: "15px" }}>
          <i className="far fa-user"></i>
        </Link>
        <i id="bar" className="fas fa-outdent"></i>
      </div>
    </section>
  );
}
