"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useProjectDashboard } from "@/contexts/project-dashboard-context";
import { Input } from "@/components/ui/input";

export function TopDueTasks() {
  const t = useTranslations("projectDashboard.topDueTasks");
  const { data, loading } = useProjectDashboard();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");

  const allDueTasks = data.topDueTasks;
  const filteredDueTasks = allDueTasks.filter(t => 
    t.task.toLowerCase().includes(search.toLowerCase()) ||
    t.project.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredDueTasks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const dueTasks = filteredDueTasks.slice(startIndex, startIndex + pageSize);

  const getPriorityColor = (stage: string) => {
    const colors = {
      low: "bg-cyan-500",
      medium: "bg-green-500",
      high: "bg-orange-500",
      critical: "bg-pink-500",
    };
    return colors[stage as keyof typeof colors] || "bg-gray-500";
  };

  const getPriorityLabel = (stage: string) => {
    const labels: Record<string, string> = {
      low: t("low"),
      medium: t("medium"),
      high: t("high"),
      critical: t("critical"),
    };
    return labels[stage] || stage;
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-none">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-3"><Skeleton className="h-[200px] w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-white dark:bg-gray-900/50 flex flex-col h-full">
      <CardHeader className="p-6 pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
        <div className="relative w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-9 h-9 rounded-full border-0 bg-muted/40 shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="px-6 flex-1">
          <div className="divide-y divide-transparent">
            {dueTasks.length > 0 ? (
              dueTasks.map((task) => (
                <Link key={task.id} href={`/projects/task/${task.id}`} className="block group">
                  <div className="grid grid-cols-12 gap-4 py-4 transition-colors group-hover:bg-muted/30 -mx-6 px-6">
                    <div className="col-span-4 lg:col-span-5">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 mb-1">
                        {t("task")}
                      </div>
                      <div className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{task.task}</div>
                    </div>
                    <div className="col-span-3 lg:col-span-3">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 mb-1">
                        {t("project")}
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground truncate">{task.project}</div>
                    </div>
                    <div className="col-span-3 lg:col-span-2">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 mb-1">
                        {t("stage")}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${getPriorityColor(
                            task.stage
                          )}`}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-wide">
                          {getPriorityLabel(task.stage)}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 lg:col-span-2 text-right lg:text-left">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 mb-1">
                        {t("completion")}
                      </div>
                      <div className="text-xs font-bold text-cyan-600">{task.completion}</div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <span className="text-xs font-medium italic">{t("noTasks")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="p-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {filteredDueTasks.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + pageSize, filteredDueTasks.length)} OF {filteredDueTasks.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
