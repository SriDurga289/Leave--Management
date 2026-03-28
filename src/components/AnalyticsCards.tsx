import { useQuery } from "@tanstack/react-query";
import { leaveApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, CheckCircle, XCircle } from "lucide-react";

const AnalyticsCards = () => {
  const { data } = useQuery({
    queryKey: ["leaveAnalytics"],
    queryFn: () => leaveApi.getAnalytics(),
  });

  const stats = [
    { label: "Total Leaves", value: data?.totalLeaves ?? 0, icon: CalendarDays, color: "text-primary" },
    { label: "Pending", value: data?.pending ?? 0, icon: Clock, color: "text-warning" },
    { label: "Approved", value: data?.approved ?? 0, icon: CheckCircle, color: "text-accent" },
    { label: "Rejected", value: data?.rejected ?? 0, icon: XCircle, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            <s.icon className={`h-5 w-5 ${s.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-card-foreground">{s.value}</div>
          </CardContent>
        </Card>
      ))}
      {data?.byType && (
        <Card className="sm:col-span-2 lg:col-span-4 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leaves by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(data.byType).map(([type, count]) => (
                <div key={type} className="flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
                  <span>{type}</span>
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsCards;
