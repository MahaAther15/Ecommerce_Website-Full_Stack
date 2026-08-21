import { authenticatedFetch } from "./authApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5024";

export interface AddressDto {
  id: number;
  userId: number;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  addressType: "Home" | "Office" | "Other" | string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressDto {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  addressType: "Home" | "Office" | "Other" | string;
  isDefault?: boolean;
}

export interface UpdateAddressDto extends CreateAddressDto {}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let result: any = null;
  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(`Invalid response format from server: ${text.slice(0, 80)}`);
    }
  }
  if (!res.ok || (result && !result.success)) {
    throw new Error(result?.message || `Request failed with status ${res.status}`);
  }
  return result?.data;
}

// 1. Get all saved addresses of current user
export async function getUserAddressesApi(): Promise<AddressDto[]> {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/address`, {
    method: "GET",
    cache: "no-store",
  });
  return handleResponse<AddressDto[]>(res);
}

// 2. Get single address by ID
export async function getAddressByIdApi(id: number): Promise<AddressDto> {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/address/${id}`, {
    method: "GET",
  });
  return handleResponse<AddressDto>(res);
}

// 3. Create new address
export async function createAddressApi(dto: CreateAddressDto): Promise<AddressDto> {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/address`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  return handleResponse<AddressDto>(res);
}

// 4. Update address
export async function updateAddressApi(id: number, dto: UpdateAddressDto): Promise<AddressDto> {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/address/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  return handleResponse<AddressDto>(res);
}

// 5. Delete address
export async function deleteAddressApi(id: number): Promise<boolean> {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/address/${id}`, {
    method: "DELETE",
  });
  await handleResponse<boolean>(res);
  return true;
}

// 6. Set address as default
export async function setDefaultAddressApi(id: number): Promise<AddressDto> {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/address/${id}/set-default`, {
    method: "PUT",
  });
  return handleResponse<AddressDto>(res);
}
