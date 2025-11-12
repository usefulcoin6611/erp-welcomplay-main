import { redirect } from 'next/navigation';

export default function RootPage() {
  // Force redirect to HRM dashboard
  redirect('/hrm-dashboard');
  
  // This should never render
  return null;
}