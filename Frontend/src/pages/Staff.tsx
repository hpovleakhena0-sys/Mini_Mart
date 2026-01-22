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
  UserCog,
  Shield,
  Clock,
  Edit,
  Trash2,
  Mail,
  Phone,
  MoreHorizontal,
} from "lucide-react";
import { useStaff } from "@/hooks/useStaff";
import { useNavigate } from "react-router-dom";

export default function Staff() {
  const navigate = useNavigate();
  const { staff, loading } = useStaff();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStaff = staff.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.status === "active").length;
  const managers = staff.filter((s) => s.role === "manager").length;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "manager":
        return "default";
      case "accountant":
        return "warning";
      case "inventory":
        return "secondary";
      default:
        return "success";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Staff Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage staff accounts and permissions
            </p>
          </div>
          <Button variant="default" onClick={() => navigate("/add-staff")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 animate-slide-up">
          <Card variant="stat">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <UserCog className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-bold">{totalStaff}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat-success">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <Clock className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Now</p>
                  <p className="text-2xl font-bold">{activeStaff}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat-accent">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Managers</p>
                  <p className="text-2xl font-bold">{managers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card variant="elevated" className="animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Staff Directory</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
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
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {staff.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {staff.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {staff.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(staff.role)}>
                        {staff.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {staff.department}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          staff.status === "active" ? "success" : "secondary"
                        }
                      >
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {staff.last_login
                        ? new Date(staff.last_login).toLocaleString()
                        : "Never"}
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
      </div>
    </MainLayout>
  );
}
