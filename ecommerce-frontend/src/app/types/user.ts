// Backend se aane wali user profile ka type
export interface UserProfile {
    id: number;
    fullName: string;
    email: string;
    role: string;
    phoneNumber?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
}

// Profile update karte waqt form se bhejne wala type
export interface UpdateProfileData {
    fullName: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}
