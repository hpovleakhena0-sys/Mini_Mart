import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sale } from "@/lib/api";

interface RecentSalesProps {
  sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <Card variant="elevated" className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Sales</span>
          <Badge variant="secondary" className="font-normal">
            Today
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sales.map((sale, index) => (
            <div
              key={sale.id}
              className={`flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors animate-slide-up delay-[${
                index * 50
              }ms]`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {typeof sale.customer === "object"
                      ? sale.customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "U"}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {typeof sale.customer === "object"
                      ? sale.customer.name
                      : "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {sale.quantity} items •{" "}
                    {new Date(sale.sale_date).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${sale.total_price.toFixed(2)}</p>
                <Badge
                  variant={
                    sale.payment_status === "completed"
                      ? "default"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {sale.payment_status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
