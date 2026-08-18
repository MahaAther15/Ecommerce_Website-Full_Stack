import { UserProfile, UpdateProfileData } from "@/app/types/user";
import { getAuthToken, logout, authenticatedFetch } from "./authApi";

// Backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";

// 1. Get User Profile API Call
export async function getUserProfileApi(): Promise<UserProfile> {
    const token = getAuthToken();

    // Agar Token LocalStorage me na mile, toh pehle hi error feinko
    if (!token) {
        throw new Error("You are not logged in. Please log in to access your profile.");
    }

    const response = await authenticatedFetch(`${API_BASE_URL}/api/user/profile`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const resData = await response.json().catch(() => null);

    // 🔴 Rich Error Handling based on HTTP Status Codes
    if (!response.ok) {
        if (response.status === 401) {
            logout(); // Token invalid ya expire ho chuka hai, session clear kar do
            throw new Error("Your session has expired. Please log in again.");
        }
        if (response.status === 404) {
            throw new Error("User profile not found.");
        }
        throw new Error(resData?.message || "Failed to fetch user profile details.");
    }

    return resData;
}

// 2. Update User Profile & Address API Call
export async function updateUserProfileApi(data: UpdateProfileData): Promise<UserProfile> {
    const token = getAuthToken();

    if (!token) {
        throw new Error("You are not logged in. Please log in to update profile.");
    }

    const response = await authenticatedFetch(`${API_BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const resData = await response.json().catch(() => null);

    // 🔴 Rich Error Handling
    if (!response.ok) {
        if (response.status === 401) {
            logout();
            throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(resData?.message || "Failed to update profile. Please try again.");
    }

    return resData;
}
// 3. Delete User Account API Call (with Confirmation Email)
export async function deleteUserAccountApi(confirmationEmail: string): Promise<{ message: string }> {
    const token = getAuthToken();

    if (!token) {
        throw new Error("You are not logged in.");
    }

    const response = await authenticatedFetch(`${API_BASE_URL}/api/user/profile`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmationEmail }),
    });

    const resData = await response.json().catch(() => null);

    if (!response.ok) {
        if (response.status === 401) {
            logout();
            throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(resData?.message || "Failed to delete account. Please try again.");
    }

    return resData;
}

