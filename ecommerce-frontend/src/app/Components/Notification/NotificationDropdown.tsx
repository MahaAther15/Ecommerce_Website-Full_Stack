"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
    getMyNotificationsApi, 
    getAdminNotificationsApi, 
    getUnreadCountApi, 
    getAdminUnreadCountApi, 
    markNotificationAsReadApi, 
    markAllNotificationsAsReadApi, 
    NotificationItem 
} from "@/app/libs/notificationApi";

interface Props {
    isAdmin?: boolean;
}

export default function NotificationDropdown({ isAdmin = false }: Props) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        loadCount();
        // Poll unread count every 30 seconds
        const interval = setInterval(loadCount, 30000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    useEffect(() => {
        if (open) {
            loadNotifications();
        }
    }, [open]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadCount = async () => {
        try {
            const count = isAdmin ? await getAdminUnreadCountApi() : await getUnreadCountApi();
            setUnreadCount(count);
        } catch {
            // ignore if unauthenticated
        }
    };

    const loadNotifications = async () => {
        try {
            const list = isAdmin ? await getAdminNotificationsApi() : await getMyNotificationsApi();
            setNotifications(list);
        } catch {
            // ignore
        }
    };

    const handleItemClick = async (item: NotificationItem) => {
        if (!item.isRead) {
            await markNotificationAsReadApi(item.id);
            setUnreadCount((prev) => Math.max(0, prev - 1));
            setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
        }
        setOpen(false);
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsAsReadApi(isAdmin);
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "OrderPlaced":
            case "AdminNewOrder":
                return { icon: "fa-shopping-bag", bg: "#eff6ff", color: "#3b82f6" };
            case "OrderShipped":
                return { icon: "fa-truck-fast", bg: "#f0fdf4", color: "#16a34a" };
            case "OrderDelivered":
            case "OredrDelievered":
                return { icon: "fa-circle-check", bg: "#ecfdf5", color: "#059669" };
            case "RefundApproved":
            case "AdminReturnRequest":
                return { icon: "fa-rotate-left", bg: "#fef3c7", color: "#d97706" };
            case "AdminLowStock":
                return { icon: "fa-triangle-exclamation", bg: "#fee2e2", color: "#dc2626" };
            case "AdminNewReview":
                return { icon: "fa-star", bg: "#fef9c3", color: "#ca8a04" };
            default:
                return { icon: "fa-bell", bg: "#f3f4f6", color: "#4b5563" };
        }
    };

    return (
        <div ref={dropdownRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            {/* Bell Icon Trigger */}
            <button
                onClick={() => setOpen(!open)}
                style={{
                    position: "relative",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    margin: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isAdmin ? "#d1d5db" : "#222",
                    fontSize: "17px",
                    lineHeight: 1,
                    transition: "0.3s ease",
                }}
                onMouseEnter={(e) => {
                    if (!isAdmin) e.currentTarget.style.color = "#088178";
                }}
                onMouseLeave={(e) => {
                    if (!isAdmin) e.currentTarget.style.color = "#222";
                }}
                aria-label="Notifications"
            >
                <i className={unreadCount > 0 ? "fas fa-bell" : "far fa-bell"} />
                {unreadCount > 0 && (
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
                            lineHeight: "normal",
                        }}
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {open && (
                <div
                    className="notification-dropdown-menu"
                    style={
                        isMobile
                            ? {
                                position: "fixed",
                                top: "64px",
                                left: "12px",
                                right: "12px",
                                width: "auto",
                                maxWidth: "calc(100vw - 24px)",
                                maxHeight: "75vh",
                                backgroundColor: "#fff",
                                borderRadius: "14px",
                                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.25)",
                                border: "1px solid #e5e7eb",
                                zIndex: 999999,
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                fontFamily: "'Inter', sans-serif",
                            }
                            : {
                                position: "absolute",
                                right: 0,
                                top: "100%",
                                marginTop: "8px",
                                width: "360px",
                                maxHeight: "480px",
                                backgroundColor: "#fff",
                                borderRadius: "14px",
                                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                                border: "1px solid #e5e7eb",
                                zIndex: 99999,
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                fontFamily: "'Inter', sans-serif",
                            }
                    }
                >
                    {/* Header */}
                    <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fafafa" }}>
                        <div>
                            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#111827" }}>
                                {isAdmin ? "Admin To-Dos & Alerts" : "Notifications"}
                            </h4>
                            <span style={{ fontSize: "11px", color: "#6b7280" }}>
                                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                            </span>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                style={{ background: "none", border: "none", color: "#088178", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div style={{ overflowY: "auto", maxHeight: "380px" }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: "40px 20px", textAlign: "center", color: "#9ca3af" }}>
                                <i className="fas fa-bell-slash" style={{ fontSize: "28px", marginBottom: "8px", color: "#d1d5db" }} />
                                <p style={{ margin: 0, fontSize: "13px" }}>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((item) => {
                                const { icon, bg, color } = getIcon(item.type);
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.actionUrl || "#"}
                                        onClick={() => handleItemClick(item)}
                                        style={{
                                            display: "flex",
                                            gap: "12px",
                                            padding: "12px 16px",
                                            borderBottom: "1px solid #f3f4f6",
                                            textDecoration: "none",
                                            backgroundColor: item.isRead ? "#fff" : "#f0fdf4",
                                            transition: "background 0.2s",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                backgroundColor: bg,
                                                color: color,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "14px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <i className={`fas ${icon}`} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                                                <strong style={{ fontSize: "13px", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {item.title}
                                                </strong>
                                                <span style={{ fontSize: "10px", color: "#9ca3af", flexShrink: 0 }}>{item.timeAgo}</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: "12px", color: "#4b5563", lineHeight: "1.4" }}>
                                                {item.message}
                                            </p>
                                        </div>
                                        {!item.isRead && (
                                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#088178", alignSelf: "center", flexShrink: 0 }} />
                                        )}
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
