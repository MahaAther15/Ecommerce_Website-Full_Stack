import { LoginFormData, RegisterFormData } from "@/app/types/auth";

// ASP.NET Core Backend URL (launchSettings.json ke port 5024 ke mutabiq)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";

export interface AuthResponse {
  token: string;        // 30-minute access token
  refreshToken: string; // 7-day refresh token
  fullName: string;
  email: string;
  role: string;
}

// 1. Session Storage Helpers
export function setAuthSession(data: AuthResponse) {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("token", data.token);
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    localStorage.setItem("authUser", JSON.stringify({
      fullName: data.fullName,
      name: data.fullName,
      email: data.email,
      role: data.role,
    }));
    localStorage.setItem("currentUser", JSON.stringify({
      fullName: data.fullName,
      name: data.fullName,
      email: data.email,
      role: data.role,
    }));
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken") || localStorage.getItem("token");
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
}

export function getAuthUser(): { fullName: string; email: string; role: string } | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("authUser") || localStorage.getItem("currentUser");
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        return {
          fullName: parsed.fullName || parsed.name || "User",
          email: parsed.email || "",
          role: parsed.role || "User",
        };
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
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("currentUser");
  }
}

// 2. Register API Call
export async function registerApi(data: RegisterFormData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
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

// 3. Login API Call
export async function loginApi(data: LoginFormData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
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

// 4. Google Login API Call
export async function googleLoginApi(idToken: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.message || "Google authentication failed.");
  }

  return resData;
}
// 1. Updated Refresh Token API Call
export async function refreshTokenApi(): Promise<AuthResponse> {
  const accessToken = getAuthToken();

  if (!accessToken) {
    logout();
    throw new Error("No active session found.");
  }

  // 🍪 Note: Hum body me refreshToken nahi bhej rahe, browser cookie ke zariye khud bhejega!
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 👈 ZAROORI: Browser ko cookie bhejne ki permission deta hai
    body: JSON.stringify({ accessToken, refreshToken: "" }),
  });

  const resData = await response.json();

  if (!response.ok) {
    logout();
    throw new Error(resData.message || "Session expired. Please log in again.");
  }

  setAuthSession(resData);
  return resData;
}

// 2. Updated Authenticated Fetch Wrapper
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = getAuthToken();

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Har request me credentials: "include" lazmi karein
  let response = await fetch(url, {
    ...options,
    headers,
    credentials: "include" // 👈 ZAROORI
  });

  // Agar 401 aaye to silent refresh karein
  if (response.status === 401) {
    try {
      const refreshed = await refreshTokenApi();
      headers.set("Authorization", `Bearer ${refreshed.token}`);
      response = await fetch(url, { ...options, headers, credentials: "include" });
    } catch {
      logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  return response;
}


// 7. Forgot Password API Call
export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.message || "Failed to process forgot password request.");
  }

  return resData;
}

// 8. Reset Password API Call
export async function resetPasswordApi(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, newPassword }),
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Error(resData.message || "Failed to reset password.");
  }

  return resData;
}
