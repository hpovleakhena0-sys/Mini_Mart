import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  Edit,
  Trash2,
  Save,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Product, API_BASE_FULL_URL } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const addProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().min(0, "Stock must be 0 or greater"),
  min_stock: z.number().min(0, "Minimum stock must be 0 or greater"),
  price: z.number().min(0, "Price must be 0 or greater"),
  supplier: z.string().min(1, "Supplier is required"),
  description: z.string().optional(),
});

const editProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().min(0, "Stock must be 0 or greater"),
  min_stock: z.number().min(0, "Minimum stock must be 0 or greater"),
  price: z.number().min(0, "Price must be 0 or greater"),
  supplier: z.string().min(1, "Supplier is required"),
  description: z.string().optional(),
});

type AddProductFormData = z.infer<typeof addProductSchema>;
type EditProductFormData = z.infer<typeof editProductSchema>;

const categories = [
  "Beverages",
  "Staples",
  "Food",
  "Cooking",
  "Bakery",
  "Dairy",
  "Canned",
  "Personal Care",
  "Household",
];

const suppliers = [
  "Metro Distributor",
  "Rice Mill Corp",
  "Lucky Me Dist.",
  "Baguio Oil",
  "Nestle PH",
  "Gardenia",
  "Farm Fresh",
  "Alaska PH",
  "Mega Sardines",
  "Sugar Central",
];

