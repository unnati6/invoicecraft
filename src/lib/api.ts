
//import { auth } from './firebase'; 
const BACKEND_BASE_URL = 'https://invoicecraft-backend.onrender.com'; 
//const BACKEND_BASE_URL = 'http://localhost:5000';

// async function getAuthToken(): Promise<string | null> {
//     if (typeof window !== 'undefined' && auth.currentUser) {
//         try {
//             const token = await auth.currentUser.getIdToken();
//             return token;
//         } catch (error) {
//             console.error("Error getting Firebase ID token:", error);
//             return null;
//         }
//     }
//     return null;
// }

export async function checkBackendConnection(): Promise<boolean> {
  const url = `${BACKEND_BASE_URL}/api/status`;

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
    endpoint: string,
    options?: RequestInit // This is the correct way to pass fetch options
  ): Promise<T | null> {
    const url = `${BACKEND_BASE_URL}${endpoint}`;
    console.log(`FRONTEND DEBUG: Making API call to: ${url}`);
    console.log(`FRONTEND DEBUG: Request options:`, options); // Log options to debug
  
    try {
      
      const response = await fetch(url, options); // Pass the options object directly
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error(`API Error (${response.status}):`, errorData);
        throw new Error(`API call failed: ${errorData.message || response.statusText}`);
      }
  const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data as T;
    } else {
      return null as T; // or `return undefined as T;`
    }
  } catch (error: any) {
    console.error('Error during API call:', error);
    throw error;
  }
  }