
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
          // 'Content-Type': 'application/json', // Removed for GET request
      });

      if (response.ok) {
          const data = await response.json();
          console.log("Backend Connection Successful:", data.message);
          return true;
      } else {
          console.error(`Backend Connection Failed: Status ${response.status} - ${response.statusText}`);
          try {
            const errorBody = await response.text();
            console.error("Backend error body:", errorBody);
          } catch (e) {
            // Ignore if can't parse body
          }
          return false;
      }
  } catch (error) {
      console.error("Network Error: Could not connect to backend.", error);
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
