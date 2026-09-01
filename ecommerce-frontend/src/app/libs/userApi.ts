import { authenticatedFetch } from "./authApi";
import { UserProfile, UpdateProfileData } from "@/app/types/user";
import { API_BASE_URL } from "./apiConfig";

// ── User Profile APIs (Customer) ──

// GET /api/user/profile
export async function getUserProfileApi(): Promise<UserProfile> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/User/profile`);
    if (!res.ok) {
        throw new Error("Failed to fetch profile");
    }
    return res.json();
}

// PUT /api/user/profile
export async function updateUserProfileApi(data: UpdateProfileData): Promise<UserProfile> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/User/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update profile");
    }
    return res.json();
}

// DELETE /api/user/profile
export async function deleteUserAccountApi(confirmationEmail: string): Promise<void> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/User/profile`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationEmail }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete account");
    }
}

// ── Admin User Management APIs ──

export interface UserItem {
    id: number;
    fullName: string;
    email: string;
    role: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    createdAt?: string;
}

// GET /api/user/admin/all
export async function getAllUsersAdminApi(): Promise<UserItem[]> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/User/admin/all`);
    const data = await res.json();
    if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to fetch users");
    }
    return data.data || [];
}
