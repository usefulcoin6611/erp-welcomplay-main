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
import { Plus, Building2 } from 'lucide-react';
import BranchTab, { type BranchTabRef } from '@/components/hrm-setup/branch-tab';

const CARD_STYLE =
  'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white rounded-lg';

/**
 * Layout sesuai gambar:
 * - Judul "Manage Branch" + breadcrumb Dashboard > Branch (kiri), tombol Create hijau (kanan)
 * - Satu card: pagination "10 entries per page" + Search "Search..." di dalam card, tabel BRANCH | ACTION, empty "No entries found"
 */
export default function ManageBranchPage() {
  const branchTabRef = useRef<BranchTabRef>(null);
  const [branchCount, setBranchCount] = useState<number | null>(null);

  return (
    <>
      {/* Header: Manage Branch + breadcrumb (kiri), Create hijau (kanan) - di luar card */}
      <Card className={CARD_STYLE}>
        <CardContent className="px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div>
                <h4 className="mb-2 text-xl font-semibold">Manage Branch</h4>
                <Breadcrumb>
                  <BreadcrumbList className="text-muted-foreground">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Branch</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Total Branches
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {branchCount ?? '-'}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              className="h-8 px-4 shadow-none bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => branchTabRef.current?.openCreate()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Branch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Satu card: pagination + Search di dalam card, tabel BRANCH | ACTION, No entries found */}
      <BranchTab ref={branchTabRef} variant="page" onCountChange={setBranchCount} />
    </>
  );
}
