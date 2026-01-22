import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "accent";
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  const variantMap = {
    default: "stat",
    success: "stat-success",
    warning: "stat-warning",
    accent: "stat-accent",
  } as const;

  const iconBgMap = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <Card variant={variantMap[variant]} className="animate-fade-in">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {change && (
              <p
                className={cn(
                  "text-sm font-medium",
                  changeType === "positive" && "text-success",
                  changeType === "negative" && "text-destructive",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", iconBgMap[variant])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </Card>
  );
}
