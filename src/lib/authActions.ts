// src/lib/authActions.ts

import { z } from 'zod';
import { securedApiCall } from './api'; // सुनिश्चित करें कि securedApiCall यहाँ से आयात किया गया है

// Zod स्कीमा को परिभाषित करें
export const signUpSchema = z.object({
  fullName: z.string().min(3, "Full name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * अपने कस्टम बैकएंड API के माध्यम से एक नया उपयोगकर्ता पंजीकृत करता है।
 * @param formData साइनअप फ़ॉर्म डेटा (नाम, ईमेल, पासवर्ड)।
 * @returns सफलता पर एक ऑब्जेक्ट या त्रुटि पर null।
 */
export async function signUpUser(formData: SignUpFormData): Promise<any> { // या उपयुक्त रिटर्न टाइप
  try {
    // Zod के साथ डेटा को वैलिडेट करें
    signUpSchema.parse(formData);

    const { fullName, email, password } = formData;

    // बैकएंड को भेजने के लिए पेलोड तैयार करें
    const payload = {
      fullName,
      email,
      password,
      // confirmPassword को बैकएंड को भेजने की आवश्यकता नहीं है, क्योंकि यह केवल फ्रंटएंड वैलिडेशन के लिए है
    };

    console.log("[AuthAction] Sending signup request to backend:", payload);

    // securedApiCall का उपयोग करके बैकएंड API को कॉल करें
    // यह मान रहा है कि आपका बैकएंड /api/authentication/signup पर एक POST रिक्वेस्ट की उम्मीद करता है
    const response = await securedApiCall('/api/authentication/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log("[AuthAction] Backend response for signup:", response);

    // यहाँ, 'response' में वह डेटा होगा जो आपका बैकएंड लौटाता है
    // जैसे कि नया उपयोगकर्ता ऑब्जेक्ट, यदि सफल होता है।
    return response; // यह अब आपके बैकएंड से लौटाया गया उपयोगकर्ता या सफलता डेटा होगा

  } catch (error: any) {
    console.error("Sign Up Process Error:", error.message);
    throw error; // UI में दिखाने के लिए त्रुटि को फिर से फेंकें
  }
}