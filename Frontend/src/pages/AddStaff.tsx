import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useStaff } from "@/hooks/useStaff";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const staffSchema = z.object({
  name: z.string().min(1, "Staff name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(15, "Phone number must be at most 15 characters"),
  department: z.string().optional(),
  role: z
    .enum(["manager", "cashier", "inventory", "accountant"])
    .default("cashier"),
  status: z.enum(["active", "inactive"]).default("active"),
});

type StaffFormData = z.infer<typeof staffSchema>;

const roles = ["manager", "cashier", "inventory", "accountant"];
const statuses = ["active", "inactive"];

export default function AddStaff() {
  const navigate = useNavigate();
  const { addStaff } = useStaff();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      department: "",
      role: "cashier",
      status: "active",
    },
  });

  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    try {
      await addStaff({
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department || "",
        role: data.role,
        status: data.status,
      });
      toast({
        title: "Staff Added Successfully",
        description: `${data.name} has been added to your staff list.`,
      });
      navigate("/staff?refresh=true");
    } catch (error) {
      console.error("Failed to add staff:", error);
      toast({
        title: "Error",
        description: "Failed to add staff. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 animate-fade-in">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/staff")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Staff</h1>
            <p className="text-muted-foreground mt-1">
              Add a new staff member to your database
            </p>
          </div>
        </div>

        {/* Form */}
        <Card variant="elevated" className="animate-slide-up">
          <CardHeader>
            <CardTitle>Staff Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter staff name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter phone number"
                            maxLength={15}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter department" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/staff")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Staff"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
