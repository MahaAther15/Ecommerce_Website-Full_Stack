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

// Helper to safely parse JSON response without throwing SyntaxError
async function parseJsonResponse(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
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
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/register`, {
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
  } catch {
    throw new Error("Unable to connect to backend server. Please verify your connection or backend status.");
  }

  const resData = await parseJsonResponse(response);

  if (!response.ok || !resData) {
    throw new Error(resData?.message || `Registration failed (${response.status}). Please try again.`);
  }

  return resData;
}

// 3. Login API Call
export async function loginApi(data: LoginFormData): Promise<AuthResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
  } catch {
    throw new Error("Unable to connect to backend server. Please verify your connection or backend status.");
  }

  const resData = await parseJsonResponse(response);

  if (!response.ok || !resData) {
    throw new Error(resData?.message || "Login failed. Invalid credentials or server error.");
  }

  return resData;
}

// 4. Google Login API Call
export async function googleLoginApi(idToken: string): Promise<AuthResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });
  } catch {
    throw new Error("Unable to connect to backend server. Please verify your connection or backend status.");
  }

  const resData = await parseJsonResponse(response);

  if (!response.ok || !resData) {
    throw new Error(resData?.message || "Google authentication failed.");
  }

  return resData;
}

// 5. Updated Refresh Token API Call with Cookie + LocalStorage Fallback
export async function refreshTokenApi(): Promise<AuthResponse> {
  const accessToken = getAuthToken();
  const refreshToken = getRefreshToken() || "";

  if (!accessToken && !refreshToken) {
    logout();
    throw new Error("No active session found.");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ accessToken: accessToken || "", refreshToken }),
    });
  } catch {
    logout();
    throw new Error("Session refresh connection failed.");
  }

  const resData = await parseJsonResponse(response);

  if (!response.ok || !resData) {
    logout();
    throw new Error(resData?.message || "Session expired. Please log in again.");
  }

  setAuthSession(resData);
  return resData;
}

// 6. Updated Authenticated Fetch Wrapper with Silent Refresh
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = getAuthToken();

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: "include"
    });
  } catch (err) {
    throw new Error("Unable to reach server. Please check backend availability.");
  }

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
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new Error("Unable to connect to backend server. Please try again later.");
  }

  const resData = await parseJsonResponse(response);

  if (!response.ok || !resData) {
    throw new Error(resData?.message || "Failed to process forgot password request.");
  }

  return resData;
}

// 8. Reset Password API Call
export async function resetPasswordApi(token: string, newPassword: string): Promise<{ message: string }> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });
  } catch {
    throw new Error("Unable to connect to backend server. Please try again later.");
  }

  const resData = await parseJsonResponse(response);

  if (!response.ok || !resData) {
    throw new Error(resData?.message || "Failed to reset password.");
  }

  return resData;
}
