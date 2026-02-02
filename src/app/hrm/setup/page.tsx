'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * reference-erp: menu "HRM System Setup" links to route('branch.index') = /branch.
 * So default HRM System Setup is Branch page. Redirect /hrm/setup → /hrm/setup/branch.
 */
export default function HRMSetupRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/hrm/setup/branch');
  }, [router]);
  return null;
}
