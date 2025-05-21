import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to dashboard page by default after login
  redirect('/dashboard'); 
  return null; 
}
