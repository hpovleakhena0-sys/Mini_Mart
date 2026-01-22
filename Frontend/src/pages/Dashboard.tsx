import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi, DashboardData } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const {
    data: dashboardData,
    isLoading: loading,
    error,
  } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.getDashboard,
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-red-500 mt-1">
              {error.message || "Failed to load dashboard data"}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!dashboardData) return null;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Sales"
            value={`$${dashboardData.today_sales.toFixed(2)}`}
            change="+12.5% from yesterday" // TODO: calculate actual change
            changeType="positive"
            icon={DollarSign}
            variant="success"
          />
          <StatCard
            title="Transactions"
            value={dashboardData.transactions.toString()}
            change="+8 from yesterday" // TODO: calculate actual change
            changeType="positive"
            icon={ShoppingCart}
            variant="default"
          />
          <StatCard
            title="Products in Stock"
            value={dashboardData.products_in_stock.toString()}
            change={`${dashboardData.low_stock_count} low stock items`}
            changeType="negative"
            icon={Package}
            variant="warning"
          />
          <StatCard
            title="Active Customers"
            value={dashboardData.active_customers.toString()}
            change="+23 this week" // TODO: calculate actual change
            changeType="positive"
            icon={Users}
            variant="accent"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentSales sales={dashboardData.recent_sales} />
          <LowStockAlert items={dashboardData.low_stock_items} />
        </div>

        {/* Quick Actions */}
        <Card variant="elevated" className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Today's Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-success/10 text-center">
                <p className="text-2xl font-bold text-success">
                  {dashboardData.payment_success_rate.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Payment Success Rate
                </p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 text-center">
                <p className="text-2xl font-bold text-primary">
                  ${dashboardData.avg_transaction_value.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Avg. Transaction Value
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 text-center">
                <p className="text-2xl font-bold text-accent">
                  {dashboardData.avg_checkout_time.toFixed(1)} min
                </p>
                <p className="text-sm text-muted-foreground">
                  Avg. Checkout Time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
