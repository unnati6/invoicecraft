import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to login page by default
  // In a real app, you'd check authentication status here
  redirect('/login'); 
  return null; 
}
