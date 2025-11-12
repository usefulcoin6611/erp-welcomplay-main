"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

export function TimesheetLoggedHours() {
  const t = useTranslations("projectDashboard.timesheetLoggedHours");

  // Mock data for last 7 days
  const data = [
    { day: "Sun", hours: 40 },
    { day: "Mon", hours: 90 },
    { day: "Tue", hours: 50 },
    { day: "Wed", hours: 80 },
    { day: "Thu", hours: 50 },
    { day: "Fri", hours: 60 },
    { day: "Sat", hours: 30 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("title")}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {t("subtitle")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart bars */}
        <TooltipProvider>
          <div className="space-y-3 py-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-10 text-sm text-muted-foreground">
                  {item.day}
                </div>
                <div className="flex-1 relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-5 bg-muted rounded-md overflow-hidden cursor-pointer">
                        <div
                          className="h-full bg-cyan-500 rounded-md flex items-center justify-end pr-2 transition-all hover:bg-cyan-600"
                          style={{ width: `${item.hours}%` }}
                        >
                          <span className="text-xs font-medium text-white">
                            {item.hours}
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{item.day}</p>
                      <p className="text-sm">{item.hours} {t("hoursLogged")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>
        
        {/* Horizontal scale indicator */}
        <div className="flex justify-between text-xs text-muted-foreground pl-14 pr-4 pt-2">
          <span>0</span>
          <span>20</span>
          <span>40</span>
          <span>60</span>
          <span>80</span>
        </div>
      </CardContent>
    </Card>
  );
}
