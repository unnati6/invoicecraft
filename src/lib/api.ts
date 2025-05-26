// src/lib/api.ts
import { getFirebaseIdToken } from './authHelper';

const API_BASE_URL = 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function securedApiCall<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T | null> {
  const { requiresAuth = true, headers, ...restOptions } = options;

  let authHeaders: HeadersInit = {};

  if (requiresAuth) {
    const idToken = await getFirebaseIdToken();

    if (!idToken) {
      console.error("Authentication required for this API call, but no token found.");
      throw new Error("Unauthorized: No Firebase ID token available.");
    }
    authHeaders = { 'Authorization': `Bearer ${idToken}` };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error(`API Error ${response.status}: Authentication failed for ${endpoint}`);
      }
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error during API call to ${endpoint}:`, error);
    throw error;
  }
}

export async function publicApiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error during public API call to ${endpoint}:`, error);
    throw error;
  }
}