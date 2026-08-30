"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { fetchUserWishlist } from "@/app/redux/slices/wishlistslice";
import NotificationDropdown from "@/app/Components/Notification/NotificationDropdown";

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Redux Global State
  const { totalQuantity } = useAppSelector((state) => state.cart);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserWishlist());
    }
  }, [isAuthenticated, dispatch]);

  const isUserLoggedIn = mounted && isAuthenticated;
  const isAdmin = isUserLoggedIn && user?.role?.toLowerCase() === "admin";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Blog", href: "/blogs" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Wishlist", href: "/wishlist" },
  ];

  return (
    <>
      <section id="header">
        {/* LEFT: Logo */}
        <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
          <img className="logo" src="/img/logo.png" alt="Logo" />
        </Link>

        {/* CENTER: Navigation Links */}
        <nav className="nav-center">
          <ul id="nav-bar" className={isMobileMenuOpen ? "active" : ""}>
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href === "/blogs" && pathname === "/blog");
              return (
                <li key={link.href}>
                  <Link
                    className={isActive ? "active" : ""}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                    {mounted && link.href === "/wishlist" && wishlistItems.length > 0 && (
                      <span
                        style={{
                          backgroundColor: "#088178",
                          color: "#fff",
                          borderRadius: "50%",
                          padding: "2px 6px",
                          fontSize: "11px",
                          marginLeft: "4px",
                        }}
                      >
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
            <button
              type="button"
              id="close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close Navigation Menu"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
              }}
            >
              <i className="far fa-times"></i>
            </button>
          </ul>
        </nav>

        {/* RIGHT: Desktop Cart + User Icons */}
        <div className="nav-icons">
          {/* ⚡ Admin Panel Badge (Only visible to Admin) */}
          {isAdmin && (
            <Link
              href="/admin/products"
              style={{
                backgroundColor: "#e74c3c",
                color: "#fff",
                padding: "5px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: "0 2px 6px rgba(231,76,60,0.3)",
              }}
              title="Admin Management Dashboard"
            >
              <i className="fas fa-shield-alt"></i> Admin Panel
            </Link>
          )}

          {/* Notification Bell */}
          {mounted && isUserLoggedIn && <NotificationDropdown isAdmin={false} />}

          <Link
            className={pathname === "/cart" ? "active" : ""}
            href="/cart"
            style={{ position: "relative" }}
          >
            <i className="far fa-shopping-bag"></i>
            {mounted && totalQuantity > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-10px",
                  backgroundColor: "#088178",
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
              >
                {totalQuantity}
              </span>
            )}
          </Link>
          <Link
            className={
              isAdmin
                ? pathname.startsWith("/admin")
                  ? "active"
                  : ""
                : isUserLoggedIn
                ? pathname === "/profile"
                  ? "active"
                  : ""
                : pathname === "/login" || pathname === "/register"
                ? "active"
                : ""
            }
            href={
              isAdmin
                ? "/admin/products"
                : isUserLoggedIn
                ? "/profile"
                : "/login"
            }
            title={
              isAdmin
                ? `Admin Portal (${user?.name || "Admin"})`
                : isUserLoggedIn
                ? `My Account (${user?.name || "User"})`
                : "Login / Register"
            }
          >
            <i
              className={
                isAdmin
                  ? "fas fa-user-shield"
                  : isUserLoggedIn
                  ? "fas fa-user"
                  : "far fa-user"
              }
              style={{
                color: isUserLoggedIn ? "#088178" : "#222",
                fontSize: "17px",
              }}
            ></i>
          </Link>
        </div>

        {/* MOBILE BAR ICONS */}
        <div className="mobile">
          {mounted && isUserLoggedIn && <NotificationDropdown isAdmin={false} />}
          <Link href="/cart" style={{ position: "relative" }}>
            <i className="far fa-shopping-bag"></i>
            {mounted && totalQuantity > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-10px",
                  backgroundColor: "#088178",
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
              >
                {totalQuantity}
              </span>
            )}
          </Link>
          <Link
            href={
              isAdmin
                ? "/admin/products"
                : isUserLoggedIn
                ? "/profile"
                : "/login"
            }
            style={{ marginLeft: "10px" }}
          >
            <i
              className={
                isAdmin
                  ? "fas fa-user-shield"
                  : isUserLoggedIn
                  ? "fas fa-user"
                  : "far fa-user"
              }
              style={{
                color: isUserLoggedIn ? "#088178" : "#222",
                fontSize: "17px",
              }}
            ></i>
          </Link>
          <i
            id="bar"
            className="fas fa-outdent"
            onClick={() => setIsMobileMenuOpen(true)}
            style={{ cursor: "pointer", fontSize: "20px", marginLeft: "15px" }}
          ></i>
        </div>
      </section>

      {/* Backdrop overlay when mobile drawer is open */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 998,
            backdropFilter: "blur(2px)",
          }}
        />
      )}
    </>
  );
}
