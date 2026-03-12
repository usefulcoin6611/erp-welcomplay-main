"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useProjectDashboard } from "@/contexts/project-dashboard-context";

export function TopDueTasks() {
  const t = useTranslations("projectDashboard.topDueTasks");
  const { data, loading } = useProjectDashboard();
  const dueTasks = data.topDueTasks;

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
      <Card>
        <CardHeader><CardTitle>{t("title")}</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dueTasks.length > 0 ? (
            dueTasks.map((task) => (
              <Link key={task.id} href={`/projects/task/${task.id}`} className="block hover:opacity-80">
              <div className="grid grid-cols-12 gap-4 py-3">
                <div className="col-span-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    {t("task")}:
                  </div>
                  <div className="font-semibold">{task.task}</div>
                </div>
                <div className="col-span-3">
                  <div className="text-xs text-muted-foreground mb-1">
                    {t("project")}:
                  </div>
                  <div className="font-semibold">{task.project}</div>
                </div>
                <div className="col-span-3">
                  <div className="text-xs text-muted-foreground mb-1">
                    {t("stage")}:
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${getPriorityColor(
                        task.stage
                      )}`}
                    />
                    <span className="font-semibold">
                      {getPriorityLabel(task.stage)}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground mb-1">
                    {t("completion")}:
                  </div>
                  <div className="font-semibold">{task.completion}</div>
                </div>
              </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("noTasks")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
