import { LoginFormData, RegisterFormData } from "@/app/types/auth";

// ASP.NET Core Backend URL (launchSettings.json ke port 5024 ke mutabiq)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";

export interface AuthResponse {
  token: string;
  fullName: string;
  email: string;
  role: string;
}

// 1. Register API Call
export async function registerApi(data: RegisterFormData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    }),
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.message || "Registration failed. Please try again.");
  }

  return resData;
}

// 2. Login API Call
export async function loginApi(data: LoginFormData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.message || "Login failed. Invalid credentials.");
  }

  return resData;
}

// 3. LocalStorage Session Helper Functions
export function setAuthSession(data: AuthResponse) {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authUser", JSON.stringify({
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    }));
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

export function getAuthUser(): { fullName: string; email: string; role: string } | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("authUser");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  }
}
