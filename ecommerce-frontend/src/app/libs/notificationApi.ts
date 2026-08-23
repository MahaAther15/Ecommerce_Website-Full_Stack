import { authenticatedFetch } from "./authApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";

export interface NotificationItem {
    id: number;
    userId?: number;
    title: string;
    message: string;
    type: string;
    priority: string;
    actionUrl?: string;
    isRead: boolean;
    isAdminNotification: boolean;
    timeAgo: string;
    createdAt: string;
}

// Fetch user notifications
export async function getMyNotificationsApi(): Promise<NotificationItem[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/Notification/my`);
    const data = await res.json();
    return data.data || [];
}

// Fetch user unread count
export async function getUnreadCountApi(): Promise<number> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/Notification/unread-count`);
    const data = await res.json();
    return data.data || 0;
}

// Fetch admin notifications (To-Dos)
export async function getAdminNotificationsApi(): Promise<NotificationItem[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/Notification/admin`);
    const data = await res.json();
    return data.data || [];
}

// Fetch admin unread count
export async function getAdminUnreadCountApi(): Promise<number> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/Notification/admin/unread-count`);
    const data = await res.json();
    return data.data || 0;
}

// Mark single notification as read
export async function markNotificationAsReadApi(id: number) {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/Notification/${id}/read`, { method: "PUT" });
    return res.json();
}

// Mark all as read
export async function markAllNotificationsAsReadApi(isAdmin = false) {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/Notification/mark-all-read?isAdmin=${isAdmin}`, { method: "PUT" });
    return res.json();
}
