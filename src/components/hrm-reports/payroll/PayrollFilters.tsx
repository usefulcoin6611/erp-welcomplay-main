'use client';

import { memo, useState } from 'react';
import { Search, RotateCcw, Download, FileDown, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PayrollFilters as Filters, PayrollFilterOptions } from './usePayrollData';

interface PayrollFiltersProps {
  filters: Filters;
  filterOptions: PayrollFilterOptions;
  onFilterChange: (filters: Filters) => void;
  onReset: () => void;
  onExport: () => void;
}

function PayrollFilters({ filters, filterOptions, onFilterChange, onReset, onExport }: PayrollFiltersProps) {
  const { branches, departments, employees } = filterOptions;
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card px-4 py-2">
      <div className="flex flex-col lg:flex-row lg:items-end gap-3">
        {/* Type Switch */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Type</Label>
          <ToggleGroup 
            type="single" 
            value={filters.type} 
            onValueChange={(value) => value && onFilterChange({ ...filters, type: value as 'monthly' | 'daily' })}
            className="justify-start"
          >
            <ToggleGroupItem value="monthly" className="h-9 px-3 text-sm cursor-pointer bg-gray-100 text-foreground hover:bg-blue-50 hover:text-blue-700 data-[state=on]:!bg-blue-500 data-[state=on]:!text-white hover:data-[state=on]:!bg-blue-600 data-[state=on]:hover:!text-white">
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem value="daily" className="h-9 px-3 text-sm cursor-pointer bg-gray-100 text-foreground hover:bg-blue-50 hover:text-blue-700 data-[state=on]:!bg-blue-500 data-[state=on]:!text-white hover:data-[state=on]:!bg-blue-600 data-[state=on]:hover:!text-white">
              Daily
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Month and Year */}
        {filters.type === 'monthly' && (
          <MonthYearSelector
            value={filters.month}
            onChange={(value) => onFilterChange({ ...filters, month: value })}
          />
        )}

        {/* Year */}
        {filters.type === 'daily' && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Year</Label>
            <Select value={filters.year} onValueChange={(value) => onFilterChange({ ...filters, year: value })}>
              <SelectTrigger className="h-9 text-sm w-full lg:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Branch */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Branch</Label>
          <Select value={filters.branchId || 'all'} onValueChange={(value) => onFilterChange({ ...filters, branchId: value })}>
            <SelectTrigger className="h-9 text-sm w-full lg:w-40">
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.value} value={branch.value}>
                  {branch.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Department</Label>
          <Select value={filters.departmentId || 'all'} onValueChange={(value) => onFilterChange({ ...filters, departmentId: value })}>
            <SelectTrigger className="h-9 text-sm w-full lg:w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Employee */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Employee</Label>
          <Select value={filters.employeeId || 'all'} onValueChange={(value) => onFilterChange({ ...filters, employeeId: value })}>
            <SelectTrigger className="h-9 text-sm w-full lg:w-40">
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.value} value={emp.value}>
                  {emp.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 lg:ml-auto">
          <Button size="sm" onClick={() => {}} className="h-9 bg-blue-500 hover:bg-blue-600">
            <Search className="w-4 h-4 mr-2" />
            Apply
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={onReset} className="h-9 w-9 p-0">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={() => {}} className="h-9 w-9 p-0 bg-blue-500 hover:bg-blue-600">
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={onExport} className="h-9 w-9 p-0">
                  <FileDown className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

// Month and Year Selector Component
const MonthYearSelector = memo(({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [tempMonth, setTempMonth] = useState(value.split('-')[1]);
  const [tempYear, setTempYear] = useState(value.split('-')[0]);

  const displayValue = (() => {
    const [year, month] = value.split('-');
    const monthName = new Date(2024, parseInt(month) - 1).toLocaleDateString('id-ID', { month: 'long' });
    return `${monthName} ${year}`;
  })();

  const handleSelect = () => {
    onChange(`${tempYear}-${tempMonth}`);
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">Month and Year</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-9 justify-start text-left font-normal"
          >
            <ChevronDown className="mr-2 h-4 w-4" />
            {displayValue}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Month</Label>
              <Select value={tempMonth} onValueChange={setTempMonth}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthNum = (i + 1).toString().padStart(2, '0');
                    const monthName = new Date(2024, i).toLocaleDateString('id-ID', { month: 'long' });
                    return (
                      <SelectItem key={monthNum} value={monthNum}>
                        {monthName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Year</Label>
              <Select value={tempYear} onValueChange={setTempYear}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="p-3 border-t">
            <Button 
              size="sm" 
              className="w-full h-8 bg-blue-500 hover:bg-blue-600"
              onClick={handleSelect}
            >
              Select
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});

MonthYearSelector.displayName = 'MonthYearSelector';

export default memo(PayrollFilters);
