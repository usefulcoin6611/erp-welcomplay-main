import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconCalendar, IconPlus, IconSearch } from "@tabler/icons-react"

const timesheets = [
  { id: 1, project: "Implementasi ERP PT Maju Jaya", task: "Setup Chart of Accounts", date: "2025-10-02", time: "04:30", user: "Budi" },
  { id: 2, project: "Implementasi ERP PT Maju Jaya", task: "Migrasi Data Awal", date: "2025-10-05", time: "06:00", user: "Sari" },
] as const

const CARD_STYLE = "shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]"

export default function TimesheetListPage() {
  const totalHours = "10:30"

  return (
    <>
      {/* Title card - acuan /hrm/assets */}
      <Card className={CARD_STYLE}>
        <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
          <div className="min-w-0 space-y-1 flex-1">
            <CardTitle className="text-2xl font-semibold">Timesheet List</CardTitle>
            <CardDescription>
              Kelola timesheet per project dan task. Lihat jam kerja yang tercatat. Sesuai reference-erp Timesheet List.
            </CardDescription>
          </div>
          <Button size="sm" className="h-9 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200">
            <IconPlus className="mr-2 h-4 w-4" />
            Add Timesheet
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={CARD_STYLE}>
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pt-0">
            <div className="text-2xl font-bold">{timesheets.length}</div>
          </CardContent>
        </Card>
        <Card className={CARD_STYLE}>
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pt-0">
            <div className="text-2xl font-bold">{totalHours}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table card - padding konsisten px-6 */}
      <Card className={CARD_STYLE}>
        <CardHeader className="px-6 flex flex-row items-center justify-between gap-4 space-y-0 py-3.5">
          <CardTitle className="text-base font-medium">Timesheet List</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search project or task..."
                className="h-9 pl-9 bg-gray-50 border-0 shadow-none focus-visible:border-0 focus-visible:ring-0 hover:bg-gray-100"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 px-3 shadow-none bg-gray-50 hover:bg-gray-100 border-gray-200">
              <IconCalendar className="mr-2 h-4 w-4" />
              Week
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Project</TableHead>
                  <TableHead className="px-6">Task</TableHead>
                  <TableHead className="px-6">Date</TableHead>
                  <TableHead className="px-6">User</TableHead>
                  <TableHead className="px-6 text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheets.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="px-6">{row.project}</TableCell>
                    <TableCell className="px-6">{row.task}</TableCell>
                    <TableCell className="px-6">{row.date}</TableCell>
                    <TableCell className="px-6">{row.user}</TableCell>
                    <TableCell className="px-6 text-right font-medium">{row.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
