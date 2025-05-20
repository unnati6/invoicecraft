import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/invoices');
  return null; // Or a loading spinner, but redirect is usually fast enough
}
