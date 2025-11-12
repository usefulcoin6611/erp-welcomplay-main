"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";

export function TasksOverview() {
  const t = useTranslations("projectDashboard.tasksOverview");

  // Mock data for last 7 days completed tasks
  const data = [
    { day: "Mon", tasks: 12 },
    { day: "Tue", tasks: 18 },
    { day: "Wed", tasks: 15 },
    { day: "Thu", tasks: 22 },
    { day: "Fri", tasks: 28 },
    { day: "Sat", tasks: 20 },
    { day: "Sun", tasks: 14 },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("title")}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {t("subtitle")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="tasks"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorTasks)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
