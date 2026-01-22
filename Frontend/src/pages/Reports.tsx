import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileBarChart,
  Download,
  TrendingUp,
  Package,
  CreditCard,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { reportsApi, ReportsData } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const reportTypes = [
  {
    title: "Sales Report",
    description: "Daily, weekly, and monthly sales analytics",
    icon: TrendingUp,
    color: "success",
  },
  {
    title: "Inventory Report",
    description: "Stock levels, movements, and valuation",
    icon: Package,
    color: "warning",
  },
  {
    title: "Payment Report",
    description: "Transaction summaries and payment methods",
    icon: CreditCard,
    color: "default",
  },
  {
    title: "Customer Report",
    description: "Customer analytics and purchase patterns",
    icon: Users,
    color: "accent",
  },
];

export default function Reports() {
  const {
    data: reportsData,
    isLoading,
    error,
  } = useQuery<ReportsData>({
    queryKey: ["reports"],
    queryFn: reportsApi.getReports,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground mt-1">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-red-500 mt-1">
              {error.message || "Failed to load reports"}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const metrics = reportsData
    ? [
        {
          label: "Revenue",
          value: `$${reportsData.metrics.revenue.total.toLocaleString()}`,
          change: `+${(
            (reportsData.metrics.revenue.today /
              reportsData.metrics.revenue.week) *
              100 -
            100
          ).toFixed(1)}%`,
          positive: true,
        },
        {
          label: "Orders",
          value: reportsData.metrics.orders.total.toString(),
          change: `+${(
            (reportsData.metrics.orders.today /
              reportsData.metrics.orders.week) *
              100 -
            100
          ).toFixed(1)}%`,
          positive: true,
        },
        {
          label: "Avg. Order Value",
          value: `$${reportsData.metrics.avg_order_value.toFixed(2)}`,
          change: "+0%", // Placeholder
          positive: true,
        },
        {
          label: "New Customers",
          value: reportsData.metrics.customers.new_today.toString(),
          change: `+${(
            (reportsData.metrics.customers.new_today /
              reportsData.metrics.customers.new_week) *
              100 -
            100
          ).toFixed(1)}%`,
          positive: true,
        },
      ]
    : [];
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground mt-1">
              Generate and download business reports
            </p>
          </div>
          <Button variant="default">
            <FileBarChart className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Quick Metrics */}
        <div className="grid gap-4 md:grid-cols-4 animate-slide-up">
          {metrics.map((metric, index) => (
            <Card
              key={metric.label}
              variant="elevated"
              className={`delay-${index * 50}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      metric.positive ? "text-success" : "text-destructive"
                    }`}
                  >
                    {metric.positive ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {metric.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Types */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          {reportTypes.map((report, index) => {
            const Icon = report.icon;
            const colorMap: Record<string, string> = {
              success: "bg-success/10 text-success",
              warning: "bg-warning/10 text-warning",
              default: "bg-primary/10 text-primary",
              accent: "bg-accent/10 text-accent",
            };

            return (
              <Card
                key={report.title}
                variant="interactive"
                className={`cursor-pointer delay-${index * 50}`}
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl ${
                      colorMap[report.color]
                    } flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {report.description}
                  </p>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Reports */}
        <Card variant="elevated" className="animate-slide-up">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>
              Previously generated reports available for download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportsData?.recent_reports.map((report, index) => (
                <div
                  key={report.name}
                  className={`flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors delay-${
                    index * 50
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileBarChart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="secondary">{report.type}</Badge>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {report.date}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
