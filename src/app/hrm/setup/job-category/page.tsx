'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BriefcaseBusiness, Plus, Search } from 'lucide-react';

const CARD_STYLE =
  'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white rounded-lg';

export default function ManageJobCategoryPage() {
  const total = 0;

  return (
    <>
      <Card className={CARD_STYLE}>
        <CardContent className="px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div>
                <h4 className="mb-2 text-xl font-semibold">Manage Job Category</h4>
                <Breadcrumb>
                  <BreadcrumbList className="text-muted-foreground">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Job Category</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BriefcaseBusiness className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Total Job Categories
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {total || '-'}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              className="h-8 px-4 shadow-none bg-blue-500 text-white hover:bg-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Job Category
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={CARD_STYLE}>
        <CardContent className="space-y-4 px-2 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200/80 pb-3 px-2">
            <div className="text-sm text-muted-foreground">Showing 0 entries</div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search job categories..."
                className="h-9 pl-9 pr-3 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
              />
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Name</TableHead>
                  <TableHead className="w-[40%] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    No entries found
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
