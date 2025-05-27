
import { auth } from './firebase'; 
const BACKEND_BASE_URL = 'http://localhost:5000/api'; 

async function getAuthToken(): Promise<string | null> {
    if (typeof window !== 'undefined' && auth.currentUser) {
        try {
            const token = await auth.currentUser.getIdToken();
            return token;
        } catch (error) {
            console.error("Error getting Firebase ID token:", error);
            return null;
        }
    }
    return null;
}

export async function checkBackendConnection(): Promise<boolean> {
  const url = `${BACKEND_BASE_URL}/status`;

  try {
      console.log(`Attempting to connect to backend at: ${url}`);
      const response = await fetch(url, {
          method: 'GET',
      });

      if (response.ok) {
          const data = await response.json();
          console.log("Backend Connection Successful:", data.message);
          return true;
      } else {
          let errorBodyText = '';
          try {
            errorBodyText = await response.text();
          } catch (e) { /* ignore if reading body fails */ }
          console.error(`Backend Connection Failed to ${url}: Status ${response.status} - ${response.statusText}. Response body: ${errorBodyText}`);
          return false;
      }
  } catch (error: any) {
      console.error(`Network Error: Could not connect to ${url}. Details:`, error.message || error);
      if (error.cause) { // Some fetch errors might have a 'cause' property
        console.error('Cause:', error.cause);
      }
      return false;
  }
}


export async function securedApiCall<T>(
    path: string,
    options: RequestInit = {}
): Promise<T | null> {
    const url = `${BACKEND_BASE_URL}${path}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const token = await getAuthToken();
    if (token) {

        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const requestHeaders = new Headers(defaultHeaders);
    if (options.headers) {
        for (const [key, value] of Object.entries(options.headers)) {
            requestHeaders.set(key, String(value));
        }
    }

    const response = await fetch(url, {
        ...options,
        headers: requestHeaders,
    });

    if (!response.ok) {
        let errorData: any;
        try {
            errorData = await response.json();
        } catch (jsonError) {
            errorData = { message: response.statusText || 'Unknown error', status: response.status };
        }
        console.error(`[API Error] Status: ${response.status} | Path: ${path} | Message: ${errorData.message || 'No message'}`);
         if (response.status === 401) {
            console.warn("Unauthorized API call. User might need to re-authenticate.");
                   }

        throw new Error(errorData.message || `API call failed with status ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json() as T;
}

