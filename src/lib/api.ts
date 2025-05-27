
//import { auth } from './firebase'; 
const BACKEND_BASE_URL = 'http://localhost:5000/api'; 

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

export async function securedApiCall<T>(url: string, options: RequestInit = {}): Promise<T> {
    // const token = await auth.currentUser?.getIdToken(); // यह लाइन टिप्पणी करें या हटा दें
    // const HARDCODED_TOKEN = "YOUR_HARDCODED_VALID_FIREBASE_ID_TOKEN"; // यह हार्डकोडेड लाइन भी हटा दें या टिप्पणी करें

    const defaultHeaders = {
        'Content-Type': 'application/json',
        // 'Authorization': token ? `Bearer ${token}` : '', // यह लाइन हटा दें या टिप्पणी करें
    };

    const requestOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers, // यदि कोई अतिरिक्त हेडर पास किए जा रहे हैं तो उन्हें बनाए रखें
        },
    };

    console.log('DEBUG: securedApiCall initiated for URL:', url);
    console.log('DEBUG: Request options (without Authorization header):', requestOptions);

    try {
        const response = await fetch(`http://localhost:5000${url}`, requestOptions); // सुनिश्चित करें कि baseURL यहां सही है

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status} - ${errorText}`);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        return response.json() as Promise<T>;

    } catch (error) {
        console.error('DEBUG: Network or API error in securedApiCall (without Authorization header):', error);
        throw error;
    }
}