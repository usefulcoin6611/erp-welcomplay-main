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
import { Briefcase, Plus } from 'lucide-react';
import DesignationTab, { type DesignationTabRef } from '@/components/hrm-setup/designation-tab';

const CARD_STYLE =
  'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white rounded-lg';

/**
 * Layout sama seperti Branch: judul + breadcrumb (kiri).
 */
export default function ManageDesignationPage() {
  const [designationCount, setDesignationCount] = useState<number | null>(null);
  const designationTabRef = useRef<DesignationTabRef>(null);

  return (
    <>
      <Card className={CARD_STYLE}>
        <CardContent className="px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div>
                <h4 className="mb-2 text-xl font-semibold">Manage Designation</h4>
                <Breadcrumb>
                  <BreadcrumbList className="text-muted-foreground">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Designation</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Total Designations
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {designationCount ?? '-'}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              className="h-8 px-4 shadow-none bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => designationTabRef.current?.openCreate()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Designation
            </Button>
          </div>
        </CardContent>
      </Card>
      <DesignationTab ref={designationTabRef} onCountChange={setDesignationCount} />
    </>
  );
}
