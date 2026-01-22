import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Store,
  Bell,
  Shield,
  Printer,
  Receipt,
  CreditCard,
  Save,
} from "lucide-react";

export default function Settings() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your POS system preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Store Information */}
          <Card variant="elevated" className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Store Information</CardTitle>
                  <CardDescription>Basic store details and branding</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input id="storeName" defaultValue="MiniMart Express" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="123 Main Street, Makati City" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue="+63 2 8123 4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue="store@minimart.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tin">Tax ID (TIN)</Label>
                <Input id="tin" defaultValue="123-456-789-000" />
              </div>
            </CardContent>
          </Card>

          {/* Receipt Settings */}
          <Card variant="elevated" className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Receipt className="w-5 h-5 text-success" />
                </div>
                <div>
                  <CardTitle>Receipt Settings</CardTitle>
                  <CardDescription>Customize receipt format and content</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiptHeader">Receipt Header</Label>
                <Input id="receiptHeader" defaultValue="Thank you for shopping!" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptFooter">Receipt Footer</Label>
                <Input id="receiptFooter" defaultValue="Please come again!" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Logo on Receipt</p>
                  <p className="text-sm text-muted-foreground">Display store logo at the top</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Print Receipt</p>
                  <p className="text-sm text-muted-foreground">Print after each transaction</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card variant="elevated" className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <CreditCard className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Configure accepted payment types</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cash Payments</p>
                  <p className="text-sm text-muted-foreground">Accept cash transactions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Credit/Debit Cards</p>
                  <p className="text-sm text-muted-foreground">Accept card payments</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">GCash</p>
                  <p className="text-sm text-muted-foreground">Accept GCash payments</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">PayMaya</p>
                  <p className="text-sm text-muted-foreground">Accept PayMaya payments</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card variant="elevated" className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Bell className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Alert and notification preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Low Stock Alerts</p>
                  <p className="text-sm text-muted-foreground">Notify when items are low</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Sales Summary</p>
                  <p className="text-sm text-muted-foreground">Email daily sales report</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Order Alerts</p>
                  <p className="text-sm text-muted-foreground">Sound on new transactions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Supplier Delivery Updates</p>
                  <p className="text-sm text-muted-foreground">Track incoming deliveries</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end animate-fade-in">
          <Button variant="default" size="lg">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
