'use client';

import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import DepartmentTab from '@/components/hrm-setup/department-tab';

const CARD_STYLE =
  'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white rounded-lg';

/**
 * Layout sama seperti Branch: judul + breadcrumb (kiri), konten tabel di bawah.
 */
export default function ManageDepartmentPage() {
  return (
    <>
      <Card className={CARD_STYLE}>
        <CardContent className="px-6 py-4">
          <div>
            <h4 className="mb-2 text-xl font-semibold">Manage Department</h4>
            <Breadcrumb>
              <BreadcrumbList className="text-muted-foreground">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Department</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </CardContent>
      </Card>
      <DepartmentTab />
    </>
  );
}
