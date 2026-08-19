"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/app/redux/hooks";

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redux Global State
  const { totalQuantity } = useAppSelector((state) => state.cart);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const isUserLoggedIn = mounted && isAuthenticated;

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
                  {link.href === "/wishlist" && wishlistItems.length > 0 && (
                    <span style={{
                      backgroundColor: "#088178",
                      color: "#fff",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "11px",
                      marginLeft: "4px"
                    }}>
                      {wishlistItems.length}
                    </span>
                  )}
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
          style={{ position: "relative" }}
        >
          <i className="far fa-shopping-bag"></i>
          {totalQuantity > 0 && (
            <span style={{
              position: "absolute",
              top: "-8px",
              right: "-10px",
              backgroundColor: "#088178",
              color: "#fff",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "11px",
              fontWeight: "bold"
            }}>
              {totalQuantity}
            </span>
          )}
        </Link>
        <Link
          className={
            isUserLoggedIn
              ? pathname === "/profile"
                ? "active"
                : ""
              : pathname === "/login" || pathname === "/register"
              ? "active"
              : ""
          }
          href={isUserLoggedIn ? "/profile" : "/login"}
          title={isUserLoggedIn ? `My Account (${user?.name || "User"})` : "Login / Register"}
        >
          <i
            className={isUserLoggedIn ? "fas fa-user" : "far fa-user"}
            style={{
              color: isUserLoggedIn ? "#088178" : "#222",
              fontSize: "17px",
            }}
          ></i>
        </Link>
      </div>

      <div className="mobile">
        <Link href="/cart" style={{ position: "relative" }}>
          <i className="far fa-shopping-bag"></i>
          {totalQuantity > 0 && (
            <span style={{
              position: "absolute",
              top: "-8px",
              right: "-10px",
              backgroundColor: "#088178",
              color: "#fff",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "11px",
              fontWeight: "bold"
            }}>
              {totalQuantity}
            </span>
          )}
        </Link>
        <Link href={isUserLoggedIn ? "/profile" : "/login"} style={{ marginLeft: "15px" }}>
          <i
            className={isUserLoggedIn ? "fas fa-user" : "far fa-user"}
            style={{ color: isUserLoggedIn ? "#088178" : "#222", fontSize: "17px" }}
          ></i>
        </Link>
        <i id="bar" className="fas fa-outdent"></i>
      </div>
    </section>
  );
}
