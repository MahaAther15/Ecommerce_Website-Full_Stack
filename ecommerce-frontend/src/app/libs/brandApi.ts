import { authenticatedFetch } from "./authApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";

// Backend se jab brand data aye to uska structure
export interface Brand {
    id: number;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Naya brand create ya update karte waqt frontend se bheja jane wala payload
export interface CreatedBrandDto {
    name: string;
    description?: string;
    logoUrl?: string;
}

// Helper to safely parse JSON response
async function handleResponse(res: Response) {
    let result: any = null;
    const text = await res.text();
    if (text) {
        try {
            result = JSON.parse(text);
        } catch {
            throw new Error(`Server returned invalid response: ${text.slice(0, 100)}`);
        }
    }

    if (!res.ok || (result && !result.success)) {
        throw new Error(result?.message || `Request failed with status ${res.status}`);
    }

    return result ? result.data : null;
}

// 1. Fetch all brands (Public)
export async function getBrandApi(): Promise<Brand[]> {
    const res = await fetch(`${API_BASE_URL}/api/brand`, {
        cache: "no-store",
    });
    return await handleResponse(res);
}

// 2. Fetch brand by ID (Public)
export async function getBrandByIdApi(id: number): Promise<Brand> {
    const res = await fetch(`${API_BASE_URL}/api/brand/${id}`, {
        cache: "no-store",
    });
    return await handleResponse(res);
}

// 3. Create Brand (Admin only ==> Authorization)
export async function createBrandApi(dto: CreatedBrandDto): Promise<Brand> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/brand`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
    });
    return await handleResponse(res);
}

// 4. Update Brand (Admin Only)
export async function updateBrandApi(id: number, dto: CreatedBrandDto): Promise<Brand> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/brand/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
    return await handleResponse(res);
}

// 5. Delete Brand (Admin Only)
export async function deleteBrandApi(id: number): Promise<boolean> {
    const res = await authenticatedFetch(`${API_BASE_URL}/api/brand/${id}`, {
        method: "DELETE",
    });
    await handleResponse(res);
    return true;
}