export default function Inventory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  } = useProducts();

  const addForm = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      stock: 0,
      min_stock: 0,
      price: 0,
      supplier: "",
      description: "",
    },
  });

  const editForm = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      stock: 0,
      min_stock: 0,
      price: 0,
      supplier: "",
      description: "",
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Refresh products when component mounts to ensure latest data
  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file.",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
        });
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file.",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
        });
        return;
      }

      setEditSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEditImage = () => {
    setEditSelectedImage(null);
    setEditImagePreview(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const onAddSubmit = async (data: AddProductFormData) => {
    setAddLoading(true);
    try {
      console.log("Form data submitted:", data);

      // Create FormData for product creation with image
      const formData = new FormData();

      // Add text fields
      formData.append("name", data.name);
      formData.append("sku", data.sku);
      formData.append("category", data.category);
      formData.append("stock", data.stock.toString());
      formData.append("min_stock", data.min_stock.toString());
      formData.append("price", data.price.toString());
      formData.append("supplier", data.supplier);
      if (data.description) {
        formData.append("description", data.description);
      }

      // Add image file if selected
      if (selectedImage) {
        formData.append("image_upload", selectedImage);
      }

      console.log("FormData prepared with image:", !!selectedImage);

      // Send single request with FormData
      const response = await fetch(`${API_BASE_FULL_URL}/api/products/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add product");
      }

      const newProduct = await response.json();
      console.log("New product created:", newProduct);

      // Refresh products list to show the new product
      await refreshProducts();

      toast({
        title: "Success",
        description: "Product added successfully!",
      });

      // Reset form and close dialog
      setAddDialogOpen(false);
      addForm.reset();
      removeImage();
    } catch (err) {
      console.error("Add product error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setAddLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(id);
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product. Please try again.",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    editForm.reset({
      name: product.name,
      sku: product.sku || "",
      category: product.category,
      stock: product.stock,
      min_stock: product.min_stock || 0,
      price: Number(product.price), // Convert string price to number for form
      supplier: product.supplier || "",
      description: product.description || "",
    });
    setEditImagePreview(product.image || null);
    setEditSelectedImage(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
    setEditDialogOpen(true);
  };

  const onEditSubmit = async (data: EditProductFormData) => {
    if (!editingProduct) return;

    setEditLoading(true);
    try {
      console.log("Edit form data submitted:", data);

      // If there's a new image, use FormData
      if (editSelectedImage) {
        const formData = new FormData();

        // Add text fields
        formData.append("name", data.name);
        formData.append("sku", data.sku);
        formData.append("category", data.category);
        formData.append("stock", data.stock.toString());
        formData.append("min_stock", data.min_stock.toString());
        formData.append("price", data.price.toString());
        formData.append("supplier", data.supplier);
        if (data.description) {
          formData.append("description", data.description);
        }

        // Add new image file
        formData.append("image_upload", editSelectedImage);

        const response = await fetch(
          `${API_BASE_FULL_URL}/api/products/${editingProduct.id}/`,
          {
            method: "PUT",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to update product");
        }
      } else {
        // No new image, use regular update
        await updateProduct(editingProduct.id, data);
      }

      setEditDialogOpen(false);
      removeEditImage();

      // Force a complete refresh to ensure data consistency
      await refreshProducts();

      toast({
        title: "Product updated",
        description: "The product has been successfully updated.",
      });
    } catch (error) {
      console.error("Edit product error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product. Please try again.",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const lowStockItems = filteredProducts.filter(
    (item) => item.stock <= (item.min_stock || 0)
  ).length;

  const totalValue = filteredProducts.reduce(
    (sum, item) => sum + Number(item.price) * item.stock,
    0
  );

  const totalSold = filteredProducts.reduce(
    (sum, item) => sum + (item.stock - (item.stock + 0)), // This will be updated with actual sold data
    0
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading products...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-destructive mb-4">
            Error loading products: {error}
          </p>
          <Button onClick={() => refreshProducts()}>Retry</Button>
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
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground mt-1">
              Manage your product stock and supplies
            </p>
          </div>
          <button
            onClick={() => {
              addForm.reset();
              removeImage();
              setAddDialogOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 animate-slide-up">
          <Card variant="stat">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="stat-warning">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Low Stock Items
                  </p>
                  <p className="text-2xl font-bold">{lowStockItems}</p>
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
                    Total Stock Value
                  </p>
                  <p className="text-2xl font-bold">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card variant="elevated" className="animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Products</CardTitle>
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? "No products found matching your search."
                    : "No products available."}
                </div>
              ) : (
                paginatedProducts.map((item) => (
                  <Card key={item.id} variant="default" className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-sm">
                              {item.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              SKU: {item.sku || "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${Number(item.price).toFixed(2)}
                            </p>
                            <Badge
                              variant={
                                item.stock <= (item.min_stock || 0)
                                  ? "warning"
                                  : "success"
                              }
                              className="text-xs mt-1"
                            >
                              {item.stock} in stock
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{item.category}</span>
                          <span>{item.supplier || "N/A"}</span>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(item)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteProduct(item.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
              {renderPagination()}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  {searchQuery
                    ? "No products found matching your search."
                    : "No products available."}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.sku || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                item.stock <= (item.min_stock || 0)
                                  ? "warning"
                                  : "success"
                              }
                            >
                              {item.stock}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${Number(item.price).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.supplier || "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">0</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleEditProduct(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteProduct(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {renderPagination()}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Product Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the product details to add a new item to your inventory.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form
                onSubmit={addForm.handleSubmit(onAddSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter SKU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier} value={supplier}>
                                {supplier}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="min_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={addForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter product description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <FormLabel>Product Image</FormLabel>

                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="absolute -top-2 -right-2 rounded-full"
                        onClick={removeImage}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                        "hover:border-primary hover:bg-primary/5"
                      )}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload product image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    aria-label="Product image upload"
                  />
                </div>

                <div className="flex items-center justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAddDialogOpen(false);
                      addForm.reset();
                      removeImage();
                    }}
                    disabled={addLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addLoading}>
                    {addLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {addLoading ? "Saving..." : "Add Product"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the product information and save changes.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter SKU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier} value={supplier}>
                                {supplier}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="min_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter product description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <FormLabel>Product Image</FormLabel>

                  {editImagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={editImagePreview}
                        alt="Product preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="absolute -top-2 -right-2 rounded-full"
                        onClick={removeEditImage}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                        "hover:border-primary hover:bg-primary/5"
                      )}
                      onClick={() => editFileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload new product image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}

                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageSelect}
                    className="hidden"
                    aria-label="Product image upload"
                  />
                </div>

                <div className="flex items-center justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditDialogOpen(false);
                      removeEditImage();
                    }}
                    disabled={editLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editLoading}>
                    {editLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {editLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
