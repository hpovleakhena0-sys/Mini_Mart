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
  Plus,
  Truck,
  Package,
  Calendar,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useNavigate } from "react-router-dom";

const deliveriesData = [
  {
    id: "DEL-001",
    supplier: "Metro Distributor",
    items: 120,
    status: "delivered",
    date: "2024-01-15",
  },
  {
    id: "DEL-002",
    supplier: "Nestle PH",
    items: 85,
    status: "delivered",
    date: "2024-01-15",
  },
  {
    id: "DEL-003",
    supplier: "Gardenia",
    items: 50,
    status: "in-transit",
    date: "2024-01-16",
  },
  {
    id: "DEL-004",
    supplier: "Rice Mill Corp",
    items: 30,
    status: "pending",
    date: "2024-01-17",
  },
];

export default function Suppliers() {
  const navigate = useNavigate();
  const { suppliers, loading } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact_person.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-muted-foreground mt-1">
              Manage suppliers and track deliveries
            </p>
          </div>
          <Button variant="default" onClick={() => navigate("/add-supplier")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 animate-slide-up">
          <Card variant="stat">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Suppliers
                  </p>
                  <p className="text-2xl font-bold">{suppliers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat-success">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <Package className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Deliveries This Week
                  </p>
                  <p className="text-2xl font-bold">{deliveriesData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat-warning">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Calendar className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Deliveries
                  </p>
                  <p className="text-2xl font-bold">
                    {
                      deliveriesData.filter((d) => d.status === "pending")
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Suppliers Table */}
          <Card variant="elevated" className="lg:col-span-2 animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Supplier List</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search suppliers..."
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
                    <TableHead>Supplier</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {supplier.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{supplier.contact_person}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {supplier.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            supplier.status === "active" ? "success" : "warning"
                          }
                        >
                          {supplier.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon-sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
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

          {/* Recent Deliveries */}
          <Card variant="elevated" className="animate-slide-up">
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveriesData.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="p-3 rounded-lg bg-secondary/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{delivery.id}</span>
                      <Badge
                        variant={
                          delivery.status === "delivered"
                            ? "success"
                            : delivery.status === "in-transit"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {delivery.status}
                      </Badge>
                    </div>
                    <p className="text-sm">{delivery.supplier}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{delivery.items} items</span>
                      <span>{delivery.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
