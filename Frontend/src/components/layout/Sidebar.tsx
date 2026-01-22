import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileBarChart,
  UserCog,
  CreditCard,
  Truck,
  Settings,
  Store,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Point of Sale", href: "/sales", icon: ShoppingCart },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Reports", href: "/reports", icon: FileBarChart },
  { name: "Staff", href: "/staff", icon: UserCog },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <Store className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">MiniMart</h1>
          <p className="text-xs text-sidebar-muted">POS System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-sidebar-primary")} />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary animate-pulse-soft" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-semibold text-sidebar-foreground">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
            <p className="text-xs text-sidebar-muted truncate">Cashier</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-muted hover:text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
