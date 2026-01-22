import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useSuppliers } from "@/hooks/useSuppliers";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contact_person: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(15, "Phone number must be at most 15 characters"),
  address: z.string().optional(),
  status: z.enum(["active", "pending", "inactive"]).default("active"),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

const statuses = ["active", "pending", "inactive"];

export default function AddSupplier() {
  const navigate = useNavigate();
  const { addSupplier } = useSuppliers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
    },
  });

  const onSubmit = async (data: SupplierFormData) => {
    setIsSubmitting(true);
    try {
      await addSupplier({
        name: data.name,
        contact_person: data.contact_person,
        email: data.email,
        phone: data.phone,
        address: data.address || "",
        status: data.status,
      });
      toast({
        title: "Supplier Added Successfully",
        description: `${data.name} has been added to your supplier list.`,
      });
      navigate("/suppliers?refresh=true");
    } catch (error) {
      console.error("Failed to add supplier:", error);
      toast({
        title: "Error",
        description: "Failed to add supplier. Please try again.",
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
            onClick={() => navigate("/suppliers")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Supplier</h1>
            <p className="text-muted-foreground mt-1">
              Add a new supplier to your database
            </p>
          </div>
        </div>

        {/* Form */}
        <Card variant="elevated" className="animate-slide-up">
          <CardHeader>
            <CardTitle>Supplier Details</CardTitle>
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
                        <FormLabel>Supplier Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter supplier name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter contact person name"
                            {...field}
                          />
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

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter supplier address"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/suppliers")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Supplier"}
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
