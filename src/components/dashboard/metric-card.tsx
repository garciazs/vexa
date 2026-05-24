import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AnalyticsMetric } from "@/types";

interface MetricCardProps extends AnalyticsMetric {
  className?: string;
}

export function MetricCard({ label, value, change, trend, className }: MetricCardProps) {
  const isUp = trend === "up";

  return (
    <Card className={cn("glass", className)}>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-sm",
            isUp ? "text-green" : "text-danger"
          )}
        >
          {isUp ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          <span>{Math.abs(change)}%</span>
          <span className="text-muted-foreground">vs. mês anterior</span>
        </div>
      </CardContent>
    </Card>
  );
}
