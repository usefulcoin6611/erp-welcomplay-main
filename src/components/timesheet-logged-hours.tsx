"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { useProjectDashboard } from "@/contexts/project-dashboard-context";

export function TimesheetLoggedHours() {
  const t = useTranslations("projectDashboard.timesheetLoggedHours");
  const { data, loading } = useProjectDashboard();
  const chartData = data.timesheetLoggedHours.length
    ? data.timesheetLoggedHours
    : [{ day: "-", hours: 0, minutes: 0 }];

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>{t("title")}</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[240px] w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-white dark:bg-gray-900/50">
      <CardHeader className="p-6 pb-3">
        <CardTitle className="flex items-center justify-between w-full">
          <span className="text-base font-semibold">{t("title")}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 text-right">
            {t("subtitle")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-3 space-y-6">
        {/* Chart bars */}
        <TooltipProvider delayDuration={100}>
          <div className="space-y-4 py-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-4 group">
                <div className="w-12 text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                  {item.day}
                </div>
                <div className="flex-1 relative h-6">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-full bg-muted/20 rounded-lg overflow-hidden cursor-pointer">
                        <div
                          className="h-full bg-blue-500 rounded-md flex items-center justify-end pr-2 transition-all duration-300 group-hover:bg-blue-600"
                          style={{ width: `${Math.min(item.hours, 100)}%` }}
                        >
                          {item.hours > 10 && (
                            <span className="text-[10px] font-bold text-white tracking-wider">
                              {item.minutes}m
                            </span>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-white/95 backdrop-blur-sm border shadow-none px-3 py-1.5">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground mb-0.5">{item.day}</p>
                      <p className="text-xs font-bold">{item.minutes}m {t("hoursLogged")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>
        
        {/* Horizontal scale indicator */}
        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground/50 pl-16 pr-2 pt-2 border-t border-transparent uppercase tracking-widest">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </CardContent>
    </Card>
  );
}
