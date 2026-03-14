"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import { useProjectDashboard } from "@/contexts/project-dashboard-context";

export function TasksOverview() {
  const t = useTranslations("projectDashboard.tasksOverview");
  const { data, loading } = useProjectDashboard();
  const chartData = data.tasksOverview.length ? data.tasksOverview : [{ day: "-", tasks: 0 }];

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>{t("title")}</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-0 shadow-none bg-white dark:bg-gray-900/50">
      <CardHeader className="p-6 pb-3">
        <CardTitle className="flex items-center justify-between w-full">
          <span className="text-base font-semibold">{t("title")}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 text-right">
            {t("subtitle")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 500 }}
                className="text-muted-foreground"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 500 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  borderRadius: '8px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: 'none',
                  fontSize: '12px'
                }} 
              />
              <Area
                type="monotone"
                dataKey="tasks"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTasks)"
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
