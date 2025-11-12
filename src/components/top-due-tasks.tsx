"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface DueTask {
  id: number;
  task: string;
  project: string;
  stage: "low" | "medium" | "high" | "critical";
  completion: string;
}

export function TopDueTasks() {
  const t = useTranslations("projectDashboard.topDueTasks");

  // Mock data matching the reference image
  const dueTasks: DueTask[] = [
    {
      id: 1,
      task: "Finish the logo design",
      project: "Website Builder",
      stage: "low",
      completion: "0%",
    },
    {
      id: 2,
      task: "Define users and workflow",
      project: "Website Launch",
      stage: "high",
      completion: "0%",
    },
    {
      id: 3,
      task: "Design Approval",
      project: "Website Builder",
      stage: "high",
      completion: "0%",
    },
    {
      id: 4,
      task: "Identify event sources by resource type",
      project: "Website Launch",
      stage: "medium",
      completion: "0%",
    },
    {
      id: 5,
      task: "Dashboard Issues",
      project: "Website Launch",
      stage: "critical",
      completion: "0%",
    },
  ];

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
    const labels = {
      low: t("low"),
      medium: t("medium"),
      high: t("high"),
      critical: t("critical"),
    };
    return labels[stage as keyof typeof labels] || stage;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dueTasks.length > 0 ? (
            dueTasks.map((task) => (
              <div key={task.id} className="grid grid-cols-12 gap-4 py-3">
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
