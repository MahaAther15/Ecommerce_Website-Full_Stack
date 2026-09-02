import { ContactFormData, ContactMessage } from "../types/contact";
import { API_BASE_URL } from "./apiConfig";
import { authenticatedFetch } from "./authApi";

const STORAGE_KEY = "cara_contact_messages_store";

// Helper to get local stored messages
function getLocalMessages(): ContactMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save local stored messages
function saveLocalMessages(messages: ContactMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // ignore
  }
}

// 1. Submit a Contact Form message
export async function sendContactMessageApi(data: ContactFormData): Promise<ContactMessage> {
  const newMsg: ContactMessage = {
    id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    name: data.name.trim(),
    email: data.email.trim(),
    subject: data.subject.trim(),
    message: data.message.trim(),
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  // 1. Always persist in storage immediately
  const existing = getLocalMessages();
  const updated = [newMsg, ...existing];
  saveLocalMessages(updated);

  // 2. Try posting to backend API if available
  try {
    const res = await fetch(`${API_BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        return json.data;
      }
    }
  } catch {
    // backend fallback continues
  }

  return newMsg;
}

// 2. Get All Contact Messages for Admin
export async function getContactMessagesAdminApi(): Promise<ContactMessage[]> {
  let backendMessages: ContactMessage[] = [];

  try {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/contact`, {
      method: "GET",
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        backendMessages = json.data;
      }
    }
  } catch {
    // ignore
  }

  const localMessages = getLocalMessages();

  // Combine and deduplicate
  const map = new Map<string, ContactMessage>();
  [...localMessages, ...backendMessages].forEach((m) => {
    map.set(m.id || `${m.email}_${m.createdAt}`, m);
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// 3. Delete a Contact Message (Admin)
export async function deleteContactMessageAdminApi(id: string): Promise<boolean> {
  // Remove from local storage
  const existing = getLocalMessages();
  const filtered = existing.filter((m) => m.id !== id);
  saveLocalMessages(filtered);

  // Attempt backend delete
  try {
    await authenticatedFetch(`${API_BASE_URL}/api/contact/${id}`, {
      method: "DELETE",
    });
  } catch {
    // ignore
  }

  return true;
}
