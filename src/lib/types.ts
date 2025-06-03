// src/lib/types.ts (Create this file if it doesn't exist, or add to an existing types file)

export interface AuthResponse {
  message?: string; // Optional message from the backend
  accessToken: string;
  refreshToken?: string; // Optional, depending on if your backend always sends it
  user?: { // Optional user data, adjust based on what your backend sends
    id: string;
    email: string;
    // ... any other user properties
  };
  error?: string; // For error responses, though securedApiCall throws on error.
}