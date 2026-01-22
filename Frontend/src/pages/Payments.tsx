import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  CreditCard,
  Banknote,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
} from "lucide-react";
import { usePaymentContext } from "@/hooks/usePaymentContext";

interface Payment {
  id: string;
  transaction_id: string;
  order_id: string;
  customer: string;
  amount: number;
  method: string;
  status: string;
  payment_date: string;
}

export default function Payments() {
  const { payments } = usePaymentContext();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPayments = payments.filter(
    (payment) =>
      payment.transaction_id
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPayments = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const failedPayments = payments.filter((p) => p.status === "failed").length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getMethodIcon = (method: string) => {
    if (method === "Cash") return <Banknote className="w-4 h-4" />;
    return <CreditCard className="w-4 h-4" />;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground mt-1">
              Track all payment transactions
            </p>
          </div>
          <Button variant="default">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 animate-slide-up">
          <Card variant="stat-success">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Received
                  </p>
                  <p className="text-2xl font-bold">
                    ${totalPayments.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat-warning">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">{failedPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card variant="elevated" className="animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction History</CardTitle>
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredPayments.map((payment) => (
                <Card key={payment.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-sm">
                        {payment.customer}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {payment.order_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${payment.amount.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getMethodIcon(payment.method)}
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "success"
                              : payment.status === "pending"
                              ? "warning"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{payment.id}</span>
                    <span>{payment.payment_date}</span>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
              {filteredPayments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions found</p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.id}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.order_id}
                      </TableCell>
                      <TableCell>{payment.customer}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(payment.method)}
                          <span>{payment.method}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <Badge
                            variant={
                              payment.status === "completed"
                                ? "success"
                                : payment.status === "pending"
                                ? "warning"
                                : "destructive"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.payment_date}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon-sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredPayments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions found</p>
                  <p className="text-sm mt-2">
                    Payments will appear here after successful transactions
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
