const BACKEND_BASE_URL =  'http://localhost:3000/api';
export async function securedApiCall<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    const url = `${BACKEND_BASE_URL}${path}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
  
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`API Call Error: ${response.status} - ${errorData.message}`);
      throw new Error(errorData.message || 'Something went wrong with the API call.');
    }
  if (response.status === 204) {
      return null;
    }
  
    return response.json() as T;
  }    
