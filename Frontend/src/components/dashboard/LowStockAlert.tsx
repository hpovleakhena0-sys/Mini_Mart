import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface LowStockItem {
  name: string;
  stock: number;
  min_stock: number;
  category: string;
}

interface LowStockAlertProps {
  items: LowStockItem[];
}

export function LowStockAlert({ items }: LowStockAlertProps) {
  return (
    <Card variant="elevated" className="animate-slide-up border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-warning">
          <AlertTriangle className="w-5 h-5" />
          Low Stock Alert
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.name}
              className={`flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20 animate-[slideUp_0.4s_ease-out_${
                index * 50
              }ms_forwards]`}
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.category}</p>
              </div>
              <div className="text-right">
                <Badge
                  variant="outline"
                  className="border-warning text-warning"
                >
                  {item.stock} left
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Min: {item.min_stock}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
