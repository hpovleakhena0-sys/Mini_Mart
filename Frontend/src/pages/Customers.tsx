import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Plus,
  Users,
  ShoppingBag,
  TrendingUp,
  Edit,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";

export default function Customers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customers, loading, error, deleteCustomer, refreshCustomers } =
    useCustomers();
  const [searchQuery, setSearchQuery] = useState("");
  const [lastAction, setLastAction] = useState<string>("");
  const { toast } = useToast();

  // Check for refresh query parameter
  const urlParams = new URLSearchParams(location.search);
  const shouldRefresh = urlParams.get("refresh") === "true";

  // Refresh customers when navigating to this page or after adding a customer
  useEffect(() => {
    if (location.pathname === "/customers") {
      if (shouldRefresh) {
        // Remove the refresh parameter from URL without triggering a reload
        const newUrl = location.pathname;
        window.history.replaceState({}, "", newUrl);
        refreshCustomers();
      } else {
        refreshCustomers();
      }
    }
  }, [location.pathname, refreshCustomers, lastAction, shouldRefresh]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    // Note: For real-time search, you might want to implement debounced search
    // For now, we'll filter locally or use API search on enter
  };

  const handleDeleteCustomer = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteCustomer(id);
        toast({
          title: "Customer Deleted",
          description: "The customer has been successfully removed.",
        });
      } catch (err) {
        console.error("Failed to delete customer:", err);
        toast({
          title: "Error",
          description: "Failed to delete customer. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditCustomer = (id: number) => {
    navigate(`/customers/edit/${id}`);
  };

  // Function to refresh customers list
  const handleRefresh = () => {
    setLastAction(`refresh-${Date.now()}`);
    refreshCustomers();
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (c) => c.status !== "inactive"
  ).length;
  const vipCustomers = customers.filter((c) => c.status === "vip").length;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive">Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground mt-1">
              Manage customer profiles and purchase history
            </p>
          </div>
          <Button variant="default" onClick={() => navigate("/customers/add")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 animate-slide-up">
          <Card variant="stat">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold">{totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat-success">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <ShoppingBag className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Customers
                  </p>
                  <p className="text-2xl font-bold">{activeCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat-accent">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">VIP Customers</p>
                  <p className="text-2xl font-bold">{vipCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card variant="elevated" className="animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customer List</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {customer.total_purchases}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${customer.total_spent.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.last_visit || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          customer.status === "vip"
                            ? "warning"
                            : customer.status === "active"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEditCustomer(customer.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
