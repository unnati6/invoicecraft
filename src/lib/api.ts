
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


export async function securedApiCall(url: string, options: RequestInit = {}) {
   
    const HARDCODED_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImZlNjVjY2I4ZWFkMGJhZWY1ZmQzNjE5NWQ2NTI4YTA1NGZiYjc2ZjMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vaW52b2ljZWNyYWZ0LTRoYmNsIiwiYXVkIjoiaW52b2ljZWNyYWZ0LTRoYmNsIiwiYXV0aF90aW1lIjoxNzQ4MzQwNDQ4LCJ1c2VyX2lkIjoiMDJrc2VveWQ0T1JpamNPd2VwUzR3NHVLb2tuMSIsInN1YiI6IjAya3Nlb3lkNE9SaWpjT3dlcFM0dzR1S29rbjEiLCJpYXQiOjE3NDgzNDA0NDgsImV4cCI6MTc0ODM0NDA0OCwiZW1haWwiOiJ1bm5hdGlwYXJtYXJjcEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidW5uYXRpcGFybWFyY3BAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.iCpU-E2i2vPP3ImU5f9IjVvrrSOgrUIB3o1F94oLrINfRuLvhVENE065n53Ul1ktyiT7wpPacJqE4-0Lhwtpla91dOcW1f-8RRznmr2lEf2vn9mtzFxCF39SUfubx0e3xks1_6WDWS3myEHAvRebecj97NX1D0EChOJcEacRnapPXKziDXzZyyPtcoE2YLUMb5sXQXyfjQb2uAp9FTn9zPCeiKttlyaf9LIIahbQYRb0mJtGITy-ponwE7o4_EQO3VCccegs97xDK5efvy1tNqE17js_9FgbOBN3myGyeZCPRTslBZMMO5u9fleoTwO4sm7tM5lpWbBOZ_yi_hU3NA"
    
    const token = HARDCODED_TOKEN; 
     const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '', 
    };

    const requestOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    console.log('DEBUG: securedApiCall initiated for URL:', url);
    console.log('DEBUG: Request options (with hardcoded token):', requestOptions); // लॉग अपडेट करें

    try {
        const response = await fetch(url, requestOptions);
        // ... बाकी कोड (यह उम्मीद की जाती है कि यह अब काम करेगा, या कोई HTTP त्रुटि देगा)
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status} - ${errorText}`);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        return response.json();

    } catch (error) {
        console.error('DEBUG: Network or API error in securedApiCall (with hardcoded token):', error); // लॉग अपडेट करें
        throw error;
    }
}
