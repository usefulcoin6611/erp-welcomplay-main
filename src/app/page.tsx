import { redirect } from 'next/navigation';

export default function RootPage() {
  // Force redirect to login page
  redirect('/login');
  
  // This should never render
  return null;
}