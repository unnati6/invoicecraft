import { getAuth } from "firebase/auth";

export async function getFirebaseIdToken(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
       try {
      const idToken = await user.getIdToken();
      return idToken;
    } catch (error) {
      console.error("Error getting Firebase ID token:", error);
      // signOut(auth);
      return null;
    }
  }
  return null;
}