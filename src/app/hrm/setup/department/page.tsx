'use client';

import { useRef, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import DepartmentTab, { type DepartmentTabRef } from '@/components/hrm-setup/department-tab';

const CARD_STYLE =
  'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white rounded-lg';

/**
 * Layout sama seperti Branch: judul + breadcrumb (kiri), konten tabel di bawah.
 */
export default function ManageDepartmentPage() {
  const [departmentCount, setDepartmentCount] = useState<number | null>(null);
  const departmentTabRef = useRef<DepartmentTabRef>(null);

  return (
    <>
      <Card className={CARD_STYLE}>
        <CardContent className="px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Total Departments
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {departmentCount ?? '-'}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              className="h-8 px-4 shadow-none bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => departmentTabRef.current?.openCreate()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </div>
        </CardContent>
      </Card>
      <DepartmentTab ref={departmentTabRef} onCountChange={setDepartmentCount} />
    </>
  );
}
